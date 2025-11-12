import { useState, useEffect } from 'react';
import { EventCard } from '../components/EventCard';
import { Loader2 } from 'lucide-react';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites');
      const data = await response.json();

      const parsedFavorites = data.favorites.map((fav) => ({
        eventId: fav.eventId,
        name: fav.name,
        date: fav.date,
        time: fav.time,
        venue: fav.venue,
        category: fav.category,
        imageUrl: fav.imageUrl,
      }));

      setFavorites(parsedFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteChange = (eventId, isFavorite) => {
    if (isFavorite) {
      // Re-fetch to get the updated list when an item is re-added
      fetchFavorites();
    } else {
      // Remove the item from the list immediately
      setFavorites(prevFavorites =>
        prevFavorites.filter(event => event.eventId !== eventId)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading favorites...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Favorites</h1>
        <div className="text-center py-12 space-y-2">
          <p className="text-gray-900 text-lg font-medium">
            No favorite events yet
          </p>
          <p className="text-gray-600 text-sm">
            Add events to your favorites by clicking the heart icon on any event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((event) => (
          <EventCard
            key={event.eventId}
            event={event}
            onFavoriteChange={handleFavoriteChange}
          />
        ))}
      </div>
    </div>
  );
}
