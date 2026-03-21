/**
 * Simple standalone script to test the MongoDB connection.
 * Run with: npx tsx scripts/test-db.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('--- MongoDB Connection Test ---');
  
  if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in your .env file.');
    process.exit(1);
  }

  // Mask URI for security
  const maskedUri = MONGODB_URI.replace(/\/\/.*@/, '//****:****@');
  console.log(`Checking connection to: ${maskedUri}`);

  try {
    console.log('Connecting...');
    await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    });
    
    console.log('✅ Success! Connected successfully to MongoDB.');
    console.log(`Database Name: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    
    await mongoose.disconnect();
    console.log('Disconnected.');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Connection Failed!');
    console.error(`Error Name: ${err.name}`);
    console.error(`Error Message: ${err.message}`);
    
    if (err.message.includes('ENOTFOUND')) {
      console.log('\n💡 Troubleshooting Tip:');
      console.log('This "ENOTFOUND" error usually means the database address (hostname) could not be resolved.');
      console.log('1. Check if the cluster address in your MONGODB_URI is correct.');
      console.log('2. If using MongoDB Atlas, ensure your DNS provider supports SRV records.');
      console.log('3. Try using the "Standard Connection String" (without +srv) if the SRV lookup fails.');
    }
    
    process.exit(1);
  }
}

testConnection();
