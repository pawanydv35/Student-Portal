#!/usr/bin/env node

const database = require('../config/database');
const dbInit = require('../config/dbInit');

async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Connect to database
    await database.connect();
    
    // Initialize database
    await dbInit.initializeDatabase();
    
    // Show collection stats
    const stats = await dbInit.getCollectionStats();
    console.log('\n📊 Collection Statistics:');
    Object.entries(stats).forEach(([collection, data]) => {
      console.log(`   ${collection}: ${data.documentCount} documents, ${data.indexCount} indexes`);
    });
    
    console.log('\n✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    // Disconnect from database
    await database.disconnect();
    process.exit(0);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--reset')) {
  console.log('⚠️  This will reset the entire database. All data will be lost!');
  
  // In a real application, you might want to add a confirmation prompt here
  setTimeout(async () => {
    try {
      await database.connect();
      await dbInit.resetDatabase();
      await database.disconnect();
      process.exit(0);
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      process.exit(1);
    }
  }, 2000);
} else if (args.includes('--stats')) {
  // Show database statistics
  (async () => {
    try {
      await database.connect();
      const stats = await dbInit.getCollectionStats();
      console.log('📊 Database Statistics:');
      console.log(JSON.stringify(stats, null, 2));
      await database.disconnect();
      process.exit(0);
    } catch (error) {
      console.error('❌ Failed to get database stats:', error.message);
      process.exit(1);
    }
  })();
} else {
  // Default: initialize database
  initializeDatabase();
}