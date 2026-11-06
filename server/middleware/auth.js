const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ message: 'Not logged in' });
  try {
    const { id } = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admin only' });
