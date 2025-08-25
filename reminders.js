const express = require('express');
const Reminder = require('./Reminder');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id })
      .populate('prescriptionId')
      .sort({ 'nextDue.date': 1, 'nextDue.time': 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Fetch reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const reminders = await Reminder.find({
      userId: req.user._id,
      status: 'active',
      'schedule.isActive': true,
      'nextDue.date': todayStr
    }).populate('prescriptionId');
    res.json(reminders);
  } catch (error) {
    console.error('Fetch today reminders error:', error);
    res.status(500).json({ error: "Failed to fetch today's reminders" });
  }
});

router.get('/overdue', async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    const reminders = await Reminder.find({
      userId: req.user._id,
      status: 'active',
      'schedule.isActive': true,
      $or: [
        { 'nextDue.date': { $lt: todayStr } },
        { 'nextDue.date': todayStr, 'nextDue.time': { $lt: currentTime } }
      ]
    }).populate('prescriptionId');
    res.json(reminders);
  } catch (error) {
    console.error('Fetch overdue reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue reminders' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { medicineName, dosage, instructions, schedule, notifications } = req.body;
    const reminder = new Reminder({
      userId: req.user._id,
      medicineName,
      dosage,
      instructions,
      schedule: {
        type: schedule.type || 'daily',
        times: schedule.times || [{ time: '08:00', label: 'morning' }],
        startDate: new Date(),
        endDate: schedule.endDate,
        isActive: true
      },
      notifications: {
        voice: notifications?.voice ?? true,
        text: notifications?.text ?? true,
        push: notifications?.push ?? true,
        advanceNotice: notifications?.advanceNotice ?? 5
      },
      status: 'active'
    });
    reminder.updateNextDue();
    await reminder.save();
    res.status(201).json({ message: 'Reminder created successfully', reminder });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

router.post('/:id/taken', async (req, res) => {
  try {
    const { time } = req.body;
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    const now = new Date();
    reminder.lastTaken = { date: now, time: time || now.toTimeString().split(' ')[0], confirmed: true };
    reminder.updateNextDue();
    await reminder.save();
    res.json({ message: 'Medicine marked as taken', reminder });
  } catch (error) {
    console.error('Mark taken error:', error);
    res.status(500).json({ error: 'Failed to mark medicine as taken' });
  }
});

router.post('/:id/missed', async (req, res) => {
  try {
    const { reason } = req.body;
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    const now = new Date();
    reminder.missedDoses.push({ date: now, time: reminder.nextDue.time, reason: reason || 'Forgot to take' });
    reminder.updateNextDue();
    await reminder.save();

    const io = req.app.get('io');
    if (io && req.user.familyId) {
      io.to(`family-${req.user.familyId}`).emit('medicine-missed', {
        userId: req.user._id,
        userName: req.user.name,
        medicineName: reminder.medicineName,
        time: reminder.nextDue.time,
        reason: reason
      });
    }

    res.json({ message: 'Medicine marked as missed', reminder });
  } catch (error) {
    console.error('Mark missed error:', error);
    res.status(500).json({ error: 'Failed to mark medicine as missed' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { medicineName, dosage, instructions, schedule, notifications, status } = req.body;
    const updateData = {};
    if (medicineName) updateData.medicineName = medicineName;
    if (dosage) updateData.dosage = dosage;
    if (instructions) updateData.instructions = instructions;
    if (schedule) updateData.schedule = { ...schedule };
    if (notifications) updateData.notifications = { ...notifications };
    if (status) updateData.status = status;
    const reminder = await Reminder.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updateData, { new: true, runValidators: true });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    if (schedule) { reminder.updateNextDue(); await reminder.save(); }
    res.json({ message: 'Reminder updated successfully', reminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    reminder.status = reminder.status === 'active' ? 'paused' : 'active';
    await reminder.save();
    res.json({ message: `Reminder ${reminder.status === 'active' ? 'resumed' : 'paused'}`, reminder });
  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({ error: 'Failed to toggle reminder' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const stats = await Reminder.aggregate([
      { $match: { userId: req.user._id } },
      { $group: {
        _id: null,
        totalReminders: { $sum: 1 },
        activeReminders: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        takenToday: { $sum: { $cond: [ { $and: [ { $gte: ['$lastTaken.date', today] }, { $eq: ['$lastTaken.confirmed', true] } ] }, 1, 0 ] } },
        missedThisWeek: { $sum: { $size: { $filter: { input: '$missedDoses', cond: { $gte: ['$$this.date', weekAgo] } } } } }
      } }
    ]);
    res.json(stats[0] || { totalReminders: 0, activeReminders: 0, takenToday: 0, missedThisWeek: 0 });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get reminder statistics' });
  }
});

module.exports = router;
