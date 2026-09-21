// ============================================
// TaskFlow Pro - Main Server Entry Point
// Node.js + Express + MongoDB (Mongoose)
// ============================================

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables FIRST
dotenv.config();

// Connect to MongoDB
connectDB();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

// Initialize Express App
const app = express();

// Trust reverse proxy (Render, Vercel, Heroku, Nginx)
// Required for correct client IP detection with rate limiting
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins (Vercel, Netlify, localhost, etc.)
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logs: GET /api/tasks 200 12ms

// Serve uploaded avatars as static files
// URL: http://localhost:5000/uploads/avatars/<filename>
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);    // Register, Login
app.use('/api/tasks', taskRoutes);   // CRUD Tasks
app.use('/api/users', userRoutes);   // User Profile + Stats

// ============================================
// ROOT ENDPOINT
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TaskFlow Pro API is Running!',
    version: '1.0.0',
    author: 'Krunal - Jr. Full Stack Developer',
    database: 'MongoDB (Mongoose)',
    endpoints: {
      auth: '/api/auth  → POST /register, POST /login, GET /me',
      tasks: '/api/tasks → GET, POST, PUT, DELETE, PATCH /status',
      users: '/api/users → GET /me, PUT /me, GET /stats',
    },
    status: 'Active ✅',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// HEALTH CHECK — For Azure Deployment
// ============================================
app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// 404 HANDLER
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║   🚀 TaskFlow Pro Backend Running!           ║
║   Port     : ${PORT}                             ║
║   Mode     : ${process.env.NODE_ENV}              ║
║   Database : MongoDB (Mongoose)              ║
║   API Base : http://localhost:${PORT}/api         ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
