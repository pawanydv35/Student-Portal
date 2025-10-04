const redis = require('redis');

let client = null;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.error('❌ Redis server refused connection');
          return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.error('❌ Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          console.error('❌ Redis max retry attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    client.on('connect', () => {
      console.log('✅ Redis connected');
    });

    client.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    client.on('ready', () => {
      console.log('🚀 Redis ready for operations');
    });

    client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    return client;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return null;
  }
};

// Cache helper functions
const cache = {
  // Set cache with TTL
  set: async (key, value, ttl = 3600) => {
    if (!client) return false;
    try {
      await client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('❌ Cache set error:', error);
      return false;
    }
  },

  // Get cache
  get: async (key) => {
    if (!client) return null;
    try {
      const cached = await client.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  del: async (key) => {
    if (!client) return false;
    try {
      await client.del(key);
      return true;
    } catch (error) {
      console.error('❌ Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys by pattern
  delPattern: async (pattern) => {
    if (!client) return false;
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('❌ Cache delete pattern error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    if (!client) return false;
    try {
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('❌ Cache exists error:', error);
      return false;
    }
  }
};

// User-specific cache functions
const userCache = {
  // Cache user profile
  setUser: (userId, userData) => cache.set(`user:${userId}`, userData, 3600), // 1 hour
  
  // Get cached user
  getUser: (userId) => cache.get(`user:${userId}`),
  
  // Delete user cache
  delUser: (userId) => cache.del(`user:${userId}`),
  
  // Cache user session
  setSession: (sessionId, sessionData) => cache.set(`session:${sessionId}`, sessionData, 86400), // 24 hours
  
  // Get cached session
  getSession: (sessionId) => cache.get(`session:${sessionId}`),
  
  // Delete session cache
  delSession: (sessionId) => cache.del(`session:${sessionId}`)
};

// Course-specific cache functions
const courseCache = {
  // Cache course data
  setCourse: (courseId, courseData) => cache.set(`course:${courseId}`, courseData, 1800), // 30 minutes
  
  // Get cached course
  getCourse: (courseId) => cache.get(`course:${courseId}`),
  
  // Delete course cache
  delCourse: (courseId) => cache.del(`course:${courseId}`),
  
  // Cache course list
  setCourseList: (key, courses) => cache.set(`courses:${key}`, courses, 900), // 15 minutes
  
  // Get cached course list
  getCourseList: (key) => cache.get(`courses:${key}`)
};

const closeRedis = async () => {
  if (client) {
    try {
      await client.quit();
      console.log('📴 Redis connection closed');
    } catch (error) {
      console.error('❌ Error closing Redis connection:', error);
    }
  }
};

module.exports = {
  connectRedis,
  closeRedis,
  cache,
  userCache,
  courseCache,
  getClient: () => client
};