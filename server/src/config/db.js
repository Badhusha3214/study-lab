import mongoose from 'mongoose';

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn('⚠️  Server will continue without MongoDB. Some features may be limited.');
    // Don't exit the process - allow server to run without DB
  }
}

// Set default timeout for operations
mongoose.set('bufferTimeoutMS', 5000);
