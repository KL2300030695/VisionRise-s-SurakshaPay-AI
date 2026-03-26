const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('Testing MongoDB connection...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB!');
    
    // Check if models are accessible (simulating import)
    const GigWorker = mongoose.model('GigWorker', new mongoose.Schema({ email: String }));
    const worker = await GigWorker.findOne({ email: 'testworker@example.com' });
    console.log('Found worker:', worker ? worker.email : 'None found (expected if fresh)');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
