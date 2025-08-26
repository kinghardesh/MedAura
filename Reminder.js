const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  medicineName: { type: String, required: true },
  dosage: { amount: String, unit: String },
  instructions: String,
  schedule: { type: { type: String, enum: ['daily','weekly','custom'], default: 'daily' }, times: [{ time: String, label: String }], daysOfWeek: [Number], startDate: { type: Date, default: Date.now }, endDate: Date, isActive: { type: Boolean, default: true } },
  notifications: { voice: { type: Boolean, default: true }, text: { type: Boolean, default: true }, push: { type: Boolean, default: true }, advanceNotice: { type: Number, default: 5 } },
  status: { type: String, enum: ['active','paused','completed','cancelled'], default: 'active' },
  lastTaken: { date: Date, time: String, confirmed: Boolean },
  nextDue: { date: Date, time: String },
  missedDoses: [{ date: Date, time: String, reason: String }],
  refillAlert: { enabled: { type: Boolean, default: true }, threshold: { type: Number, default: 3 }, lastAlert: Date },
  autoOrder: { enabled: { type: Boolean, default: false }, pharmacy: String, lastOrdered: Date }
}, { timestamps: true });

reminderSchema.index({ userId: 1, status: 1 });
reminderSchema.index({ 'schedule.isActive': 1, 'nextDue.date': 1 });
reminderSchema.index({ 'schedule.times.time': 1 });

reminderSchema.virtual('isDue').get(function(){ if (!this.schedule.isActive || this.status !== 'active') return false; const now = new Date(); const nextDue = new Date(this.nextDue.date + ' ' + this.nextDue.time); return now >= nextDue; });

reminderSchema.methods.updateNextDue = function(){ const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const nextTime = this.schedule.times.find(time => { const timeDate = new Date(today + ' ' + time.time); return timeDate > now; }); if (nextTime) { this.nextDue = { date: today, time: nextTime.time }; } else { const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1); this.nextDue = { date: tomorrow, time: this.schedule.times[0].time }; } };

module.exports = mongoose.model('Reminder', reminderSchema);
