const mongoose = require('mongoose');
const Game = require('../models/Game');

exports.index = async (req, res) => {
  const games = await Game.find().sort({ createdAt: -1 });
  res.json(games);
};

exports.show = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Game not found.' });
  const game = await Game.findById(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found.' });
  res.json(game);
};

function validateGame(body, partial = false) {
  const required = ['title', 'description', 'price', 'genre', 'platform', 'stock'];
  for (const key of required) {
    if (!partial && (body[key] === undefined || body[key] === '')) return `${key} is required.`;
  }
  if (body.price !== undefined && (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)) return 'price must be a non-negative number.';
  if (body.stock !== undefined && (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0)) return 'stock must be a non-negative integer.';
  if (body.image_url && !/^https?:\/\//i.test(body.image_url)) return 'image_url must be a valid http(s) URL.';
  return null;
}

exports.store = async (req, res) => {
  const error = validateGame(req.body);
  if (error) return res.status(422).json({ message: error });
  const game = await Game.create(req.body);
  res.status(201).json(game);
};

exports.update = async (req, res) => {
  const error = validateGame(req.body, true);
  if (error) return res.status(422).json({ message: error });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Game not found.' });
  const game = await Game.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
  if (!game) return res.status(404).json({ message: 'Game not found.' });
  res.json(game);
};

exports.destroy = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Game not found.' });
  const game = await Game.findByIdAndDelete(req.params.id);
  if (!game) return res.status(404).json({ message: 'Game not found.' });
  res.json({ message: 'Game deleted successfully' });
};
