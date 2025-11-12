import { EventCard } from "./EventCard";
import { Loader2, Search } from "lucide-react";

export function ResultsGrid({ events, isLoading, hasSearched }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Searching for events...</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <Search className="w-12 h-12 text-gray-400" strokeWidth={2} />
        <p className="text-gray-500 text-center">
          Enter search criteria and click the Search button to find events.
        </p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm space-y-4">
        <Search className="h-12 w-12 text-gray-400" aria-hidden="true" />
        <div className="text-center space-y-1">
          <h3 className="text-xl font-semibold text-gray-900">Nothing found</h3>
          <p className="text-muted-foreground">
            Update the query to find events near you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard key={event.eventId} event={event} />
        ))}
      </div>
    </div>
  );
}
