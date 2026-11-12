const mongoose = require('mongoose');

// MongoDB stores order lines as embedded snapshots so the purchased title and
// price remain available even if a game is later edited or deleted.
const orderItemSchema = new mongoose.Schema({
  game_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  title: { type: String, required: true },
  image_url: { type: String, default: null },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [orderItemSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

orderSchema.index({ user_id: 1, createdAt: -1 });
module.exports = mongoose.model('Order', orderSchema);
