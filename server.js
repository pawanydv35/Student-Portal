const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();
const PORT = config.env.server.port;

// Initialize application configuration
async function initializeApp() {
  try {
    await config.initialize();
    console.log('🎉 Application initialized successfully');
  } catch (error) {
    console.error('💥 Failed to initialize application:', error.message);
    process.exit(1);
  }
}

// Middleware configuration
app.use(cors({
  origin: config.env.server.allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthStatus = config.getHealthStatus();
    const dbHealth = await config.database.healthCheck();
    
    res.status(200).json({
      success: true,
      message: 'UniONE Authentication System is running',
      status: {
        ...healthStatus,
        database: dbHealth
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to UniONE Authentication System',
    version: '1.0.0'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  await config.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  await config.shutdown();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Initialize application first
    await initializeApp();
    
    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 UniONE Authentication System running on port ${PORT}`);
      console.log(`🌍 Environment: ${config.env.server.nodeEnv}`);
      console.log(`💚 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 Database: ${config.env.database.name}`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the application
if (require.main === module) {
  startServer();
}

module.exports = app;