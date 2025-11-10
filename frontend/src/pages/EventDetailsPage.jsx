import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ExternalLink, Loader2, FacebookIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

// X (Twitter) Icon component
const XIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [spotifyData, setSpotifyData] = useState(null);
  const [loadingSpotify, setLoadingSpotify] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails(id);
      checkIfFavorite(id);
    }
  }, [id]);

  useEffect(() => {
    if (eventDetails && activeTab === 'artists' && !spotifyData) {
      const isMusic = eventDetails.genres.some(g =>
        g.toLowerCase().includes('music')
      );
      if (isMusic && eventDetails.artists.length > 0) {
        fetchSpotifyData(eventDetails.artists[0]);
      }
    }
  }, [activeTab, eventDetails]);

  const fetchEventDetails = async (eventId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/eventDetails/${eventId}`);
      const data = await response.json();

      const details = {
        id: data.id,
        name: data.name,
        date: data.dates?.start?.localDate || 'TBA',
        time: data.dates?.start?.localTime,
        artists: data._embedded?.attractions?.map((a) => a.name) || [],
        venue: data._embedded?.venues?.[0]?.name || 'TBA',
        genres: [],
        ticketStatus: data.dates?.status?.code || 'onsale',
        buyTicketUrl: data.url,
        seatMapUrl: data.seatmap?.staticUrl,
        imageUrl: data.images?.[0]?.url,
        priceRange: data.priceRanges?.[0]
          ? `$${data.priceRanges[0].min} - $${data.priceRanges[0].max}`
          : undefined,
      };

      // Parse genres
      const classifications = data.classifications?.[0];
      if (classifications) {
        const genreList = [];
        if (classifications.segment?.name) genreList.push(classifications.segment.name);
        if (classifications.genre?.name) genreList.push(classifications.genre.name);
        if (classifications.subGenre?.name) genreList.push(classifications.subGenre.name);
        if (classifications.type?.name) genreList.push(classifications.type.name);
        if (classifications.subType?.name) genreList.push(classifications.subType.name);
        details.genres = genreList.filter((g) => g && g !== 'Undefined');
      }

      // Parse venue info
      const venue = data._embedded?.venues?.[0];
      if (venue) {
        details.venueInfo = {
          name: venue.name,
          address: venue.address?.line1 || '',
          cityState: `${venue.city?.name || ''}, ${venue.state?.stateCode || ''}`.trim(),
          phoneNumber: venue.boxOfficeInfo?.phoneNumberDetail,
          openHours: venue.boxOfficeInfo?.openHoursDetail,
          generalRule: venue.generalInfo?.generalRule,
          childRule: venue.generalInfo?.childRule,
          lat: parseFloat(venue.location?.latitude),
          lng: parseFloat(venue.location?.longitude),
          parkingDetail: venue.parkingDetail,
          imageUrl: venue.images?.[0]?.url,
        };
      }

      setEventDetails(details);
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpotifyData = async (artistName) => {
    setLoadingSpotify(true);
    try {
      const encodedArtistName = encodeURIComponent(artistName);
      const response = await fetch(`/api/spotify/search/artist/${encodedArtistName}`);

      if (!response.ok) {
        throw new Error('Failed to fetch Spotify data');
      }

      const data = await response.json();
      setSpotifyData(data);
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
      // Set null to show error state
      setSpotifyData(null);
    } finally {
      setLoadingSpotify(false);
    }
  };

  const checkIfFavorite = async (eventId) => {
    try {
      const response = await fetch(`/api/favorites/check/${eventId}`);
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!eventDetails) return;

    if (isFavorite) {
      try {
        await fetch(`/api/favorites/${eventDetails.id}`, { method: 'DELETE' });
        setIsFavorite(false);
        toast(`${eventDetails.name} removed from favorites!`, {
          icon: 'ℹ️',
          action: {
            label: 'Undo',
            onClick: async () => {
              await toggleFavorite();
              toast.success(`${eventDetails.name} added to favorites!`);
            },
          },
        });
      } catch (error) {
        toast.error('Failed to remove from favorites');
      }
    } else {
      try {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: eventDetails.id,
            name: eventDetails.name,
            date: eventDetails.date,
            time: eventDetails.time,
            venue: eventDetails.venue,
            category: eventDetails.genres[0] || 'Event',
            imageUrl: eventDetails.imageUrl || '',
          }),
        });
        setIsFavorite(true);
        toast.success(`${eventDetails.name} added to favorites!`, {
          description: 'You can view it in the Favorites page.',
        });
      } catch (error) {
        toast.error('Failed to add to favorites');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'onsale':
        return 'bg-green-600 text-white';
      case 'offsale':
        return 'bg-red-600 text-white';
      case 'canceled':
      case 'cancelled':
        return 'bg-black text-white';
      case 'postponed':
      case 'rescheduled':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      onsale: 'On Sale',
      offsale: 'Off Sale',
      canceled: 'Canceled',
      cancelled: 'Canceled',
      postponed: 'Postponed',
      rescheduled: 'Rescheduled',
    };
    return labels[status.toLowerCase()] || status;
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const shareOnTwitter = () => {
    const text = eventDetails ? `Check out ${eventDetails.name}!` : 'Check out this event!';
    const url = window.location.href;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!eventDetails) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <Button onClick={() => navigate('/search')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </div>
    );
  }

  const isMusic = eventDetails.genres.some(g => g.toLowerCase().includes('music'));

  return (
    <div className="max-w-5xl mx-auto">
      {/* Unified Container with Header and Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header Section */}
        <div className="p-6">
          <button
            onClick={() => navigate('/search')}
            className="text-primary hover:underline flex items-center gap-1 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </button>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold flex-1">{eventDetails.name}</h1>
            <div className="flex items-center gap-3">
              {eventDetails.buyTicketUrl && (
                <a
                  href={eventDetails.buyTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button>
                    Buy Tickets
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              )}
              <button
                onClick={toggleFavorite}
                className="p-3 rounded-full border hover:bg-gray-50 transition-colors"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 rounded-none border-t">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="artists" disabled={!isMusic}>
              Artist/Teams
            </TabsTrigger>
            <TabsTrigger value="venue">Venue</TabsTrigger>
          </TabsList>

        <TabsContent value="info" className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Date</h3>
                <p>{eventDetails.date} {eventDetails.time && `at ${eventDetails.time}`}</p>
              </div>

              {eventDetails.artists.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Artist/Team</h3>
                  <p>{eventDetails.artists.join(', ')}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Venue</h3>
                <p>{eventDetails.venue}</p>
              </div>

              {eventDetails.genres.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {eventDetails.genres.map((genre, index) => (
                      <Badge key={index} variant="secondary">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {eventDetails.priceRange && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Price Range</h3>
                  <p>{eventDetails.priceRange}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Ticket Status</h3>
                <Badge className={getStatusColor(eventDetails.ticketStatus)}>
                  {getStatusLabel(eventDetails.ticketStatus)}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Share on</h3>
                <div className="flex gap-3">
                  <button
                    onClick={shareOnFacebook}
                    className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="p-2 rounded-full bg-black text-white hover:bg-gray-800"
                  >
                    <XIcon />
                  </button>
                </div>
              </div>
            </div>

            {eventDetails.seatMapUrl && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Seat Map</h3>
                <img
                  src={eventDetails.seatMapUrl}
                  alt="Seat Map"
                  className="w-full rounded-lg border"
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="artists" className="p-6">
          {loadingSpotify ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : spotifyData ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold">{spotifyData.name}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Followers</p>
                    <p className="font-semibold">{spotifyData.followers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Popularity</p>
                    <p className="font-semibold">{spotifyData.popularity}%</p>
                  </div>
                </div>
                {spotifyData.spotifyUrl && (
                  <a
                    href={spotifyData.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline inline-block"
                  >
                    View on Spotify
                  </a>
                )}
              </div>

              {/* Albums Section */}
              {spotifyData.albums && spotifyData.albums.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Popular Albums</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {spotifyData.albums.map((album, index) => (
                      <a
                        key={index}
                        href={album.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group"
                      >
                        <div className="space-y-2">
                          <img
                            src={album.imageUrl}
                            alt={album.name}
                            className="w-full aspect-square object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                          />
                          <p className="font-medium text-sm line-clamp-1 group-hover:text-green-600 transition-colors">
                            {album.name}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No artist information available</p>
          )}
        </TabsContent>

        <TabsContent value="venue" className="p-6">
          {eventDetails.venueInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Venue Image */}
              {eventDetails.venueInfo.imageUrl && (
                <div>
                  <img
                    src={eventDetails.venueInfo.imageUrl}
                    alt={eventDetails.venueInfo.name}
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              {/* Right Column - Venue Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{eventDetails.venueInfo.name}</h3>
                  {eventDetails.venueInfo.lat && eventDetails.venueInfo.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${eventDetails.venueInfo.lat},${eventDetails.venueInfo.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {eventDetails.venueInfo.address}, {eventDetails.venueInfo.cityState}
                    </a>
                  ) : (
                    <p className="text-sm">
                      {eventDetails.venueInfo.address}, {eventDetails.venueInfo.cityState}
                    </p>
                  )}
                </div>

                {eventDetails.buyTicketUrl && (
                  <div>
                    <a
                      href={eventDetails.buyTicketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        See Events
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </div>
                )}

                {eventDetails.venueInfo.parkingDetail && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Parking</h3>
                    <p className="text-sm text-gray-600">{eventDetails.venueInfo.parkingDetail}</p>
                  </div>
                )}

                {eventDetails.venueInfo.generalRule && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">General Rule</h3>
                    <p className="text-sm text-gray-600">{eventDetails.venueInfo.generalRule}</p>
                  </div>
                )}

                {eventDetails.venueInfo.childRule && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Child Rule</h3>
                    <p className="text-sm text-gray-600">{eventDetails.venueInfo.childRule}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No venue information available</p>
          )}
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
