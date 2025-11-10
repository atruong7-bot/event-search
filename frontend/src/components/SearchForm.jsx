import { useState, useEffect, useCallback } from "react";
import { Autocomplete, Select } from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Search } from "lucide-react";

const CATEGORIES = [
  { value: "All", label: "All", segmentId: "" },
  { value: "Music", label: "Music", segmentId: "KZFzniwnSyZfZ7v7nJ" },
  { value: "Sports", label: "Sports", segmentId: "KZFzniwnSyZfZ7v7nE" },
  {
    value: "Arts & Theatre",
    label: "Arts & Theatre",
    segmentId: "KZFzniwnSyZfZ7v7na",
  },
  { value: "Film", label: "Film", segmentId: "KZFzniwnSyZfZ7v7nn" },
  {
    value: "Miscellaneous",
    label: "Miscellaneous",
    segmentId: "KZFzniwnSyZfZ7v7n1",
  },
];

const GOOGLE_GEOCODE_KEY = import.meta.env.VITE_GOOGLE_GEOCODE_KEY || "";
const IPINFO_TOKEN = import.meta.env.VITE_IPINFO_TOKEN || "";

export function SearchForm({ onSearch, isLoading }) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("");
  const [distance, setDistance] = useState("10");
  const [autoDetect, setAutoDetect] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-detect location
  useEffect(() => {
    if (autoDetect) {
      setLocation("");
      fetchUserLocation();
    }
  }, [autoDetect]);

  const fetchUserLocation = async () => {
    try {
      const response = await fetch(
        `https://ipinfo.io/json?token=${IPINFO_TOKEN}`
      );
      const data = await response.json();
      const [lat, lng] = data.loc.split(",");
      setLocation(`${lat},${lng}`);
    } catch (error) {
      console.error("Error fetching user location:", error);
      setErrors({ location: "Failed to auto-detect location" });
    }
  };

  // Debounced autocomplete
  useEffect(() => {
    if (!keyword || keyword.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingSuggestions(true);
      try {
        const response = await fetch(
          `/api/suggest?keyword=${encodeURIComponent(keyword)}`
        );
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const validateForm = useCallback(async () => {
    const newErrors = {};

    if (!keyword.trim()) {
      newErrors.keyword = "Please enter some keywords";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (!autoDetect && !location.trim()) {
      newErrors.location = "Location is required when auto-detect is disabled";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [keyword, category, location, autoDetect]);

  const geocodeLocation = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_GEOCODE_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat: lat.toString(), lng: lng.toString() };
      }
      throw new Error("Location not found");
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    try {
      let lat, lng;

      if (autoDetect) {
        [lat, lng] = location.split(",");
      } else {
        const coords = await geocodeLocation(location);
        lat = coords.lat;
        lng = coords.lng;
      }

      const selectedCategory = CATEGORIES.find((c) => c.value === category);

      onSearch({
        keyword: keyword.trim(),
        category: selectedCategory?.segmentId || "",
        lat,
        lng,
        distance,
      });
    } catch (error) {
      setErrors({ location: "Failed to geocode location. Please try again." });
    }
  };

  // Clear specific field error when value becomes valid
  const clearFieldError = (fieldName) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  // Handle keyword change (don't clear error while typing)
  const handleKeywordChange = (value) => {
    setKeyword(value);
  };

  // Handle suggestion click and clear error
  const handleSuggestionClick = (value) => {
    setKeyword(value);
    if (value.trim()) {
      clearFieldError("keyword");
    }
  };

  // Handle category change and clear error if valid
  const handleCategoryChange = (value) => {
    setCategory(value);
    if (value) {
      clearFieldError("category");
    }
  };

  // Handle location change and clear error if valid
  const handleLocationChange = (value) => {
    setLocation(value);
    if (value.trim()) {
      clearFieldError("location");
    }
  };

  // Clear location error when auto-detect is enabled
  useEffect(() => {
    if (autoDetect) {
      clearFieldError("location");
    }
  }, [autoDetect]);

  const handleClear = () => {
    setKeyword("");
    setCategory("All");
    setLocation("");
    setDistance("10");
    setAutoDetect(false);
    setSuggestions([]);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Keywords */}
        <div className="col-span-3">
          <Label htmlFor="keyword" className="mb-2 block text-sm font-medium">
            <span className={errors.keyword ? "text-red-500" : ""}>
              Keywords
            </span>{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Autocomplete
            id="keyword"
            placeholder="Search for events..."
            value={keyword}
            onChange={handleKeywordChange}
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
            isLoading={isFetchingSuggestions}
            className={errors.keyword ? "border-red-500" : ""}
          />
          <div className="h-5 mt-1">
            {errors.keyword && (
              <p className="text-red-500 text-xs">{errors.keyword}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="col-span-2">
          <Label htmlFor="category" className="mb-2 block text-sm font-medium">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            id="category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={errors.category ? "border-red-500" : ""}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
          <div className="h-5 mt-1">
            {errors.category && (
              <p className="text-red-500 text-xs">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Location + Auto-detect toggle */}
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="location" className="text-sm font-medium">
              <span className={errors.location ? "text-red-500" : ""}>
                Location
              </span>{" "}
              {!autoDetect && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="autoDetect" className="text-sm font-medium">
                <span className={errors.location ? "text-red-500" : ""}>
                  Auto-detect Location
                </span>
              </Label>
              <Switch
                id="autoDetect"
                checked={autoDetect}
                onCheckedChange={setAutoDetect}
              />
            </div>
          </div>

          <Input
            id="location"
            type="text"
            placeholder={
              autoDetect
                ? "Location will be autodetected"
                : "Enter city, district, or street..."
            }
            value={autoDetect ? "" : location}
            onChange={(e) => handleLocationChange(e.target.value)}
            disabled={autoDetect}
            className={errors.location ? "border-red-500" : ""}
          />
          <div className="h-5 mt-1">
            {errors.location && (
              <p className="text-red-500 text-xs">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Distance */}
        <div className="col-span-2">
          <Label htmlFor="distance" className="mb-2 block text-sm font-medium">
            Distance <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="distance"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              min="1"
              className="pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              miles
            </span>
          </div>
          <div className="h-5 mt-1"></div>
        </div>

        {/* Search Button */}
        <div className="col-span-2">
          <Label className="mb-2 block text-sm font-medium opacity-0">
            Button
          </Label>
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-black/85"
          >
            <Search
              size={20}
              strokeWidth={2.5}
              className="text-white mt-[1px]"
            />
            Search Events
          </Button>
          <div className="h-5 mt-1"></div>
        </div>
      </div>
    </form>
  );
}
