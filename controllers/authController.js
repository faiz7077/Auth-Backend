const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const redis = require('../config/redis');
const validate = require('../utils/validateInput');

exports.signUp = async (req, res) => {
  const { email, password, role } = req.body;
  if (role === 'admin' && !email.endsWith('@gmail.com')) {
    return res.status(400).json({ message: 'Admins must use Gmail accounts' });
  }
  const hashed = await bcrypt.hash(validate(password), 10);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const user = new User({ email: validate(email), password: hashed, role, otp, otpExpiry: Date.now() + 300000 });
  await user.save();
  await sendEmail(email, 'OTP Verification', `Your OTP: ${otp}`);
  res.json({ message: 'OTP sent to email' });
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: validate(email) });
  if (!user || user.otp !== otp || Date.now() > user.otpExpiry) return res.status(400).json({ message: 'Invalid OTP' });
  user.isVerified = true; user.otp = undefined; user.otpExpiry = undefined;
  await user.save();
  res.json({ message: 'Email verified' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: validate(email) });
  if (!user || !user.isVerified || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) await redis.set(token, 'blacklisted', 'EX', 3600);
  res.json({ message: 'Logged out' });
};
