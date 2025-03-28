import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elo_app';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

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
    cached.mongoose.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.mongoose.conn = await cached.mongoose.promise;
  } catch (e) {
    cached.mongoose.promise = null;
    throw e;
  }

  return cached.mongoose.conn;
}

export default connectToDatabase;