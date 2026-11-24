const mongoose = require('mongoose');

let isConnected = false;
let cachedPromise = null;

const connectDB = async () => {
  if (cachedPromise && mongoose.connection.readyState === 1) {
    return cachedPromise;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careertrack';

  try {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    const conn = await cachedPromise;
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    cachedPromise = null;
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
    cachedPromise = null;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, disconnectDB, getIsConnected };
