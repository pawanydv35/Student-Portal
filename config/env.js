const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

class EnvironmentConfig {
  constructor() {
    this.validateRequiredEnvVars();
  }

  validateRequiredEnvVars() {
    const requiredVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'SUPERADMIN_USERNAME',
      'SUPERADMIN_EMAIL',
      'SUPERADMIN_PASSWORD'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('\n💡 Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }

    // Validate JWT secret strength
    if (process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
    }

    // Validate bcrypt rounds
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    if (bcryptRounds < 10) {
      console.warn('⚠️  BCRYPT_ROUNDS should be at least 10 for security');
    }

    console.log('✅ Environment variables validated successfully');
  }

  get server() {
    return {
      port: parseInt(process.env.PORT) || 3000,
      nodeEnv: process.env.NODE_ENV || 'development',
      allowedOrigins: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
        ['http://localhost:3000']
    };
  }

  get database() {
    return {
      uri: process.env.MONGODB_URI,
      name: process.env.DB_NAME || 'unione-auth'
    };
  }

  get jwt() {
    return {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '30m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    };
  }

  get email() {
    return {
      smtp: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      from: {
        email: process.env.FROM_EMAIL || 'noreply@unione.edu',
        name: process.env.FROM_NAME || 'UniONE System'
      }
    };
  }

  get security() {
    return {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
      lockTime: parseInt(process.env.LOCK_TIME) || 30 // minutes
    };
  }

  get superAdmin() {
    return {
      username: process.env.SUPERADMIN_USERNAME,
      email: process.env.SUPERADMIN_EMAIL,
      password: process.env.SUPERADMIN_PASSWORD
    };
  }

  isDevelopment() {
    return this.server.nodeEnv === 'development';
  }

  isProduction() {
    return this.server.nodeEnv === 'production';
  }

  isTest() {
    return this.server.nodeEnv === 'test';
  }
}

module.exports = new EnvironmentConfig();