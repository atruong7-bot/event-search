import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDatabase } from './config/db.js';
import eventsRouter from './routes/events.js';
import favoritesRouter from './routes/favorites.js';
import spotifyRouter from './routes/spotify.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', eventsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/spotify', spotifyRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the frontend build (for production)
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all to support client-side routing
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const port = process.env.PORT || 3000;

// Connect to MongoDB and start server
async function startServer() {
  try {
    // Try to connect to MongoDB, but don't fail if it's not available in development
    if (process.env.MONGO_URI) {
      try {
        await connectToDatabase();
        console.log('✓ Connected to MongoDB');
      } catch (dbError) {
        console.warn('⚠ MongoDB connection failed:', dbError.message);
        console.warn('⚠ Favorites feature will not work until MongoDB is configured');
      }
    } else {
      console.warn('⚠ MONGO_URI not configured - Favorites feature will not work');
    }

    app.listen(port, () => {
      console.log(`✓ Backend server listening on port ${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API available at: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
