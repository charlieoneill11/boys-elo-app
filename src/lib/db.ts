import mongoose from 'mongoose';

// Hardcoded connection string as a fallback
const MONGODB_ATLAS_URI = 'mongodb+srv://maxkirkby1:oPHUKkMWicbWgzmv@boyscluster.oznehns.mongodb.net/?retryWrites=true&w=majority&appName=boyscluster';

// Try to use the environment variable first, but fall back to the hardcoded string
const MONGODB_URI = process.env.MONGODB_URI || MONGODB_ATLAS_URI;

console.log('Using MongoDB URI:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Log sanitized URI for debugging

// Define types for the cache
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface GlobalWithMongoose {
  mongoose: CachedConnection;
}

// Cache the MongoDB connection to reuse it across requests
const cached: GlobalWithMongoose = global as unknown as GlobalWithMongoose;
if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    console.log('Attempting to connect to MongoDB...');
    cached.mongoose.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      console.log('Successfully connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    console.error('Error connecting to MongoDB:', e);
    cached.mongoose.promise = null;
    throw e;
  }

  return cached.mongoose.conn;
}

export default connectToDatabase;