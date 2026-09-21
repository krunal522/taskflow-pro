// ============================================
// DATABASE CONNECTION - MongoDB via Mongoose
// ============================================

const mongoose = require('mongoose');

const connectDB = async (retryCount = 0) => {
  const maxRetries = 5;
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // 5s timeout instead of 30s
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.warn(`
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  MONGODB ATLAS IP WHITELIST REQUIRED                         ║
║  1. Go to: https://cloud.mongodb.com                             ║
║  2. Navigate to: Security → Network Access                       ║
║  3. Click: "+ Add IP Address"                                    ║
║  4. Choose: "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)             ║
╚══════════════════════════════════════════════════════════════════╝
      `);
    }

    if (retryCount < maxRetries) {
      const waitTime = Math.min(5000, (retryCount + 1) * 2000);
      console.log(`🔄 Retrying connection in ${waitTime / 1000}s... (Attempt ${retryCount + 1}/${maxRetries})`);
      setTimeout(() => connectDB(retryCount + 1), waitTime);
    } else {
      console.error('💥 Failed to connect to MongoDB after multiple retries. Exiting.');
      process.exit(1);
    }
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
