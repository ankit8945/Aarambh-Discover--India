import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Radio,
  Car,
  ShoppingBag,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Sparkles,
  Navigation,
  Compass,
  Search,
  Crosshair,
  Loader2,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';
import { NearbyTravelersRadar } from '../components/NearbyTravelersRadar';
import { FairPriceTransitGuide } from '../components/FairPriceTransitGuide';
import { LocalMarketplace } from '../components/LocalMarketplace';
import { CommunityTravelerChat } from '../components/CommunityTravelerChat';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { reverseGeocode, geocodeSearch } from '../services/api';
import { LocationMetadata } from '../types';

interface TravelerHubViewProps {
  initialTab?: 'radar' | 'fares' | 'marketplace' | 'bazaar' | 'chat';
}

const POPULAR_DESTINATIONS = [
  { city: 'Agra', monument: 'Taj Mahal', lat: 27.1751, lon: 78.0421 },
  { city: 'Varanasi', monument: 'Kashi Vishwanath & Ghats', lat: 25.3109, lon: 83.0107 },
  { city: 'Jaipur', monument: 'Hawa Mahal & Amber Fort', lat: 26.9239, lon: 75.8267 },
  { city: 'Delhi', monument: 'Red Fort & Chandni Chowk', lat: 28.6562, lon: 77.2410 },
  { city: 'Amritsar', monument: 'Golden Temple (Harmandir Sahib)', lat: 31.6200, lon: 74.8765 },
  { city: 'Ayodhya', monument: 'Ram Mandir & Saryu Ghat', lat: 26.7922, lon: 82.1998 },
  { city: 'Puri', monument: 'Jagannath Temple & Beach', lat: 19.8135, lon: 85.8312 },
  { city: 'Rishikesh', monument: 'Triveni Ghat & Laxman Jhula', lat: 30.1069, lon: 78.2974 },
  { city: 'Kedarnath', monument: 'Kedarnath Temple Shrine', lat: 30.7346, lon: 79.0669 },
  { city: 'Hampi', monument: 'Virupaksha Temple & Vittala Chariot', lat: 15.3350, lon: 76.4600 },
  { city: 'Madurai', monument: 'Meenakshi Amman Temple', lat: 9.9195, lon: 78.1193 },
  { city: 'Udaipur', monument: 'City Palace & Lake Pichola', lat: 24.5764, lon: 73.6835 },
  { city: 'Kolkata', monument: 'Victoria Memorial & Howrah', lat: 22.5448, lon: 88.3426 },
  { city: 'Mumbai', monument: 'Gateway of India & Colaba', lat: 18.9220, lon: 72.8347 },
  { city: 'Hyderabad', monument: 'Charminar & Laad Bazaar', lat: 17.3616, lon: 78.4747 },
  { city: 'Kashmir', monument: 'Dal Lake & Srinagar Old City', lat: 34.0837, lon: 74.7973 },
  { city: 'Bodh Gaya', monument: 'Mahabodhi Temple', lat: 24.6961, lon: 84.9913 },
  { city: 'Khajuraho', monument: 'Kandariya Mahadeva Temples', lat: 24.8318, lon: 79.9199 },
  { city: 'Konark', monument: 'Sun Temple Monolith', lat: 19.8876, lon: 86.0945 },
  { city: 'Goa', monument: 'Old Goa & Basilica of Bom Jesus', lat: 15.5009, lon: 73.9116 },
];

