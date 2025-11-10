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
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            No favorite events yet
          </h3>
          <p className="text-muted-foreground">
            Start adding events to your favorites from the search page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Favorites</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((event) => (
          <EventCard key={event.eventId} event={event} />
        ))}
      </div>
    </div>
  );
}
