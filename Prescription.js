const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  originalText: { type: String, required: true },
  extractedMedicines: [{
    name: { type: String, required: true },
    dosage: { amount: String, unit: String },
    frequency: { times: Number, period: String },
    timing: [{ time: String, instructions: String }],
    duration: { value: Number, unit: String },
    instructions: String,
    beforeMeal: Boolean,
    afterMeal: Boolean
  }],
  doctorName: String,
  doctorSpecialization: String,
  prescriptionDate: Date,
  validUntil: Date,
  status: { type: String, enum: ['active','completed','expired'], default: 'active' },
  notes: String,
  isProcessed: { type: Boolean, default: false },
  processingConfidence: { type: Number, min: 0, max: 100 }
}, { timestamps: true });

prescriptionSchema.index({ userId: 1, status: 1 });
prescriptionSchema.index({ prescriptionDate: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
