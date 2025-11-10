import express from 'express';
import geohash from 'ngeohash';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const getTicketmasterApiKey = () => {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) {
    throw new Error('Ticketmaster API key is not configured');
  }
  return key;
};
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

// Helper function to make Ticketmaster API calls
async function ticketmasterFetch(endpoint, params) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('apikey', getTicketmasterApiKey());

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Ticketmaster API error: ${response.statusText}`);
  }

  return response.json();
}

// GET /api/suggest - Autocomplete suggestions
router.get('/suggest', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const data = await ticketmasterFetch('/suggest', { keyword });

    // Extract suggestions from the response
    const suggestions = data._embedded?.attractions?.map(a => a.name) || [];

    res.json({ suggestions });
  } catch (error) {
    console.error('Suggest API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/searchEvents - Search for events
router.get('/searchEvents', async (req, res) => {
  try {
    const { keyword, radius = 10, lat, lng, segmentId } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location coordinates are required' });
    }

    const params = {
      keyword,
      radius,
      unit: 'miles',
      segmentId: segmentId && segmentId !== 'All' ? segmentId : undefined,
      geoPoint: geohash.encode(parseFloat(lat), parseFloat(lng)),
      size: 20, // Maximum 20 results as per requirements
    };

    const data = await ticketmasterFetch('/events', params);

    res.json(data);
  } catch (error) {
    console.error('Search events API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/eventDetails/:id - Get event details
router.get('/eventDetails/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const data = await ticketmasterFetch(`/events/${id}`, {});

    res.json(data);
  } catch (error) {
    console.error('Event details API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/venueDetails/:name - Get venue details (for additional venue info if needed)
router.get('/venueDetails/:name', async (req, res) => {
  try {
    const { name } = req.params;

    const data = await ticketmasterFetch('/venues', { keyword: name, size: 1 });

    res.json(data);
  } catch (error) {
    console.error('Venue details API error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
