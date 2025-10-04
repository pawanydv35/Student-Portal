const { cache } = require('../config/redis');

// Generic cache middleware
const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`🎯 Cache hit: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json;
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode === 200 && data.success) {
          cache.set(cacheKey, data, ttl).catch(err => {
            console.error('❌ Cache set error:', err);
          });
          console.log(`💾 Cached: ${cacheKey}`);
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('❌ Cache middleware error:', error);
      next();
    }
  };
};

// User profile cache middleware
const userProfileCache = cacheMiddleware(
  (req) => `user:profile:${req.user._id}`,
  3600 // 1 hour
);

// User list cache middleware
const userListCache = cacheMiddleware(
  (req) => {
    const { page = 1, limit = 10, role, department, search } = req.query;
    return `users:list:${page}:${limit}:${role || 'all'}:${department || 'all'}:${search || 'none'}`;
  },
  900 // 15 minutes
);

// Course cache middleware
const courseCache = cacheMiddleware(
  (req) => `course:${req.params.courseId}`,
  1800 // 30 minutes
);

// Course list cache middleware
const courseListCache = cacheMiddleware(
  (req) => {
    const { page = 1, limit = 10, instructor, semester } = req.query;
    return `courses:list:${page}:${limit}:${instructor || 'all'}:${semester || 'all'}`;
  },
  900 // 15 minutes
);

// Cache invalidation middleware
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    const invalidate = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        for (const pattern of patterns) {
          const cachePattern = typeof pattern === 'function' 
            ? pattern(req) 
            : pattern;
          
          try {
            await cache.delPattern(cachePattern);
            console.log(`🗑️ Invalidated cache: ${cachePattern}`);
          } catch (error) {
            console.error('❌ Cache invalidation error:', error);
          }
        }
      }
    };

    // Override response methods
    res.json = function(data) {
      invalidate();
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      invalidate();
      return originalSend.call(this, data);
    };

    next();
  };
};

// User cache invalidation
const invalidateUserCache = invalidateCache([
  (req) => `user:${req.params.userId || req.user._id}`,
  'users:list:*',
  (req) => `user:profile:${req.params.userId || req.user._id}`
]);

// Course cache invalidation
const invalidateCourseCache = invalidateCache([
  (req) => `course:${req.params.courseId}`,
  'courses:list:*'
]);

module.exports = {
  cacheMiddleware,
  userProfileCache,
  userListCache,
  courseCache,
  courseListCache,
  invalidateCache,
  invalidateUserCache,
  invalidateCourseCache
};