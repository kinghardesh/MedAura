const Reminder = require('./Reminder');

async function createRemindersFromPrescription(prescription, userId) {
  const reminders = [];
  for (const medicine of prescription.extractedMedicines) {
    const reminder = new Reminder({
      userId,
      prescriptionId: prescription._id,
      medicineName: medicine.name,
      dosage: medicine.dosage,
      instructions: medicine.instructions,
      schedule: { type: 'daily', times: generateTimeSlots(medicine.frequency.times), startDate: new Date(), endDate: calculateEndDate(medicine.duration), isActive: true },
      notifications: { voice: true, text: true, push: true, advanceNotice: 5 },
      status: 'active'
    });
    reminder.updateNextDue();
    reminders.push(reminder);
  }
  await Reminder.insertMany(reminders);
  return reminders;
}

function generateTimeSlots(frequency) {
  const slots = [];
  switch (frequency) {
    case 1: slots.push({ time: '08:00', label: 'morning' }); break;
    case 2: slots.push({ time: '08:00', label: 'morning' }, { time: '20:00', label: 'evening' }); break;
    case 3: slots.push({ time: '08:00', label: 'morning' }, { time: '14:00', label: 'afternoon' }, { time: '20:00', label: 'evening' }); break;
    case 4: slots.push({ time: '06:00', label: 'early morning' }, { time: '12:00', label: 'noon' }, { time: '18:00', label: 'evening' }, { time: '22:00', label: 'night' }); break;
    default: slots.push({ time: '08:00', label: 'morning' });
  }
  return slots;
}

function calculateEndDate(duration) {
  if (!duration || !duration.value) return null;
  const endDate = new Date();
  switch (duration.unit) {
    case 'days': endDate.setDate(endDate.getDate() + duration.value); break;
    case 'weeks': endDate.setDate(endDate.getDate() + (duration.value * 7)); break;
    case 'months': endDate.setMonth(endDate.getMonth() + duration.value); break;
    default: endDate.setDate(endDate.getDate() + 7);
  }
  return endDate;
}

module.exports = { createRemindersFromPrescription, generateTimeSlots, calculateEndDate };