export const TravelerHubView: React.FC<TravelerHubViewProps> = ({
  initialTab = 'radar',
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'fares' | 'marketplace' | 'bazaar' | 'chat'>(initialTab);
  const [selectedCity, setSelectedCity] = useState<string>('Agra');
  const [selectedMonument, setSelectedMonument] = useState<string>('Taj Mahal');
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 27.1751, lon: 78.0421 });

  // Search input & autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationMetadata[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // GPS Location detection state
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsNotification, setGpsNotification] = useState<string | null>(null);

  // Auto-close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query suggestions as user types
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await geocodeSearch(q);
        if (Array.isArray(results) && results.length > 0) {
          setSuggestions(results);
          setSuggestionsOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Proactively check browser GPS on initial component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          try {
            const rev = await reverseGeocode(lat, lon);
            if (rev && rev.city) {
              setSelectedCity(rev.city);
              setSelectedMonument(rev.monument || `${rev.city} Heritage Center`);
              setCoords({ lat, lon });
            } else {
              setCoords({ lat, lon });
            }
          } catch (e) {
            setCoords({ lat, lon });
          }
        },
        () => {
          // Gracefully continue with default coordinates
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    }
  }, []);

  // Detect GPS button handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotification('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsNotification(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const rev = await reverseGeocode(lat, lon);
          if (rev && rev.city) {
            setSelectedCity(rev.city);
            setSelectedMonument(rev.monument || `${rev.city} Heritage Center`);
            setCoords({ lat, lon });
            setGpsNotification(`📍 Live GPS Locked: ${rev.city}, ${rev.state} (${rev.monument || 'Heritage Area'})`);
          } else {
            setCoords({ lat, lon });
            setGpsNotification(`📍 Live GPS Locked: Lat ${(Number(lat) || 0).toFixed(3)}, Lon ${(Number(lon) || 0).toFixed(3)}`);
          }
        } catch (e) {
          setCoords({ lat, lon });
          setGpsNotification(`📍 Live GPS Locked: Lat ${(Number(lat) || 0).toFixed(3)}, Lon ${(Number(lon) || 0).toFixed(3)}`);
        } finally {
          setDetectingGps(false);
          setTimeout(() => setGpsNotification(null), 5000);
        }
      },
      (err) => {
        setDetectingGps(false);
        setGpsNotification(`Location permission needed: ${err.message}`);
        setTimeout(() => setGpsNotification(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Select location from suggestion or popular list - ALWAYS stays in TravelerHub!
  const applyLocation = (city: string, monument: string, lat: number, lon: number) => {
    setSelectedCity(city);
    setSelectedMonument(monument);
    setCoords({
      lat: Number(lat) || 27.1751,
      lon: Number(lon) || 78.0421,
    });
    setSearchQuery('');
    setSuggestions([]);
    setSuggestionsOpen(false);
    setGpsNotification(`📍 Hub centered at ${city} (${monument}) • Live items loaded`);
    setTimeout(() => setGpsNotification(null), 5000);
  };

  const handleSelectSuggestion = (item: LocationMetadata) => {
    const cityName = item.city || item.district || item.placeName || 'Heritage Destination';
    const monumentName = item.placeName || `${cityName} Heritage Core`;
    applyLocation(cityName, monumentName, item.lat, item.lon);
  };

  // Search submit (Enter press or Search click)
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSuggestionsOpen(false);

    // 1. Check local popular destinations first
    const localMatch = POPULAR_DESTINATIONS.find(
      (p) =>
        p.city.toLowerCase() === query.toLowerCase() ||
        p.monument.toLowerCase().includes(query.toLowerCase())
    );
    if (localMatch) {
      applyLocation(localMatch.city, localMatch.monument, localMatch.lat, localMatch.lon);
      setSearching(false);
      return;
    }

    // 2. Query universal geocoding API
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const best = data[0];
          const cityName = best.city || best.district || best.placeName || query;
          const monumentName = best.placeName || `${cityName} Heritage Core`;
          const lat = Number(best.lat) || 27.1751;
          const lon = Number(best.lon) || 78.0421;
          applyLocation(cityName, monumentName, lat, lon);
          return;
        }
      }

      // Fallback: update city name directly
      applyLocation(query, `${query} Heritage Area`, coords.lat, coords.lon);
    } catch (err) {
      applyLocation(query, `${query} Heritage Area`, coords.lat, coords.lon);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50/70 pb-20">
      {/* Hero Banner with Heritage Warmth */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white py-10 px-4 sm:px-6 shadow-md border-b border-stone-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>Real-Time Crowdsource & Community Layer (All India)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif tracking-tight text-amber-100">
                Aarambh Traveler Hub & Local Marketplace
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Connect with active travelers nearby around <span className="text-amber-300 font-bold">{selectedMonument}</span> ({selectedCity}), access verified fair-price auto tariffs without tout overcharging, calculate custom route fares, and buy directly from generational artisans.
              </p>
            </div>

            {/* GPS Auto-Detect Button */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingGps}
                className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                title="Detect my current location via GPS"
              >
                {detectingGps ? (
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                ) : (
                  <Crosshair className="w-4 h-4 text-stone-950" />
                )}
                <span>Detect Where I Am (GPS)</span>
              </button>
            </div>
          </div>

          {/* GPS Detection Notification Banner */}
          {gpsNotification && (
            <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{gpsNotification}</span>
            </div>
          )}

          {/* Universal Search Bar for Any City / Monument across India */}
          <div className="bg-stone-900/90 border border-stone-700/80 p-3 sm:p-4 rounded-3xl space-y-3" ref={searchContainerRef}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Search Any Heritage City, Town, or Landmark:</span>
              </div>
              <div className="text-[11px] text-stone-300 bg-stone-800/80 px-3 py-1 rounded-xl border border-stone-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Active Hub: <strong className="text-amber-300">{selectedCity}</strong> • {selectedMonument}</span>
              </div>
            </div>

            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setSuggestionsOpen(true);
                    }}
                    placeholder="Search any place in India (e.g. Amritsar, Rishikesh, Jaipur, Ayodhya, Hampi, Puri, Madurai, Kedarnath)..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-stone-800 border border-stone-700 text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSuggestions([]);
                        setSuggestionsOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs cursor-pointer p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search Hub</span>}
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {suggestionsOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-stone-800">
                  <div className="px-4 py-2 bg-stone-950/80 text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Locations Found Across India</span>
                    <span className="text-stone-400 font-normal">Click to center Traveler Hub</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-800">
                    {suggestions.map((item, idx) => (
                      <button
                        key={`${item.lat}-${item.lon}-${idx}`}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-4 py-3 hover:bg-stone-800/90 flex items-start gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 flex items-center gap-2">
                            <span>{item.placeName}</span>
                            {item.state && (
                              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                                {item.state}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">{item.formattedAddress}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 shrink-0 self-center" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Popular Heritage Destination Chips - Updates TravelerHub directly */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] text-stone-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick-Select Heritage Destination (stays right here in Traveler Hub):</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {POPULAR_DESTINATIONS.map((d) => {
                  const isSelected = selectedCity.toLowerCase() === d.city.toLowerCase();
                  return (
                    <button
                      key={d.city}
                      type="button"
                      onClick={() => applyLocation(d.city, d.monument, d.lat, d.lon)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white border-stone-700'
                      }`}
                    >
                      <span>{d.city}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Center Summary Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-sm shadow-xs">
                📍
              </div>
              <div>
                <div className="font-bold text-amber-200 text-sm">
                  {selectedCity} • {selectedMonument}
                </div>
                <div className="text-stone-300 font-mono text-[11px]">
                  Coords: {(Number(coords.lat) || 27.1751).toFixed(4)}°N, {(Number(coords.lon) || 78.0421).toFixed(4)}°E
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-stone-900/80 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Live Feed Active</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-900/80 text-amber-300 border border-amber-500/30 font-semibold">
                🛡️ Verified Local Network
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 sm:gap-6 overflow-x-auto py-3 scrollbar-none">
            {/* Tab 1: Live Radar */}
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === 'radar'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Nearby Travelers Radar</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </button>

            {/* Tab 2: Fair Auto Fares */}
            <button
              type="button"
              onClick={() => setActiveTab('fares')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === 'fares'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span>🛺</span>
              <span>{selectedCity} Fair Auto Fares & Calculator</span>
            </button>

            {/* Tab 3: Local Marketplace (GPS-Powered Products & Services) */}
            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === 'marketplace' || activeTab === 'bazaar'
                  ? 'bg-stone-900 text-white shadow-sm ring-1 ring-amber-500/50'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <span>{selectedCity} Local Marketplace</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-300/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>GPS Live</span>
              </span>
            </button>

            {/* Tab 4: Live Chat */}
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer active:scale-95 ${
                activeTab === 'chat'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>{selectedCity} Live Community Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Routed Tab Content - Protected by ErrorBoundary */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'radar' && (
          <ErrorBoundary fallbackTitle={`Nearby Travelers Radar for ${selectedCity}`}>
            <NearbyTravelersRadar
              placeName={selectedCity}
              monumentName={selectedMonument}
              lat={coords.lat}
              lon={coords.lon}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'fares' && (
          <ErrorBoundary fallbackTitle={`Fair Price Transit Guide for ${selectedCity}`}>
            <FairPriceTransitGuide cityName={selectedCity} monumentName={selectedMonument} />
          </ErrorBoundary>
        )}

        {(activeTab === 'marketplace' || activeTab === 'bazaar') && (
          <ErrorBoundary fallbackTitle={`Local Marketplace for ${selectedCity}`}>
            <LocalMarketplace
              cityName={selectedCity}
              monumentName={selectedMonument}
              lat={coords.lat}
              lon={coords.lon}
              onRefreshGps={handleDetectLocation}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'chat' && (
          <ErrorBoundary fallbackTitle={`Community Traveler Chat for ${selectedCity}`}>
            <CommunityTravelerChat
              initialChannel={selectedCity.toLowerCase()}
              cityName={selectedCity}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};
