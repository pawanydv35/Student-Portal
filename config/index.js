const database = require('./database');
const env = require('./env');

class AppConfig {
  constructor() {
    this.database = database;
    this.env = env;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing application configuration...');
      
      // Connect to database
      await this.database.connect();
      
      console.log('✅ Application configuration initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize application configuration:', error.message);
      throw error;
    }
  }

  async shutdown() {
    try {
      console.log('🛑 Shutting down application...');
      
      // Disconnect from database
      await this.database.disconnect();
      
      console.log('✅ Application shutdown completed');
    } catch (error) {
      console.error('❌ Error during application shutdown:', error.message);
      throw error;
    }
  }

  getHealthStatus() {
    return {
      database: this.database.getConnectionStatus(),
      environment: {
        nodeEnv: this.env.server.nodeEnv,
        port: this.env.server.port
      },
      timestamp: new Date()
    };
  }
}

module.exports = new AppConfig();