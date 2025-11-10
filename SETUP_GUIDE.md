# Quick Setup Guide

## What Has Been Created

✅ **Complete Full-Stack Application**
- Backend: Node.js + Express + MongoDB
- Frontend: React + TypeScript + Vite + Tailwind CSS + Shadcn/UI
- All features from requirements implemented
- Responsive design matching reference images
- Toast notifications with Sonner
- Favorites system with MongoDB persistence

## Before You Start - IMPORTANT

### Fix npm Cache Issue (Required First!)

You have npm cache permission issues. Run this command first:

```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

## Quick Start (5 Steps)

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 3. Create Environment Files

**Backend (.env):**
```bash
cd ../backend
cp .env.example .env
nano .env
```

Add your API keys:
```env
TICKETMASTER_API_KEY=your_ticketmaster_api_key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/events-around
PORT=3000
NODE_ENV=development
```

**Frontend (.env):**
```bash
cd ../frontend
cp .env.example .env
nano .env
```

Add your API keys:
```env
VITE_GOOGLE_GEOCODE_KEY=your_google_api_key
VITE_IPINFO_TOKEN=your_ipinfo_token
```

### 4. Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account → New Project → Create Cluster (free tier)
3. Database Access → Add User (create username/password)
4. Network Access → Add IP Address → Add Current IP
5. Connect → Connect your application → Copy connection string
6. Paste into backend `.env` as `MONGO_URI`

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

Visit http://localhost:5173 in your browser!

## Get Your API Keys

### Ticketmaster API
1. https://developer.ticketmaster.com/
2. Sign up → Create App → Copy API Key

### Google Geocoding API
1. https://console.cloud.google.com/
2. Enable "Geocoding API"
3. Credentials → Create Credentials → API Key

### IPInfo Token
1. https://ipinfo.io/
2. Sign up → Dashboard → Copy Token

### Spotify (Optional - for artist info)
1. https://developer.spotify.com/dashboard/
2. Create App → Copy Client ID & Secret

## What Each File Does

### Backend Structure
```
backend/src/
├── config/db.js          # MongoDB connection
├── models/Favorite.js    # Favorites database model
├── routes/
│   ├── events.js        # Ticketmaster API proxy
│   └── favorites.js     # CRUD operations for favorites
└── server.js            # Express server + routes setup
```

### Frontend Structure
```
frontend/src/
├── components/
│   ├── ui/              # Shadcn UI components (button, input, etc.)
│   ├── Navbar.tsx       # Navigation bar with routing
│   ├── SearchForm.tsx   # Search form with autocomplete
│   ├── EventCard.tsx    # Event card with favorite button
│   └── ResultsGrid.tsx  # Grid layout for events
├── pages/
│   ├── SearchPage.tsx       # Main search page
│   ├── EventDetailsPage.tsx # Event details with 3 tabs
│   └── FavoritesPage.tsx    # List of favorites
└── App.tsx              # Router setup + Toaster
```

## Features Implemented

✅ **Search Page**
- Keyword input with autocomplete (Ticketmaster suggest API)
- Category dropdown (All, Music, Sports, Arts & Theatre, Film, Miscellaneous)
- Location input with auto-detection toggle
- Distance slider
- Form validation with error messages
- Results grid with event cards
- Favorite button on each card

✅ **Event Details Page**
- Info tab: Date, artists, venue, genres, price, ticket status, seat map
- Artists/Teams tab: Spotify integration (music events only)
- Venue tab: Name, address, parking, rules
- Social sharing (Facebook & Twitter/X)
- Favorite toggle with toast notifications

✅ **Favorites Page**
- MongoDB-backed persistence
- Same card layout as search
- Empty state message
- Toast notifications with undo

✅ **Design**
- Matches all reference images
- Fully responsive (desktop + mobile)
- Tailwind CSS + Shadcn/UI components
- Lucide icons throughout

## Common Issues & Solutions

### "Cannot find module" errors
Run `npm install` in both frontend and backend directories.

### Backend won't start
- Check that `.env` exists in backend folder
- Verify MongoDB connection string format
- Ensure MongoDB IP whitelist includes your IP

### Frontend API calls fail
- Ensure backend is running on port 3000
- Check Vite proxy configuration in `vite.config.ts`
- Verify environment variables in frontend `.env`

### Autocomplete not working
- Check `TICKETMASTER_API_KEY` in backend `.env`
- Open browser console to see error messages

### Location auto-detect not working
- Check `VITE_IPINFO_TOKEN` in frontend `.env`
- IPInfo free tier has rate limits

## Deployment

See full deployment instructions in `README.md`.

Quick deploy to Google Cloud:
```bash
# Build frontend
cd frontend
npm run build

# Deploy backend (serves frontend)
cd ../backend
gcloud app deploy
```

## Need Help?

- Check the full `README.md` for detailed documentation
- Review the requirements in `requirements.txt`
- Look at reference images in `reference-images/` folder
- All API documentation links are in `requirements.txt`

## What to Test

1. Search for "USC" → Should show USC events
2. Toggle auto-detect location → Location field should disable
3. Click on an event card → Should navigate to details page
4. Click favorite heart → Should show toast and turn red
5. Go to Favorites page → Should show favorited events
6. Click favorite again → Should show "removed" toast with undo button

Enjoy building! 🎉
