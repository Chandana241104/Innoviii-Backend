const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/innoviii_exam';
    
    console.log('Attempting MongoDB connection...');
    
    if (!uri) {
      console.warn('⚠️ MONGO_URI not found, using default local connection');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    };

    await mongoose.connect(uri, options);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Don't use process.exit(1) - let the server continue without DB
    console.log('🔄 Server continuing without database connection');
  }
};

module.exports = connectDB;
