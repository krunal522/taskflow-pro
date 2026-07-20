// ============================================
// DATABASE CONNECTION - MongoDB via Mongoose
// ============================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('👉 Please check your MONGO_URI in .env file');
    process.exit(1); // Exit app if DB fails
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB Disconnected!');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB Reconnected!');
});

module.exports = connectDB;
