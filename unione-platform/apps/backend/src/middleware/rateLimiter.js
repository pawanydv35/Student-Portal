const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { getClient } = require('../config/redis');

// Create different rate limiters for different endpoints
const createRateLimiter = (windowMs, max, message, skipSuccessfulRequests = false) => {
  const redisClient = getClient();
  
  const config = {
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        timestamp: new Date()
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    // Use Redis store if available, otherwise use memory store
    ...(redisClient && {
      store: new RedisStore({
        client: redisClient,
        prefix: 'rl:',
      })
    })
  };

  return rateLimit(config);
};

// Authentication endpoints - strict limits
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts. Please try again in 15 minutes.',
  false // Don't skip successful requests for auth
);

// Password change - very strict
const passwordLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 attempts per hour
  'Too many password change attempts. Please try again in 1 hour.',
  false
);

// General API endpoints - moderate limits
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per window
  'Too many requests. Please try again in 15 minutes.',
  true // Skip successful requests
);

// Admin endpoints - moderate limits but tracked
const adminLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  500, // 500 requests per window
  'Too many admin requests. Please try again in 15 minutes.',
  false
);

// File upload endpoints - strict limits
const uploadLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  50, // 50 uploads per hour
  'Too many file uploads. Please try again in 1 hour.',
  false
);

// Search endpoints - moderate limits
const searchLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100, // 100 searches per minute
  'Too many search requests. Please try again in 1 minute.',
  true
);

// Real-time endpoints (WebSocket, notifications) - high limits
const realtimeLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  500, // 500 requests per minute
  'Too many real-time requests. Please slow down.',
  true
);

// IP-based limiter for suspicious activity
const suspiciousActivityLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // 10 failed attempts per hour
  'Suspicious activity detected. Account temporarily restricted.',
  false
);

// User-specific rate limiter (by user ID)
const createUserRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'USER_RATE_LIMIT_EXCEEDED',
        message,
        timestamp: new Date()
      }
    },
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user ? `user:${req.user._id}` : req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...(getClient() && {
      store: new RedisStore({
        client: getClient(),
        prefix: 'url:',
      })
    })
  });
};

// User-specific limiters
const userApiLimiter = createUserRateLimiter(
  15 * 60 * 1000, // 15 minutes
  2000, // 2000 requests per user per window
  'You have exceeded your request limit. Please try again in 15 minutes.'
);

const userUploadLimiter = createUserRateLimiter(
  60 * 60 * 1000, // 1 hour
  100, // 100 uploads per user per hour
  'You have exceeded your upload limit. Please try again in 1 hour.'
);

// Dynamic rate limiter based on user role
const roleBasedLimiter = (req, res, next) => {
  if (!req.user) {
    return apiLimiter(req, res, next);
  }

  let limiter;
  switch (req.user.role) {
    case 'admin':
      limiter = createRateLimiter(
        15 * 60 * 1000, // 15 minutes
        5000, // Higher limit for admins
        'Admin rate limit exceeded. Please try again in 15 minutes.',
        true
      );
      break;
    case 'faculty':
      limiter = createRateLimiter(
        15 * 60 * 1000, // 15 minutes
        3000, // Higher limit for faculty
        'Faculty rate limit exceeded. Please try again in 15 minutes.',
        true
      );
      break;
    case 'student':
    default:
      limiter = createRateLimiter(
        15 * 60 * 1000, // 15 minutes
        1500, // Standard limit for students
        'Student rate limit exceeded. Please try again in 15 minutes.',
        true
      );
      break;
  }

  return limiter(req, res, next);
};

module.exports = {
  authLimiter,
  passwordLimiter,
  apiLimiter,
  adminLimiter,
  uploadLimiter,
  searchLimiter,
  realtimeLimiter,
  suspiciousActivityLimiter,
  userApiLimiter,
  userUploadLimiter,
  roleBasedLimiter,
  createRateLimiter,
  createUserRateLimiter
};