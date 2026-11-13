const mongoose = require('mongoose');

let isConnected = false;
let dbMode = 'INITIALIZING'; // 'MONGODB_ATLAS' | 'IN_MEMORY_DEMO'

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ No MONGODB_URI found. Starting with In-Memory Demo Mode.');
    dbMode = 'IN_MEMORY_DEMO';
    return false;
  }

  try {
    console.log('🔄 Attempting connection to MongoDB Atlas...');
    const connectPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection attempt timed out (2.5s)')), 2500)
    );
    const conn = await Promise.race([connectPromise, timeoutPromise]);
    isConnected = true;
    dbMode = 'MONGODB_ATLAS';
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error (${error.message}).`);
    console.log('🚀 Activating SecureBank In-Memory Demo Mode (All banking features fully functional).');
    isConnected = false;
    dbMode = 'IN_MEMORY_DEMO';
    return false;
  }
};

const getDbStatus = () => {
  return {
    mode: dbMode,
    isConnected,
    isAtlas: dbMode === 'MONGODB_ATLAS',
    isInMemory: dbMode === 'IN_MEMORY_DEMO',
    label: dbMode === 'MONGODB_ATLAS' ? 'MongoDB Atlas (Cloud Cluster)' : 'In-Memory Demo Engine (Safe Mode)'
  };
};

module.exports = {
  connectDB,
  getDbStatus
};
