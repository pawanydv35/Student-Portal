const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./env');

class DatabaseInitializer {
  constructor() {
    this.collections = ['superadmins', 'admins', 'teachers'];
  }

  async initializeDatabase() {
    try {
      console.log('🔧 Initializing database collections and indexes...');

      // Create collections if they don't exist
      await this.createCollections();

      // Create indexes for performance and uniqueness
      await this.createIndexes();

      // Initialize SuperAdmin account
      await this.initializeSuperAdmin();

      console.log('✅ Database initialization completed successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
      throw error;
    }
  }

  async createCollections() {
    const db = mongoose.connection.db;

    for (const collectionName of this.collections) {
      try {
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        
        if (collections.length === 0) {
          await db.createCollection(collectionName);
          console.log(`📁 Created collection: ${collectionName}`);
        } else {
          console.log(`📁 Collection already exists: ${collectionName}`);
        }
      } catch (error) {
        console.error(`❌ Error creating collection ${collectionName}:`, error.message);
        throw error;
      }
    }
  }

  async createIndexes() {
    const db = mongoose.connection.db;

    try {
      // SuperAdmin indexes
      await db.collection('superadmins').createIndexes([
        { key: { username: 1 }, unique: true },
        { key: { email: 1 }, unique: true },
        { key: { isActive: 1 } },
        { key: { lastLogin: 1 } }
      ]);
      console.log('📊 Created indexes for superadmins collection');

      // Admin indexes
      await db.collection('admins').createIndexes([
        { key: { username: 1 }, unique: true },
        { key: { email: 1 }, unique: true },
        { key: { isActive: 1 } },
        { key: { createdBy: 1 } },
        { key: { lastLogin: 1 } },
        { key: { lockUntil: 1 }, sparse: true }
      ]);
      console.log('📊 Created indexes for admins collection');

      // Teacher indexes
      await db.collection('teachers').createIndexes([
        { key: { username: 1 }, unique: true },
        { key: { email: 1 }, unique: true },
        { key: { employeeId: 1 }, unique: true },
        { key: { department: 1 } },
        { key: { isActive: 1 } },
        { key: { createdBy: 1 } },
        { key: { lastLogin: 1 } },
        { key: { lockUntil: 1 }, sparse: true }
      ]);
      console.log('📊 Created indexes for teachers collection');

    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      throw error;
    }
  }

  async initializeSuperAdmin() {
    try {
      const db = mongoose.connection.db;
      const superAdminCollection = db.collection('superadmins');

      // Check if SuperAdmin already exists
      const existingSuperAdmin = await superAdminCollection.findOne({
        username: env.superAdmin.username
      });

      if (existingSuperAdmin) {
        console.log('👑 SuperAdmin account already exists');
        return;
      }

      // Hash the default password
      const hashedPassword = await bcrypt.hash(env.superAdmin.password, env.security.bcryptRounds);

      // Create SuperAdmin document
      const superAdminDoc = {
        username: env.superAdmin.username,
        email: env.superAdmin.email,
        password: hashedPassword,
        role: 'superadmin',
        isActive: true,
        loginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert SuperAdmin
      await superAdminCollection.insertOne(superAdminDoc);
      console.log('👑 SuperAdmin account created successfully');
      console.log(`   Username: ${env.superAdmin.username}`);
      console.log(`   Email: ${env.superAdmin.email}`);
      console.log('   ⚠️  Please change the default password after first login!');

    } catch (error) {
      console.error('❌ Error initializing SuperAdmin:', error.message);
      throw error;
    }
  }

  async dropDatabase() {
    try {
      console.log('🗑️  Dropping database...');
      await mongoose.connection.db.dropDatabase();
      console.log('✅ Database dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping database:', error.message);
      throw error;
    }
  }

  async resetDatabase() {
    try {
      console.log('🔄 Resetting database...');
      await this.dropDatabase();
      await this.initializeDatabase();
      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      throw error;
    }
  }

  async getCollectionStats() {
    try {
      const db = mongoose.connection.db;
      const stats = {};

      for (const collectionName of this.collections) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        const indexes = await collection.indexes();
        
        stats[collectionName] = {
          documentCount: count,
          indexCount: indexes.length,
          indexes: indexes.map(idx => idx.name)
        };
      }

      return stats;
    } catch (error) {
      console.error('❌ Error getting collection stats:', error.message);
      throw error;
    }
  }
}

module.exports = new DatabaseInitializer();