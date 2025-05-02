const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const isBlacklisted = await redis.get(token);
  if (isBlacklisted) return res.status(401).json({ message: 'Token expired' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
