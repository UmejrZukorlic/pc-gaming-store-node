const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
