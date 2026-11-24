const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careertrack';

  try {
    // Attempt standard connection to specified MongoDB URI with 2.5s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Local/remote MongoDB server not reachable at ${uri}.`);
    console.log(`[Storage] Seamlessly operating in file-backed persistent store (backend/data/jobs.json).`);
    console.log(`[Storage] To use MongoDB, make sure MongoDB is running or update MONGODB_URI in backend/.env.`);
    return null;
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, disconnectDB, getIsConnected };
