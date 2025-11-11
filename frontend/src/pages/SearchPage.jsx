import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchForm } from '../components/SearchForm';
import { ResultsGrid } from '../components/ResultsGrid';

const RESULTS_STORAGE_KEY = 'searchResultsState';
const SCROLL_STORAGE_KEY = 'searchScrollPosition';

export function SearchPage() {
  const storedState = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = window.sessionStorage.getItem(RESULTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const [events, setEvents] = useState(storedState?.events || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(storedState?.hasSearched || false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedScroll = window.sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (savedScroll !== null) {
      window.requestAnimationFrame(() => {
        window.scrollTo(0, Number(savedScroll));
        window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
      });
    }
  }, []);

  const persistResultsState = useCallback((nextEvents, searched) => {
    if (typeof window === 'undefined') return;
    const state = {
      events: nextEvents,
      hasSearched: searched,
    };
    try {
      window.sessionStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist search results state', error);
    }
  }, []);

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
      persistResultsState(parsedEvents, true);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(SCROLL_STORAGE_KEY);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error searching events:', error);
      setEvents([]);
      persistResultsState([], true);
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
