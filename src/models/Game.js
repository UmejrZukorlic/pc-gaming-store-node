const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 255 },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  genre: { type: String, required: true, trim: true },
  platform: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  image_url: { type: String, default: null }
}, { timestamps: true });

gameSchema.index({ title: 'text', description: 'text', genre: 'text', platform: 'text' });
module.exports = mongoose.model('Game', gameSchema);
