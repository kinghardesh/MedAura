const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['elderly', 'family', 'admin'], default: 'elderly' },
  phone: { type: String, required: true },
  emergencyContacts: [{ name: String, phone: String, relationship: String }],
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  preferences: { voiceNotifications: { type: Boolean, default: true }, textNotifications: { type: Boolean, default: true }, language: { type: String, default: 'en' }, fontSize: { type: String, enum: ['small','medium','large'], default: 'large' } },
  healthInfo: { bloodGroup: String, allergies: [String], conditions: [String], currentMedications: [String] },
  location: { address: String, coordinates: { lat: Number, lng: Number } },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try { const salt = await bcrypt.genSalt(10); this.password = await bcrypt.hash(this.password, salt); next(); } catch (e) { next(e); }
});

userSchema.methods.comparePassword = async function(candidatePassword) { return bcrypt.compare(candidatePassword, this.password); };
userSchema.methods.toJSON = function() { const user = this.toObject(); delete user.password; return user; };

module.exports = mongoose.model('User', userSchema);
