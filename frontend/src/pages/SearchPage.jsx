import { useState } from 'react';
import { SearchForm } from '../components/SearchForm';
import { ResultsGrid } from '../components/ResultsGrid';

export function SearchPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (params) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const queryParams = new URLSearchParams({
        keyword: params.keyword,
        radius: params.distance,
        lat: params.lat || '',
        lng: params.lng || '',
        ...(params.category && { segmentId: params.category }),
      });

      const response = await fetch(`/api/searchEvents?${queryParams.toString()}`);
      const data = await response.json();

      // Parse the Ticketmaster API response
      const parsedEvents = [];

      if (data._embedded && data._embedded.events) {
        data._embedded.events.forEach((event) => {
          parsedEvents.push({
            eventId: event.id,
            name: event.name,
            date: event.dates?.start?.localDate || 'TBA',
            time: event.dates?.start?.localTime || '',
            venue: event._embedded?.venues?.[0]?.name || 'TBA',
            category:
              event.classifications?.[0]?.segment?.name || 'Miscellaneous',
            imageUrl: event.images?.[0]?.url || '/placeholder.png',
          });
        });

        // Sort by date and time
        parsedEvents.sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time || '00:00'}`);
          const dateB = new Date(`${b.date} ${b.time || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
        });
      }

      setEvents(parsedEvents);
    } catch (error) {
      console.error('Error searching events:', error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      <ResultsGrid
        events={events}
        isLoading={isLoading}
        hasSearched={hasSearched}
      />
    </div>
  );
}
