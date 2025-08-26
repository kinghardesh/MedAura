const express = require('express');
const Appointment = require('./Appointment');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      userId: req.user._id,
      appointmentDate: { $gte: now },
      status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Fetch upcoming appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming appointments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      doctorName,
      doctorSpecialization,
      hospital,
      appointmentDate,
      appointmentTime,
      duration,
      type,
      reason,
      notes,
      isRecurring,
      recurringPattern
    } = req.body;

    const appointment = new Appointment({
      userId: req.user._id,
      doctorName,
      doctorSpecialization,
      hospital,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration: duration || 30,
      type: type || 'consultation',
      reason,
      notes,
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : null
    });

    await appointment.save();

    if (isRecurring && recurringPattern) {
      const recurringAppointments = appointment.generateRecurringAppointments();
      if (recurringAppointments.length > 0) {
        await Appointment.insertMany(recurringAppointments);
        appointment.childAppointments = recurringAppointments.map(a => a._id);
        await appointment.save();
      }
    }

    res.status(201).json({ message: 'Appointment scheduled successfully', appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Fetch appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { doctorName, doctorSpecialization, hospital, appointmentDate, appointmentTime, duration, type, reason, notes, status } = req.body;
    const updateData = {};
    if (doctorName) updateData.doctorName = doctorName;
    if (doctorSpecialization) updateData.doctorSpecialization = doctorSpecialization;
    if (hospital) updateData.hospital = hospital;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (appointmentTime) updateData.appointmentTime = appointmentTime;
    if (duration) updateData.duration = duration;
    if (type) updateData.type = type;
    if (reason) updateData.reason = reason;
    if (notes) updateData.notes = notes;
    if (status) updateData.status = status;

    const appointment = await Appointment.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updateData, { new: true, runValidators: true });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.patch('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    appointment.status = 'cancelled';
    if (reason) appointment.notes = `${appointment.notes || ''}\nCancelled: ${reason}`;
    await appointment.save();
    if (appointment.childAppointments.length > 0) {
      await Appointment.updateMany({ _id: { $in: appointment.childAppointments } }, { status: 'cancelled' });
    }
    res.json({ message: 'Appointment cancelled successfully', appointment });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { newDate, newTime, reason } = req.body;
    const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    const oldDate = appointment.appointmentDate;
    const oldTime = appointment.appointmentTime;
    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.status = 'rescheduled';
    if (reason) {
      appointment.notes = `${appointment.notes || ''}\nRescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}. Reason: ${reason}`;
    }
    await appointment.save();
    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (appointment.childAppointments.length > 0) {
      await Appointment.deleteMany({ _id: { $in: appointment.childAppointments } });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const stats = await Appointment.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
        _id: null,
        totalAppointments: { $sum: 1 },
        upcomingAppointments: { $sum: { $cond: [ { $and: [ { $gte: ['$appointmentDate', now] }, { $in: ['$status', ['scheduled', 'confirmed']] } ] }, 1, 0 ] } },
        completedThisMonth: { $sum: { $cond: [ { $and: [ { $gte: ['$appointmentDate', monthStart] }, { $lt: ['$appointmentDate', nextMonthStart] }, { $eq: ['$status', 'completed'] } ] }, 1, 0 ] } },
        cancelledThisMonth: { $sum: { $cond: [ { $and: [ { $gte: ['$appointmentDate', monthStart] }, { $lt: ['$appointmentDate', nextMonthStart] }, { $eq: ['$status', 'cancelled'] } ] }, 1, 0 ] } }
      } }
    ]);
    res.json(stats[0] || { totalAppointments: 0, upcomingAppointments: 0, completedThisMonth: 0, cancelledThisMonth: 0 });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ error: 'Failed to get appointment statistics' });
  }
});

module.exports = router;
