import { Heart } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function EventCard({ event }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(true);

  // Format date and time like: "Oct 25, 2026, 05:30 PM"
  const formatDateTime = () => {
    if (!event.date) return '';

    const dateObj = new Date(event.date);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (event.time) {
      // Parse time in HH:MM format and convert to 12-hour format with AM/PM
      const [hours, minutes] = event.time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const timeStr = `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
      return `${dateStr}, ${timeStr}`;
    }

    return dateStr;
  };

  useEffect(() => {
    checkIfFavorite();
  }, [event.eventId]);

  const checkIfFavorite = async () => {
    try {
      const response = await fetch(`/api/favorites/check/${event.eventId}`);
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setIsCheckingFavorite(false);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

    if (isFavorite) {
      // Remove from favorites
      try {
        const response = await fetch(`/api/favorites/${event.eventId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorite(false);
          toast(`${event.name} removed from favorites!`, {
            icon: 'ℹ️',
            action: {
              label: 'Undo',
              onClick: async () => {
                await handleFavoriteClick(e);
                toast.success(`${event.name} added to favorites!`);
              },
            },
          });
        }
      } catch (error) {
        console.error('Error removing favorite:', error);
        toast.error('Failed to remove from favorites');
      }
    } else {
      // Add to favorites
      try {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success(`${event.name} added to favorites!`, {
            description: 'You can view it in the Favorites page.',
          });
        }
      } catch (error) {
        console.error('Error adding favorite:', error);
        toast.error('Failed to add to favorites');
      }
    }
  };

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('searchScrollPosition', String(window.scrollY));
    }
    navigate(`/event/${event.eventId}`);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative aspect-[16/10]">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white text-gray-900 font-medium shadow-sm">
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded text-xs font-medium shadow-sm">
          {formatDateTime()}
        </div>
        <button
          onClick={handleFavoriteClick}
          disabled={isCheckingFavorite}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white hover:bg-gray-50 transition-colors shadow-md"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
            }`}
          />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-bold text-base line-clamp-2 group-hover:text-primary transition-colors">
          {event.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{event.venue}</p>
      </div>
    </Card>
  );
}
