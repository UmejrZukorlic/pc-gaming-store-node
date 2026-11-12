require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing in .env');
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
      throw new Error('Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 8 characters) in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    const email = ADMIN_EMAIL.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      existing.is_admin = true;
      existing.name = ADMIN_NAME;
      existing.password = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await existing.save();
      console.log(`Admin account updated: ${email}`);
    } else {
      await User.create({ name: ADMIN_NAME, email, password: await bcrypt.hash(ADMIN_PASSWORD, 12), is_admin: true });
      console.log(`Admin account created: ${email}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
