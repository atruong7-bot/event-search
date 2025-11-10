import { MongoClient } from 'mongodb';

let db = null;
let client = null;

export async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    client = new MongoClient(uri);
    await client.connect();

    db = client.db('events-around'); // Database name
    console.log('Successfully connected to MongoDB Atlas');

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
}
