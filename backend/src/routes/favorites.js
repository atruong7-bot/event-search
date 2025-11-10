import express from 'express';
import { Favorite } from '../models/Favorite.js';

const router = express.Router();

// GET /api/favorites - Get all favorites
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!process.env.MONGO_URI) {
      return res.status(503).json({
        error: 'Favorites feature not available - MongoDB not configured',
        favorites: []
      });
    }
    const favorites = await Favorite.getAll();
    res.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: error.message, favorites: [] });
  }
});

// POST /api/favorites - Add a favorite
router.post('/', async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData.eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const result = await Favorite.add(eventData);

    if (result.alreadyExists) {
      return res.status(200).json({ message: 'Event already in favorites', data: result.data });
    }

    res.status(201).json({ message: 'Event added to favorites', data: result.data });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/favorites/:eventId - Remove a favorite
router.delete('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await Favorite.remove(eventId);

    if (!result.deleted) {
      return res.status(404).json({ error: 'Event not found in favorites' });
    }

    res.json({ message: 'Event removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/favorites/check/:eventId - Check if event is favorited
router.get('/check/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const exists = await Favorite.exists(eventId);
    res.json({ isFavorite: exists });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
