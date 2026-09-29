import React, { useState, useEffect, useRef } from 'react';
import { geocodeSearch } from '../services/api';
import { LocationMetadata } from '../types';
import { Search, MapPin, Loader2, Navigation, Compass, Sparkles } from 'lucide-react';

interface UniversalSearchProps {
  onSelectLocation: (location: LocationMetadata) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const UniversalSearch: React.FC<UniversalSearchProps> = ({
  onSelectLocation,
  isLoading = false,
  placeholder = 'Search any place in India (e.g. Varanasi, Hampi, Konark, Jaipur)...',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationMetadata[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const results = await geocodeSearch(query);
        const list = Array.isArray(results) ? results : [];
        setSuggestions(list);
        setDropdownOpen(list.length > 0);
      } catch (err: any) {
        setError(err.message || 'Location not found');
        setSuggestions([]);
        setDropdownOpen(false);
      } finally {
        setSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationMetadata) => {
    setQuery(loc.placeName);
    setDropdownOpen(false);
    onSelectLocation(loc);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by browser.');
      return;
    }

    setSearching(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          // Reverse geocode via nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
          );
          const data = await res.json();
          const addr = data.address || {};
          const placeName =
            addr.historic ||
            addr.tourism ||
            addr.suburb ||
            addr.town ||
            addr.city ||
            addr.village ||
            'My Current Location';

          const loc: LocationMetadata = {
            placeName,
            formattedAddress: data.display_name,
            city: addr.city || addr.town || addr.village || '',
            district: addr.state_district || addr.county || '',
            state: addr.state || '',
            country: addr.country || 'India',
            lat,
            lon,
          };

          handleSelect(loc);
        } catch (err) {
          setError('Failed to resolve current location details.');
        } finally {
          setSearching(false);
        }
      },
      (geoErr) => {
        setSearching(false);
        setError(`Location permission denied or unavailable (${geoErr.message}).`);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto" ref={dropdownRef}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (suggestions.length > 0) {
            handleSelect(suggestions[0]);
          }
        }}
        className="relative flex items-center"
      >
        <div className="absolute left-5 text-amber-600 pointer-events-none">
          <Search className="w-6 h-6" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setDropdownOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-14 pr-36 py-5 rounded-2xl bg-white border border-stone-300 shadow-xl shadow-stone-900/5 text-stone-900 placeholder-stone-400 text-base sm:text-lg font-medium focus:outline-none focus:border-amber-600 focus:ring-4 focus:ring-amber-500/15 transition-all"
        />

        <div className="absolute right-3.5 flex items-center gap-2">
          {searching || isLoading ? (
            <div className="p-2.5 text-amber-600 animate-spin">
              <Loader2 className="w-6 h-6" />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-amber-50 hover:text-amber-800 text-stone-700 text-sm font-semibold border border-stone-200 transition-colors cursor-pointer"
              title="Detect current location"
            >
              <Navigation className="w-4 h-4 text-amber-600" />
              <span>Near Me</span>
            </button>
          )}
        </div>
      </form>

      {/* Suggestion Dropdown */}
      {dropdownOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
          <div className="px-5 py-2.5 bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center justify-between">
            <span>Places in India</span>
            <span className="text-amber-700 font-normal">OpenStreetMap Geocoding</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
            {suggestions.map((item, idx) => (
              <button
                key={`${item.lat}-${item.lon}-${idx}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-5 py-3.5 hover:bg-amber-50/60 flex items-start gap-3.5 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold text-stone-900 group-hover:text-amber-900 flex items-center gap-2">
                    <span>{item.placeName}</span>
                    {item.state && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {item.state}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 truncate mt-0.5">{item.formattedAddress}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-800 font-bold hover:underline">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
