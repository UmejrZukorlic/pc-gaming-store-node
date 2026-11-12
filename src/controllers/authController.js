const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, is_admin: user.is_admin, createdAt: user.createdAt };
}

exports.register = async (req, res) => {
  const { name, email, password, password_confirmation } = req.body;
  if (!name || !email || !password) return res.status(422).json({ message: 'name, email and password are required.' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(422).json({ message: 'A valid email is required.' });
  if (password.length < 8) return res.status(422).json({ message: 'Password must contain at least 8 characters.' });
  // Laravel's `confirmed` rule maps to password_confirmation.
  if (password_confirmation !== undefined && password !== password_confirmation) {
    return res.status(422).json({ message: 'Password confirmation does not match.' });
  }
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: 'Email is already registered.' });

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), is_admin: false });
  res.status(201).json({ user: publicUser(user), token: makeToken(user._id) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(422).json({ message: 'Email and password are required.' });
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'The provided credentials are incorrect.' });
  }
  res.json({ user: publicUser(user), token: makeToken(user._id) });
};

exports.logout = (req, res) => res.json({ message: 'Logged out successfully. Remove the token from the client.' });
exports.me = (req, res) => res.json(publicUser(req.user));
