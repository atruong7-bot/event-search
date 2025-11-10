# API Keys Setup Guide

## Required API Keys

### 1. Ticketmaster API (Required for search)

**Get your key:**
1. Visit: https://developer.ticketmaster.com/
2. Click "Get Your API Key"
3. Sign up for a free account
4. Create a new app
5. Copy your **Consumer Key** (this is your API key)

**Add to backend/.env:**
```env
TICKETMASTER_API_KEY=your_consumer_key_here
```

**Rate Limits:** 5000 requests per day (free tier)

---

### 2. Google Geocoding API (Required for location search)

**Get your key:**
1. Visit: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Go to "APIs & Services" → "Library"
4. Search for "Geocoding API" and click "Enable"
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy your API key
7. (Optional) Click "Restrict Key" to limit usage to specific websites

**Add to frontend/.env:**
```env
VITE_GOOGLE_GEOCODE_KEY=your_google_api_key_here
```

**Important:** For production, restrict the key to your domain only.

---

### 3. IPInfo API (Required for auto-detect location)

**Get your token:**
1. Visit: https://ipinfo.io/signup
2. Sign up for a free account
3. Go to your dashboard
4. Copy your **Access Token**

**Add to frontend/.env:**
```env
VITE_IPINFO_TOKEN=your_ipinfo_token_here
```

**Rate Limits:** 50,000 requests per month (free tier)

---

### 4. MongoDB Atlas (Required for favorites feature)

**Setup database:**
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Click "Build a Database" → Choose "Free" (M0 Sandbox)
4. Select cloud provider and region (choose one closest to you)
5. Create cluster (takes 1-3 minutes)

**Create database user:**
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

**Whitelist your IP:**
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. For testing: Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
4. For production: Add your server's specific IP address
5. Click "Confirm"

**Get connection string:**
1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster...`)
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `events-around`

**Add to backend/.env:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/events-around?retryWrites=true&w=majority
```

---

## Optional API Keys

### 5. Spotify API (Optional - for artist information)

**Get your credentials:**
1. Visit: https://developer.spotify.com/dashboard/
2. Log in with Spotify account
3. Click "Create App"
4. Fill in app name and description
5. Accept terms and click "Create"
6. Copy **Client ID** and **Client Secret**

**Add to frontend/.env:**
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

**Note:** Spotify integration requires additional backend setup. See requirements.txt for details.

---

## Testing Your Setup

### Test without API keys (limited functionality):
- Frontend will load but searches won't work
- You can see the UI design

### Test with just Ticketmaster + Google + IPInfo:
- Full search functionality works
- Event details work
- Favorites won't persist (need MongoDB)

### Full functionality requires all keys above

---

## Security Best Practices

1. **Never commit .env files to git**
   - Already in .gitignore
   - Use .env.example as template

2. **Rotate keys if exposed**
   - If you accidentally commit keys, regenerate them immediately

3. **Use environment-specific keys**
   - Different keys for development and production

4. **Restrict API keys in production**
   - Google: Restrict to your domain
   - MongoDB: Use specific IP addresses (not 0.0.0.0/0)

5. **Monitor usage**
   - Check API dashboards for unexpected usage
   - Set up billing alerts if using paid tiers

---

## Cost Summary

All required APIs have free tiers sufficient for this project:
- ✅ Ticketmaster: Free (5000 req/day)
- ✅ Google Geocoding: Free ($200 credit, ~40k requests)
- ✅ IPInfo: Free (50k req/month)
- ✅ MongoDB Atlas: Free (512MB storage)
- ✅ Spotify: Free

**Total cost: $0** for development and moderate usage! 🎉

---

## Troubleshooting

### "API key invalid" error
- Double-check you copied the entire key
- Make sure no extra spaces before/after the key
- Verify the key is enabled in the provider's dashboard

### "MongoDB connection failed"
- Check your IP is whitelisted in MongoDB Atlas
- Verify the connection string format
- Make sure you replaced `<password>` with actual password
- Ensure database user has read/write permissions

### "CORS errors"
- For development, backend proxy handles this
- For production, configure allowed origins in backend

### "Rate limit exceeded"
- Wait for the limit to reset (usually 24 hours)
- Upgrade to paid tier if needed
- Implement caching to reduce API calls

---

## Quick Setup Checklist

- [ ] Get Ticketmaster API key
- [ ] Get Google Geocoding API key
- [ ] Get IPInfo token
- [ ] Set up MongoDB Atlas cluster
- [ ] Create database user in MongoDB
- [ ] Whitelist IP in MongoDB
- [ ] Get MongoDB connection string
- [ ] Add all keys to backend/.env
- [ ] Add all keys to frontend/.env
- [ ] Test the application

---

Need help? Check the main README.md or SETUP_GUIDE.md for more details!
