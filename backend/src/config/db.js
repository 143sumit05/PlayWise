import mongoose from 'mongoose';
import { config } from './index.js';

export const connectDB = async () => {
  try {
    const mongoUri = config.mongoUri;
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      dbName: 'playwise',
    });

    console.log(`[PlayWise Backend] MongoDB Atlas Connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`[PlayWise Backend] MongoDB Connection Error: ${error.message}`);
    // Do not crash the entire server process on transient disconnect, but log error
    throw error;
  }
};

