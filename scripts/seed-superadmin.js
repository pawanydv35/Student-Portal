#!/usr/bin/env node

/**
 * SuperAdmin Seeding Script
 * Initializes the default SuperAdmin account in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SuperAdmin = require('../models/SuperAdmin');
const databaseConfig = require('../config/database');

class SuperAdminSeeder {
  constructor() {
    this.defaultCredentials = {
      username: process.env.SUPERADMIN_USERNAME || 'superadmin',
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@unione.edu',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!',
      firstName: process.env.SUPERADMIN_FIRST_NAME || 'Super',
      lastName: process.env.SUPERADMIN_LAST_NAME || 'Admin'
    };
  }

  async seed(options = {}) {
    try {
      console.log('🌱 Starting SuperAdmin seeding process...');

      // Connect to database
      await databaseConfig.connect();

      // Check if SuperAdmin already exists
      const existingSuperAdmin = await SuperAdmin.getSuperAdmin();
      
      if (existingSuperAdmin && !options.force) {
        console.log('✅ SuperAdmin already exists:');
        console.log(`   Username: ${existingSuperAdmin.username}`);
        console.log(`   Email: ${existingSuperAdmin.email}`);
        console.log(`   Created: ${existingSuperAdmin.createdAt}`);
        console.log('💡 Use --force flag to recreate SuperAdmin account');
        return existingSuperAdmin;
      }

      if (existingSuperAdmin && options.force) {
        console.log('🗑️  Removing existing SuperAdmin account...');
        await SuperAdmin.deleteOne({ _id: existingSuperAdmin._id });
      }

      // Create new SuperAdmin
      console.log('👤 Creating SuperAdmin account...');
      
      const credentials = options.credentials || this.defaultCredentials;
      const superAdmin = await SuperAdmin.initializeDefault(credentials);

      console.log('✅ SuperAdmin created successfully:');
      console.log(`   ID: ${superAdmin._id}`);
      console.log(`   Username: ${superAdmin.username}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Full Name: ${superAdmin.fullName}`);
      console.log(`   Created: ${superAdmin.createdAt}`);

      return superAdmin;

    } catch (error) {
      console.error('❌ SuperAdmin seeding failed:', error.message);
      
      if (error.name === 'ValidationError') {
        console.error('📋 Validation errors:');
        Object.keys(error.errors).forEach(key => {
          console.error(`   - ${key}: ${error.errors[key].message}`);
        });
      }
      
      throw error;
    } finally {
      await databaseConfig.disconnect();
    }
  }

  async verify() {
    try {
      console.log('🔍 Verifying SuperAdmin account...');
      
      await databaseConfig.connect();
      const superAdmin = await SuperAdmin.getSuperAdmin();
      
      if (!superAdmin) {
        console.log('❌ No SuperAdmin account found');
        return false;
      }

      console.log('✅ SuperAdmin verification successful:');
      console.log(`   Username: ${superAdmin.username}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Active: ${superAdmin.isActive}`);
      console.log(`   Last Login: ${superAdmin.lastLogin || 'Never'}`);
      
      // Test password validation
      const testPassword = 'SuperAdmin123!';
      const isValidPassword = await superAdmin.comparePassword(testPassword);
      console.log(`   Password Test: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);

      return true;

    } catch (error) {
      console.error('❌ SuperAdmin verification failed:', error.message);
      return false;
    } finally {
      await databaseConfig.disconnect();
    }
  }

  async reset() {
    try {
      console.log('🔄 Resetting SuperAdmin account...');
      
      await databaseConfig.connect();
      
      // Remove existing SuperAdmin
      const result = await SuperAdmin.deleteMany({});
      console.log(`🗑️  Removed ${result.deletedCount} SuperAdmin account(s)`);
      
      // Create new SuperAdmin
      const superAdmin = await this.seed({ force: true });
      
      console.log('✅ SuperAdmin reset completed');
      return superAdmin;

    } catch (error) {
      console.error('❌ SuperAdmin reset failed:', error.message);
      throw error;
    }
  }

  displayHelp() {
    console.log(`
🌱 SuperAdmin Seeding Script

Usage: node scripts/seed-superadmin.js [options]

Options:
  --help, -h     Show this help message
  --force, -f    Force recreate SuperAdmin if exists
  --verify, -v   Verify existing SuperAdmin account
  --reset, -r    Reset SuperAdmin account (delete and recreate)

Environment Variables:
  SUPERADMIN_USERNAME     Default: superadmin
  SUPERADMIN_EMAIL        Default: superadmin@unione.edu
  SUPERADMIN_PASSWORD     Default: SuperAdmin123!
  SUPERADMIN_FIRST_NAME   Default: Super
  SUPERADMIN_LAST_NAME    Default: Admin

Examples:
  node scripts/seed-superadmin.js
  node scripts/seed-superadmin.js --force
  node scripts/seed-superadmin.js --verify
  node scripts/seed-superadmin.js --reset
    `);
  }
}

// CLI execution
async function main() {
  const seeder = new SuperAdminSeeder();
  const args = process.argv.slice(2);

  try {
    if (args.includes('--help') || args.includes('-h')) {
      seeder.displayHelp();
      return;
    }

    if (args.includes('--verify') || args.includes('-v')) {
      await seeder.verify();
      return;
    }

    if (args.includes('--reset') || args.includes('-r')) {
      await seeder.reset();
      return;
    }

    const force = args.includes('--force') || args.includes('-f');
    await seeder.seed({ force });

  } catch (error) {
    console.error('💥 Script execution failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SuperAdminSeeder;