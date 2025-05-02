const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date
});
module.exports = mongoose.model('User', userSchema);
