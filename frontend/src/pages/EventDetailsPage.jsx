import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

const formatDateTime = (date, time) => {
  if (!date) return "TBA";

  // Parse date string manually to avoid timezone issues
  // date is in format "YYYY-MM-DD"
  const [year, month, day] = date.split('-').map(Number);

  // Parse time if available (format "HH:MM:SS" or "HH:MM")
  let hours = 0, minutes = 0;
  if (time) {
    const timeParts = time.split(':');
    hours = parseInt(timeParts[0]);
    minutes = parseInt(timeParts[1]);
  }

  // Create date in local timezone
  const parsed = new Date(year, month - 1, day, hours, minutes);

  if (Number.isNaN(parsed.getTime())) {
    return `${date}${time ? `, ${time}` : ""}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(parsed);
};

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [spotifyData, setSpotifyData] = useState(null);
  const [loadingSpotify, setLoadingSpotify] = useState(false);

  useEffect(() => {
    if (id) {
      // Reset state when navigating to a new event
      // Don't reset eventDetails to null - let loading state handle the UI
      setSpotifyData(null);
      setActiveTab("info");
      setIsLoading(true); // Set loading immediately to prevent flash

      fetchEventDetails(id);
      checkIfFavorite(id);
    }
  }, [id]);

  useEffect(() => {
    if (eventDetails && activeTab === "artists" && !spotifyData) {
      const isMusic = eventDetails.genres.some((g) =>
        g.toLowerCase().includes("music")
      );
      if (isMusic && eventDetails.artists.length > 0) {
        fetchSpotifyData(eventDetails.artists[0]);
      }
    }
  }, [activeTab, eventDetails, spotifyData]);

  const fetchEventDetails = async (eventId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/eventDetails/${eventId}`);
      const data = await response.json();

      const details = {
        id: data.id,
        name: data.name,
        date: data.dates?.start?.localDate || "TBA",
        time: data.dates?.start?.localTime,
        artists: data._embedded?.attractions?.map((a) => a.name) || [],
        venue: data._embedded?.venues?.[0]?.name || "TBA",
        genres: [],
        ticketStatus: data.dates?.status?.code || "onsale",
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
        if (classifications.segment?.name)
          genreList.push(classifications.segment.name);
        if (classifications.genre?.name)
          genreList.push(classifications.genre.name);
        if (classifications.subGenre?.name)
          genreList.push(classifications.subGenre.name);
        if (classifications.type?.name)
          genreList.push(classifications.type.name);
        if (classifications.subType?.name)
          genreList.push(classifications.subType.name);
        const filtered = genreList.filter((g) => g && g !== "Undefined");
        details.genres = [...new Set(filtered.map((g) => g.trim()))];
      }

      // Parse venue info
      const venue = data._embedded?.venues?.[0];
      if (venue) {
        details.venueInfo = {
          name: venue.name,
          address: venue.address?.line1 || "",
          cityState: `${venue.city?.name || ""}, ${
            venue.state?.stateCode || ""
          }`.trim(),
          phoneNumber: venue.boxOfficeInfo?.phoneNumberDetail,
          openHours: venue.boxOfficeInfo?.openHoursDetail,
          generalRule: venue.generalInfo?.generalRule,
          childRule: venue.generalInfo?.childRule,
          lat: parseFloat(venue.location?.latitude),
          lng: parseFloat(venue.location?.longitude),
          parkingDetail: venue.parkingDetail,
          imageUrl: venue.images?.[0]?.url,
          venueUrl: venue.url, // Ticketmaster venue URL
        };
      }

      setEventDetails(details);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpotifyData = async (artistName) => {
    setLoadingSpotify(true);
    try {
      const encodedArtistName = encodeURIComponent(artistName);
      const response = await fetch(
        `/api/spotify/search/artist/${encodedArtistName}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch Spotify data");
      }

      const data = await response.json();
      setSpotifyData(data);
    } catch (error) {
      console.error("Error fetching Spotify data:", error);
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
      console.error("Error checking favorite status:", error);
    }
  };

  const addToFavorites = async () => {
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventDetails.id,
          name: eventDetails.name,
          date: eventDetails.date,
          time: eventDetails.time,
          venue: eventDetails.venue,
          category: eventDetails.genres[0] || "Event",
          imageUrl: eventDetails.imageUrl || "",
        }),
      });
      setIsFavorite(true);
    } catch (error) {
      console.error("Failed to add to favorites:", error);
      throw error;
    }
  };

  const removeFromFavorites = async () => {
    try {
      await fetch(`/api/favorites/${eventDetails.id}`, { method: "DELETE" });
      setIsFavorite(false);
    } catch (error) {
      console.error("Failed to remove from favorites:", error);
      throw error;
    }
  };

  const toggleFavorite = async () => {
    if (!eventDetails) return;

    if (isFavorite) {
      try {
        await removeFromFavorites();
        toast.info(`${eventDetails.name} removed from favorites!`, {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await addToFavorites();
                toast.success(`${eventDetails.name} re-added to favorites!`, {
                  description: "You can view it in the Favorites page.",
                });
              } catch (error) {
                toast.error("Failed to re-add to favorites");
              }
            },
          },
        });
      } catch (error) {
        toast.error("Failed to remove from favorites");
      }
    } else {
      try {
        await addToFavorites();
        toast.success(`${eventDetails.name} added to favorites!`, {
          description: "You can view it in the Favorites page.",
        });
      } catch (error) {
        toast.error("Failed to add to favorites");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "onsale":
        return "bg-green-600 text-white";
      case "offsale":
        return "bg-red-600 text-white";
      case "canceled":
      case "cancelled":
        return "bg-black text-white";
      case "postponed":
      case "rescheduled":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      onsale: "On Sale",
      offsale: "Off Sale",
      canceled: "Canceled",
      cancelled: "Canceled",
      postponed: "Postponed",
      rescheduled: "Rescheduled",
    };
    return labels[status.toLowerCase()] || status;
  };

  const shareOnFacebook = () => {
    if (!eventDetails?.buyTicketUrl) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        eventDetails.buyTicketUrl
      )}`,
      "_blank"
    );
  };

  const shareOnTwitter = () => {
    if (!eventDetails?.buyTicketUrl) return;
    const text = `Check ${eventDetails.name} on Ticketmaster. ${eventDetails.buyTicketUrl}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank"
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
        <Button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/search")
          }
          className="mt-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </div>
    );
  }

  const isMusic = eventDetails.genres.some((g) =>
    g.toLowerCase().includes("music")
  );

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <button
          onClick={() =>
            window.history.length > 1 ? navigate(-1) : navigate("/search")
          }
          className="text-primary hover:underline flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
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
                <Button className="bg-black hover:bg-gray-800">
                  Buy Tickets
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            )}
            <button
              onClick={toggleFavorite}
              className="h-10 w-10 rounded-md border flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-6 w-full"
      >
        <TabsList
          className="flex w-full bg-[#ECEDEF] rounded-lg px-1 py-1
               border border-gray-300"
        >
          <TabsTrigger
            value="info"
            className={`flex-1 h-7 rounded-md text-sm transition-all text-black
                 ${activeTab === "info" ? "bg-white shadow-sm" : ""}`}
          >
            Info
          </TabsTrigger>

          <TabsTrigger
            value="artists"
            disabled={!isMusic}
            className={`flex-1 h-7 rounded-md text-sm transition-all text-black
                 ${activeTab === "artists" ? "bg-white shadow-sm" : ""}
                 disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            Artist
          </TabsTrigger>

          <TabsTrigger
            value="venue"
            className={`flex-1 h-7 rounded-md text-sm transition-all text-black
                 ${activeTab === "venue" ? "bg-white shadow-sm" : ""}`}
          >
            Venue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-1 text-gray-600">Date</h3>
                <p className="text-sm text-black">
                  {formatDateTime(eventDetails.date, eventDetails.time)}
                </p>
              </div>

              {eventDetails.artists.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-gray-600">Artist/Team</h3>
                  <p className="text-sm text-black">{eventDetails.artists.join(", ")}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-sm mb-1 text-gray-600">Venue</h3>
                <p className="text-sm text-black">{eventDetails.venue}</p>
              </div>

              {eventDetails.genres.length > 0 &&
                !eventDetails.genres.every(
                  (g) => g.toLowerCase() === "n/a"
                ) && (
                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-gray-600">Genres</h3>
                    <p className="text-sm text-black">{eventDetails.genres.join(", ")}</p>
                  </div>
                )}

              {eventDetails.priceRange && (
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-gray-600">Price Range</h3>
                  <p className="text-sm text-black">{eventDetails.priceRange}</p>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-sm mb-1 text-gray-600">Ticket Status</h3>
                <Badge className={getStatusColor(eventDetails.ticketStatus)}>
                  {getStatusLabel(eventDetails.ticketStatus)}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 text-gray-600">Share</h3>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={shareOnFacebook}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-600">Seatmap</h3>
              {eventDetails.seatMapUrl ? (
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-white">
                  <img
                    src={eventDetails.seatMapUrl}
                    alt="Seat Map"
                    className="w-full h-auto object-contain max-h-[500px]"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Seat map not available for this event.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="artists" className="mt-6">
          {loadingSpotify ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : spotifyData ? (
            <div className="space-y-6">
              {/* Artist Info Section - Horizontal Layout matching reference */}
              <div className="flex gap-3 items-center">
                {/* Artist Image */}
                {spotifyData.imageUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={spotifyData.imageUrl}
                      alt={spotifyData.name}
                      className="w-24 h-24 rounded object-cover"
                    />
                  </div>
                )}

                {/* Artist Details - Inline */}
                <div className="flex-1">
                  <h3 className="text-base font-bold mb-0.5">
                    {spotifyData.name}
                  </h3>
                  <p className="text-xs text-gray-700 mb-0.5">
                    <span className="font-semibold">Followers: </span>
                    {spotifyData.followers.toLocaleString()}
                    <span className="ml-4">
                      <span className="font-semibold">Popularity: </span>
                      {spotifyData.popularity}%
                    </span>
                  </p>
                  <p className="text-xs text-gray-700 mb-1.5">
                    <span className="font-semibold">Genres: </span>
                    {spotifyData.genres && spotifyData.genres.length > 0
                      ? spotifyData.genres.join(", ")
                      : "N/A"}
                  </p>
                  {spotifyData.spotifyUrl && (
                    <a
                      href={spotifyData.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                    >
                      Open in Spotify
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Albums Section */}
              {spotifyData.albums && spotifyData.albums.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-base">Albums</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {spotifyData.albums.map((album, index) => (
                      <a
                        key={index}
                        href={album.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="overflow-hidden">
                          <img
                            src={album.imageUrl}
                            alt={album.name}
                            className="w-full aspect-square object-cover"
                          />
                        </div>
                        <div className="p-3 space-y-0.5">
                          <p className="font-semibold text-sm line-clamp-2 text-black">
                            {album.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {album.releaseDate}
                          </p>
                          <p className="text-xs text-gray-600">
                            {album.totalTracks} tracks
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No artist information available
            </p>
          )}
        </TabsContent>

        <TabsContent value="venue" className="mt-6">
          {eventDetails.venueInfo ? (
            <div className="space-y-4">
              {/* Header with name, address, and See Events button */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1">
                    {eventDetails.venueInfo.name}
                  </h3>
                  {eventDetails.venueInfo.lat && eventDetails.venueInfo.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${eventDetails.venueInfo.lat},${eventDetails.venueInfo.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-gray-600 inline-flex items-center gap-1 hover:opacity-70"
                    >
                      <span>
                        {eventDetails.venueInfo.address
                          ? `${eventDetails.venueInfo.address}, ${eventDetails.venueInfo.cityState}`
                          : eventDetails.venueInfo.cityState}
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <p className="text-base text-gray-600">
                      {eventDetails.venueInfo.address
                        ? `${eventDetails.venueInfo.address}, ${eventDetails.venueInfo.cityState}`
                        : eventDetails.venueInfo.cityState}
                    </p>
                  )}
                </div>

                {eventDetails.venueInfo.venueUrl && (
                  <a
                    href={eventDetails.venueInfo.venueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full md:w-auto"
                    >
                      See Events
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                )}
              </div>

              {/* Venue Image and Details Layout */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column - Venue Image */}
                {eventDetails.venueInfo.imageUrl && (
                  <div className="flex-shrink-0 w-full md:w-auto">
                    <img
                      src={eventDetails.venueInfo.imageUrl}
                      alt={eventDetails.venueInfo.name}
                      className="w-full md:w-200 h-auto md:h-64 object-cover border border-gray-300 rounded-lg"
                    />
                  </div>
                )}

                {/* Right Column - Venue Details */}
                <div className="flex-1 space-y-6">
                  {eventDetails.venueInfo.parkingDetail && (
                    <div>
                      <h3 className="text-base mb-1 text-gray-700">Parking</h3>
                      <p className="text-sm text-black">
                        {eventDetails.venueInfo.parkingDetail}
                      </p>
                    </div>
                  )}

                  {eventDetails.venueInfo.generalRule && (
                    <div>
                      <h3 className="text-base mb-1 text-gray-700">
                        General Rule
                      </h3>
                      <p className="text-sm text-black">
                        {eventDetails.venueInfo.generalRule}
                      </p>
                    </div>
                  )}

                  {eventDetails.venueInfo.childRule && (
                    <div>
                      <h3 className="text-base mb-1 text-gray-700">
                        Child Rule
                      </h3>
                      <p className="text-sm text-black">
                        {eventDetails.venueInfo.childRule}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No venue information available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
