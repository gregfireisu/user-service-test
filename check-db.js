const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('✅ MongoDB connected successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();