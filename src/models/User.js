const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 255 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  is_admin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
