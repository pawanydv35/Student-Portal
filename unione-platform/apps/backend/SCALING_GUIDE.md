# UniOne Platform Scaling Guide - 10k Users

## Overview
This guide outlines the necessary optimizations and architectural changes to scale the UniOne platform to support 10,000+ concurrent users.

## 1. Database Optimization

### Current Issues:
- Single MongoDB instance
- No connection pooling optimization
- Missing database indexes
- No query optimization

### Solutions:

#### A. MongoDB Optimization
```javascript
// Enhanced connection with pooling
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50, // Maintain up to 50 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
});
```

#### B. Database Indexes
```javascript
// User model indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.studentId': 1 });
userSchema.index({ 'profile.employeeId': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Compound indexes for common queries
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'profile.department': 1, role: 1 });
```

#### C. Database Sharding (for 10k+ users)
- Shard by user role or department
- Use MongoDB Atlas for automatic scaling
- Implement read replicas for read-heavy operations

## 2. Caching Strategy

### Redis Implementation
```javascript
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Cache frequently accessed data
const cacheUser = async (userId, userData) => {
  await client.setex(`user:${userId}`, 3600, JSON.stringify(userData));
};

const getCachedUser = async (userId) => {
  const cached = await client.get(`user:${userId}`);
  return cached ? JSON.parse(cached) : null;
};
```

### Cache Strategy:
- User profiles: 1 hour TTL
- Course data: 30 minutes TTL
- Announcements: 15 minutes TTL
- Session data: 24 hours TTL

## 3. Load Balancing & Horizontal Scaling

### Application Architecture
```
Internet → Load Balancer → [App Server 1, App Server 2, App Server 3] → Database Cluster
                        ↓
                    Redis Cluster
```

### Implementation:
- Use PM2 for process management
- Implement sticky sessions for WebSocket connections
- Use NGINX as reverse proxy and load balancer

## 4. API Rate Limiting & Throttling

### Enhanced Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

// Different limits for different endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: 'Too many authentication attempts, please try again later.'
});

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
  }),
  windowMs: 15 * 60 * 1000,
  max: 1000, // limit each IP to 1000 requests per windowMs for API
  message: 'Too many requests, please try again later.'
});

// Apply different limits
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

## 5. Database Query Optimization

### Pagination Optimization
```javascript
// Efficient pagination with cursor-based approach
const getUsers = async (req, res) => {
  const { cursor, limit = 20, role, department } = req.query;
  
  const filter = {};
  if (role) filter.role = role;
  if (department) filter['profile.department'] = new RegExp(department, 'i');
  if (cursor) filter._id = { $gt: cursor };

  const users = await User.find(filter)
    .select('-password')
    .sort({ _id: 1 })
    .limit(parseInt(limit) + 1);

  const hasMore = users.length > limit;
  if (hasMore) users.pop();

  const nextCursor = hasMore ? users[users.length - 1]._id : null;

  res.json({
    success: true,
    data: {
      users,
      nextCursor,
      hasMore
    }
  });
};
```

### Aggregation Pipeline Optimization
```javascript
// Optimized user statistics
const getUserStats = async () => {
  return await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: {
          $sum: {
            $cond: [{ $eq: ['$isActive', true] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        role: '$_id',
        count: 1,
        active: 1,
        inactive: { $subtract: ['$count', '$active'] }
      }
    }
  ]);
};
```

## 6. Memory Management

### Connection Pooling
```javascript
// Optimize MongoDB connection pool
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50, // Maximum number of connections
  minPoolSize: 5,  // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

### Memory Leak Prevention
```javascript
// Proper cleanup
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  await redisClient.quit();
  process.exit(0);
});
```

## 7. Real-time Communication Scaling

### Socket.IO Optimization
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  },
  adapter: require('socket.io-redis')({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  })
});

// Room-based communication for courses
io.on('connection', (socket) => {
  socket.on('join-course', (courseId) => {
    socket.join(`course:${courseId}`);
  });
  
  socket.on('leave-course', (courseId) => {
    socket.leave(`course:${courseId}`);
  });
});
```

## 8. Monitoring & Observability

### Performance Monitoring
```javascript
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware to track metrics
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
});
```

## 9. Security Enhancements

### JWT Optimization
```javascript
// Use shorter-lived tokens with refresh mechanism
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Shorter access token
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};
```

### Input Validation & Sanitization
```javascript
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
```

## 10. Infrastructure Recommendations

### Production Architecture
```
CDN (CloudFlare) → Load Balancer (NGINX) → App Servers (PM2 Cluster)
                                         ↓
                                    Redis Cluster
                                         ↓
                                MongoDB Replica Set
```

### Deployment Strategy
- Use Docker containers for consistent deployments
- Implement blue-green deployment
- Use Kubernetes for orchestration (optional)
- Set up monitoring with Prometheus + Grafana

## 11. Performance Benchmarks

### Target Metrics for 10k Users:
- Response time: < 200ms for 95% of requests
- Throughput: 1000+ requests per second
- Memory usage: < 2GB per app instance
- CPU usage: < 70% under normal load
- Database connections: < 100 concurrent

### Load Testing
```bash
# Use Artillery for load testing
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/users
```

## Implementation Priority

1. **Immediate (Week 1)**:
   - Add database indexes
   - Implement Redis caching
   - Optimize database queries

2. **Short-term (Week 2-3)**:
   - Set up load balancing
   - Implement proper rate limiting
   - Add monitoring

3. **Medium-term (Month 1)**:
   - Database sharding/clustering
   - Horizontal scaling
   - Performance optimization

4. **Long-term (Month 2+)**:
   - Microservices architecture
   - Advanced caching strategies
   - Auto-scaling infrastructure

This scaling guide provides a roadmap to handle 10k+ users efficiently while maintaining performance and reliability.