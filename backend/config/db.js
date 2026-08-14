import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    let dbUrl = process.env.MONGO_URI;

    if (process.env.USE_IN_MEMORY_DB === 'true') {
      console.log('Starting In-Memory MongoDB Server...');
      mongod = await MongoMemoryServer.create();
      dbUrl = mongod.getUri();
      console.log(`In-Memory MongoDB Server started at: ${dbUrl}`);
    }

    const conn = await mongoose.connect(dbUrl);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    // If local MongoDB connection failed, fallback to in-memory automatically
    if (process.env.USE_IN_MEMORY_DB !== 'true') {
      console.log('Local MongoDB connection failed. Falling back to In-Memory MongoDB Server...');
      try {
        mongod = await MongoMemoryServer.create();
        const fallbackUrl = mongod.getUri();
        console.log(`In-Memory MongoDB Server started as fallback: ${fallbackUrl}`);
        const conn = await mongoose.connect(fallbackUrl);
        console.log(`MongoDB Connected (Fallback): ${conn.connection.host}`);
      } catch (fallbackError) {
        console.error(`Fallback failed: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
      console.log('In-Memory MongoDB Server stopped.');
    }
  } catch (error) {
    console.error(`Error disconnecting database: ${error.message}`);
  }
};

export default connectDB;
