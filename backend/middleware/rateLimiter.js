// ============================================
// RATE LIMITER MIDDLEWARE — Security Protection
// ============================================

const rateLimit = require('express-rate-limit');

// Auth Rate Limiter — Prevents brute-force attacks while allowing normal testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login/register attempts from this IP. Please try again after 15 minutes.',
  },
});

// General API Rate Limiter — Max 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

module.exports = { authLimiter, apiLimiter };
