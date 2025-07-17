import mongoose from 'mongoose';

// Add global type for mongoConnectedLogged and mongoose
// eslint-disable-next-line no-var
declare global {
  var mongoose: any;
  var mongoConnectedLogged: boolean | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/time-tracking-app';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached: any = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Only log once per process
if (!global.mongoConnectedLogged) {
  global.mongoConnectedLogged = false;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (!global.mongoConnectedLogged) {
        console.log('✅ Connected to MongoDB:', MONGODB_URI);
        global.mongoConnectedLogged = true;
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB; 