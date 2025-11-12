import express from "express";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const router = express.Router();

// Initialize Spotify API client with client credentials flow
let spotifyApi = null;

async function getSpotifyClient() {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify credentials not configured");
  }

  if (!spotifyApi) {
    spotifyApi = SpotifyApi.withClientCredentials(
      process.env.SPOTIFY_CLIENT_ID,
      process.env.SPOTIFY_CLIENT_SECRET
    );
  }

  return spotifyApi;
}

// Search for artist by name
router.get("/search/artist/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ error: "Artist name is required" });
    }

    const client = await getSpotifyClient();

    // Search for the artist
    const searchResult = await client.search(name, ["artist"], undefined, 1);

    if (!searchResult.artists.items.length) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const artist = searchResult.artists.items[0];

    // Get full artist details (includes genres)
    const fullArtist = await client.artists.get(artist.id);

    // Get artist's albums (first page only, max 50 items)
    // As per assignment requirements: return only albums (not singles/compilations)
    const albumsResult = await client.artists.albums(
      artist.id,
      undefined,
      undefined,
      50,
      0
    );

    // Format the response
    const artistData = {
      name: fullArtist.name,
      followers: fullArtist.followers.total,
      popularity: fullArtist.popularity,
      spotifyUrl: fullArtist.external_urls.spotify,
      imageUrl: fullArtist.images[0]?.url || "",
      genres: fullArtist.genres || [],
      albums: albumsResult.items.map((album) => ({
        name: album.name,
        imageUrl: album.images[0]?.url || "",
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        spotifyUrl: album.external_urls.spotify,
        albumType: album.album_type,
      })),
    };

    res.json(artistData);
  } catch (error) {
    console.error("Error fetching artist data from Spotify:", error);
    res.status(500).json({
      error: "Failed to fetch artist data",
      message: error.message,
    });
  }
});

export default router;
