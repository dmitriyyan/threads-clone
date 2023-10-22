/* eslint-disable node/no-process-env */
import mongoose from 'mongoose';

let isConnected = false; // Variable to track the connection status

export const connectToDB = async () => {
  // Set strict query mode for Mongoose to prevent unknown field queries.
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URL) return false;

  // If the connection is already established, return without creating a new connection.
  if (isConnected) {
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL);

    isConnected = isConnected || true;
    return isConnected;
  } catch {
    isConnected = false;
  }

  return isConnected;
};
