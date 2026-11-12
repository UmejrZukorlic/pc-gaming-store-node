const mongoose = require('mongoose');
const Game = require('../models/Game');
const Order = require('../models/Order');

exports.index = async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id }).sort({ createdAt: -1 }).populate('user_id', 'name email');
  res.json(orders);
};

exports.store = async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(422).json({ message: 'items must be a non-empty array.' });
  for (const item of items) {
    if (!mongoose.isValidObjectId(item.game_id) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      return res.status(422).json({ message: 'Each item needs a valid game_id and quantity (integer >= 1).' });
    }
  }

  // MongoDB Atlas supports transactions on replica sets / sharded clusters.
  // All stock changes and the order are committed together or rolled back.
  const session = await mongoose.startSession();
  let createdOrder;
  try {
    await session.withTransaction(async () => {
      const orderLines = [];
      let total = 0;
      for (const item of items) {
        const quantity = Number(item.quantity);
        const game = await Game.findOneAndUpdate(
          { _id: item.game_id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );
        if (!game) {
          const exists = await Game.exists({ _id: item.game_id }).session(session);
          const error = new Error(exists ? 'Insufficient stock for one of the selected games.' : 'One of the selected games does not exist.');
          error.status = 400;
          throw error;
        }
        const price = game.price;
        total += price * quantity;
        orderLines.push({ game_id: game._id, title: game.title, image_url: game.image_url, quantity, price });
      }
      [createdOrder] = await Order.create([{ user_id: req.user._id, items: orderLines, total, status: 'pending' }], { session });
    });
    const result = await Order.findById(createdOrder._id).populate('user_id', 'name email');
    res.status(201).json(result);
  } finally {
    await session.endSession();
  }
};

exports.show = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Order not found.' });
  const order = await Order.findOne({ _id: req.params.id, user_id: req.user._id });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json(order);
};

exports.allOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate('user_id', 'name email');
  res.json(orders);
};

exports.updateStatus = async (req, res) => {
  const allowed = ['pending', 'processing', 'completed', 'cancelled'];
  if (!allowed.includes(req.body.status)) return res.status(422).json({ message: `status must be one of: ${allowed.join(', ')}.` });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Order not found.' });
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json(order);
};
