import { MongoClient } from 'mongodb';
import tls from 'tls';

// Workaround for Node.js 20 + MongoDB Atlas TLS issue on App Engine
// This relaxes TLS settings to allow connection
const originalCreateSecureContext = tls.createSecureContext;
tls.createSecureContext = (options) => {
  const context = originalCreateSecureContext(options);
  context.context.setMaxProtoVersion?.('TLSv1.3');
  context.context.setMinProtoVersion?.('TLSv1.2');
  return context;
};

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

    // MongoDB connection options for better compatibility
    // Add TLS options to work around Node.js 20 + MongoDB Atlas SSL issue
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    };

    client = new MongoClient(uri, options);
    await client.connect();

    // Extract database name from URI or use default
    const dbName = uri.includes('/events-around') ? 'events-around' : 'events-around';
    db = client.db(dbName);

    console.log('Successfully connected to MongoDB Atlas');
    console.log('Database name:', dbName);

    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Connection URI (masked):', process.env.MONGO_URI?.replace(/\/\/.*@/, '//***@'));
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
