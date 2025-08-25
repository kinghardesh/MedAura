const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  doctorSpecialization: String,
  hospital: { name: String, address: String, phone: String },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  duration: { type: Number, default: 30 },
  type: { type: String, enum: ['consultation','follow-up','emergency','routine'], default: 'consultation' },
  status: { type: String, enum: ['scheduled','confirmed','completed','cancelled','rescheduled'], default: 'scheduled' },
  reason: String,
  notes: String,
  reminders: { enabled: { type: Boolean, default: true }, advanceNotice: [{ type: Number, default: [24,2,1] }], sent: [{ type: Date }] },
  location: { address: String, coordinates: { lat: Number, lng: Number } },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: { frequency: { type: String, enum: ['weekly','monthly','quarterly'], default: 'monthly' }, interval: { type: Number, default: 1 }, endDate: Date },
  parentAppointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  childAppointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }]
}, { timestamps: true });

appointmentSchema.index({ userId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
approx = 1
appointmentSchema.index({ 'reminders.enabled': 1, appointmentDate: 1 });

appointmentSchema.virtual('isUpcoming').get(function(){ const now = new Date(); const dt = new Date(this.appointmentDate + ' ' + this.appointmentTime); return dt > now && this.status === 'scheduled'; });
appointmentSchema.virtual('isOverdue').get(function(){ const now = new Date(); const dt = new Date(this.appointmentDate + ' ' + this.appointmentTime); return dt < now && this.status === 'scheduled'; });

appointmentSchema.methods.generateRecurringAppointments = function(){ if (!this.isRecurring || !this.recurringPattern) return []; const appointments = []; const startDate = new Date(this.appointmentDate); const endDate = this.recurringPattern.endDate ? new Date(this.recurringPattern.endDate) : null; let currentDate = new Date(startDate); currentDate.setDate(currentDate.getDate() + this.recurringPattern.interval); while (!endDate || currentDate <= endDate) { const newAppointment = new this.constructor({ userId: this.userId, doctorName: this.doctorName, doctorSpecialization: this.doctorSpecialization, hospital: this.hospital, appointmentDate: new Date(currentDate), appointmentTime: this.appointmentTime, duration: this.duration, type: this.type, reason: this.reason, notes: this.notes, reminders: this.reminders, location: this.location, parentAppointment: this._id }); appointments.push(newAppointment); switch (this.recurringPattern.frequency) { case 'weekly': currentDate.setDate(currentDate.getDate() + (7 * this.recurringPattern.interval)); break; case 'monthly': currentDate.setMonth(currentDate.getMonth() + this.recurringPattern.interval); break; case 'quarterly': currentDate.setMonth(currentDate.getMonth() + (3 * this.recurringPattern.interval)); break; } } return appointments; };

module.exports = mongoose.model('Appointment', appointmentSchema);
