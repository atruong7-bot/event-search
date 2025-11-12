# Events Around - Full Stack Event Search Application

A full-stack web application for searching and discovering events using the Ticketmaster API. Built with React + TypeScript + Vite on the frontend and Node.js + Express + MongoDB on the backend.

DEPLOYED HERE: https://event-search-477822.wl.r.appspot.com/search
## Features

- 🔍 Event search with keyword autocomplete
- 📍 Location-based search with auto-detection or manual entry
- ❤️ Favorites system with MongoDB persistence
- 📱 Fully responsive design
- 🎨 Modern UI with Tailwind CSS and Shadcn/UI
- 🔔 Toast notifications with Sonner
- 🎵 Artist information from Spotify (for Music events)
- 🗺️ Venue details with Google Maps integration

## Tech Stack

### Frontend
- React 18+ with JavaScript
- Vite for build tooling
- Tailwind CSS + Shadcn/UI for styling
- React Router for routing
- Sonner for toast notifications
- Lucide React for icons

### Backend
- Node.js with Express
- MongoDB Atlas for data persistence
- Node Geohash for location encoding
- Ticketmaster API integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v20.19.0 or higher recommended)
- npm (v10.7.0 or higher)

You'll also need API keys for:
- Ticketmaster API
- Google Maps Geocoding API
- IPInfo API (for location detection)
- Spotify API (optional, for artist information)
- MongoDB Atlas account

## Getting Started

### 1. Clone the Repository

```bash
cd hw3
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies (you may need to fix npm cache permissions first)
# If you get permission errors, run: sudo chown -R $(whoami) ~/.npm
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

Add your API keys to `.env`:
```env
TICKETMASTER_API_KEY=your_key_here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/events-around?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project
3. Create a new cluster (free tier is fine)
4. Go to Database Access → Add Database User
5. Go to Network Access → Add IP Address (add your current IP)
6. Get your connection string and update `MONGO_URI` in `.env`
7. The database `events-around` and collection `favorites` will be created automatically

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

Add your API keys to `.env`:
```env
VITE_GOOGLE_GEOCODE_KEY=your_key_here
VITE_IPINFO_TOKEN=your_token_here
```

### 5. Running Locally

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

Visit `http://localhost:5173` in your browser to use the application.

## Project Structure

```
hw3/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── models/
│   │   │   └── Favorite.js        # Favorite event model
│   │   ├── routes/
│   │   │   ├── events.js          # Ticketmaster API routes
│   │   │   └── favorites.js       # Favorites CRUD routes
│   │   └── server.js              # Express server setup
│   ├── .env.example
│   ├── app.yaml                    # Google App Engine config
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # Shadcn UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── SearchForm.tsx
│   │   │   ├── EventCard.tsx
│   │   │   └── ResultsGrid.tsx
│   │   ├── pages/
│   │   │   ├── SearchPage.tsx
│   │   │   ├── EventDetailsPage.tsx
│   │   │   └── FavoritesPage.tsx
│   │   ├── lib/
│   │   │   └── utils.ts           # Utility functions
│   │   ├── App.tsx                # Main app with routing
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## API Endpoints

### Events Routes (`/api`)
- `GET /api/suggest?keyword=<keyword>` - Get autocomplete suggestions
- `GET /api/searchEvents?keyword=<keyword>&radius=<miles>&lat=<lat>&lng=<lng>&segmentId=<category>` - Search events
- `GET /api/eventDetails/:id` - Get event details
- `GET /api/venueDetails/:name` - Get venue details

### Favorites Routes (`/api/favorites`)
- `GET /api/favorites` - Get all favorites
- `POST /api/favorites` - Add a favorite
- `DELETE /api/favorites/:eventId` - Remove a favorite
- `GET /api/favorites/check/:eventId` - Check if event is favorited

## Deployment to Google Cloud

### Option 1: Google App Engine

1. Install Google Cloud SDK
2. Update `backend/app.yaml` with your environment variables
3. Build frontend:
```bash
cd frontend
npm run build
```

4. Deploy backend (which serves the frontend):
```bash
cd backend
gcloud app deploy
```

### Option 2: Google Cloud Run

1. Create a Dockerfile in the backend directory
2. Build and deploy:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/events-around
gcloud run deploy events-around --image gcr.io/PROJECT_ID/events-around --platform managed
```

## Environment Variables

### Backend (.env)
- `TICKETMASTER_API_KEY` - Your Ticketmaster API key
- `MONGO_URI` - MongoDB Atlas connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `VITE_GOOGLE_GEOCODE_KEY` - Google Maps Geocoding API key
- `VITE_IPINFO_TOKEN` - IPInfo API token

## Features Breakdown

### Search Page (`/search`)
- Keyword input with Ticketmaster autocomplete
- Category dropdown (All, Music, Sports, Arts & Theatre, Film, Miscellaneous)
- Location input with auto-detection or manual entry
- Distance selector (in miles)
- Form validation with error messages
- Results grid with event cards
- Favorite button on each card

### Event Details Page (`/event/:id`)
- Back to search button
- Event name and Buy Tickets link
- Favorite toggle button
- Three tabs:
  - **Info**: Date, artists, venue, genres, price, ticket status, seat map, social sharing
  - **Artists/Teams**: Spotify artist information (Music events only)
  - **Venue**: Name, address, parking info, rules

### Favorites Page (`/favorites`)
- List of all favorited events
- Same card layout as search results
- Sorted by date added
- Empty state when no favorites

## Notes

- The backend serves as a proxy for Ticketmaster API calls (required for API key security)
- Frontend makes direct calls to Google Geocoding API and IPInfo API
- Favorites are persisted in MongoDB Atlas
- Toast notifications show for favorite add/remove actions with undo functionality
- Responsive design tested on desktop and mobile (iPhone 14 Pro Max)

## Troubleshooting

### npm cache permission errors
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

### MongoDB connection issues
- Check that your IP is whitelisted in MongoDB Atlas Network Access
- Verify your connection string format
- Ensure database user has read/write permissions

### API key issues
- Ensure all `.env` files have the correct keys
- For local development, restart servers after updating `.env` files
- Check API key restrictions (especially for Google Geocoding API)

## License

This project is for educational purposes as part of CSCI 571 - Fall 2025.

## Credits

- **Ticketmaster API** for event data
- **MongoDB Atlas** for database hosting
- **Shadcn/UI** for UI components
- **Tailwind CSS** for styling
- **Lucide React** for icons
