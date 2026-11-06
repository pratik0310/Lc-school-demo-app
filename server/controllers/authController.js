const jwt = require('jsonwebtoken');
const { User } = require('../models');

const sign = (u) => jwt.sign({ id: u.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const out = (u) => ({ _id: u.id, name: u.name, email: u.email, role: u.role, token: sign(u) });
const clean = (e) => (e || '').toLowerCase().trim();

exports.register = async (req, res) => {
  const { name, password, phone } = req.body;
  const email = clean(req.body.email);
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, password required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password min 6 characters' });
  if (await User.findOne({ where: { email } })) return res.status(400).json({ message: 'Email already registered' });
  const user = await User.create({ name, email, password, phone, role: 'student' }); // admin only via env seed
  res.status(201).json(out(user));
};

exports.login = async (req, res) => {
  const user = await User.findOne({ where: { email: clean(req.body.email) } });
  if (!user || !(await user.matchPassword(req.body.password || '')))
    return res.status(401).json({ message: 'Wrong email or password' });
  res.json(out(user));
};

exports.me = (req, res) => res.json(req.user);
