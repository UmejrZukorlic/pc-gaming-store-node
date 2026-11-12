require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be set in .env and contain at least 32 characters.');
  process.exit(1);
}

connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}/api`)))
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });
