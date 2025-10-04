const mongoose = require('mongoose');

class DatabaseConfig {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  async connect() {
    try {
      // MongoDB connection options
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds
        bufferCommands: false, // Disable mongoose buffering
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(process.env.MONGODB_URI, options);
      this.isConnected = true;
      this.retryAttempts = 0;

      console.log('✅ MongoDB connected successfully');
      console.log(`📍 Database: ${this.connection.connection.name}`);
      console.log(`🌐 Host: ${this.connection.connection.host}:${this.connection.connection.port}`);

      // Set up connection event listeners
      this.setupEventListeners();

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error.message);
      await this.handleConnectionError(error);
      throw error;
    }
  }

  setupEventListeners() {
    // Connection successful
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
      this.isConnected = true;
    });

    // Connection error
    mongoose.connection.on('error', (error) => {
      console.error('🚨 Mongoose connection error:', error);
      this.isConnected = false;
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
      this.isConnected = false;
    });

    // Process termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  async handleConnectionError(error) {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      console.log(`🔄 Retrying connection... Attempt ${this.retryAttempts}/${this.maxRetries}`);
      
      await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      
      try {
        await this.connect();
      } catch (retryError) {
        if (this.retryAttempts >= this.maxRetries) {
          console.error('💥 Max retry attempts reached. Could not connect to MongoDB.');
          console.error('💡 Please ensure MongoDB is running and accessible at:', process.env.MONGODB_URI);
          console.error('💡 You can start MongoDB locally or use a cloud service like MongoDB Atlas');
          throw retryError;
        }
      }
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        this.isConnected = false;
        console.log('👋 MongoDB connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
      throw error;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
    };
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        throw new Error('Database not connected');
      }

      // Simple ping to check connection
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date() 
      };
    }
  }
}

module.exports = new DatabaseConfig();