import React, { useState } from 'react';
import { MemoryTrail, MemoryTrailStop } from '../types';
import { MapView } from '../components/MapView';
import { Compass, Footprints, Clock, MapPin, Sparkles, Navigation, ChevronRight, Bookmark } from 'lucide-react';

interface MemoryTrailsViewProps {
  onSelectPlace: (placeName: string) => void;
  onSaveItineraryStop?: (stop: { title: string; location: string; day: number }) => void;
}

const CURATED_TRAILS: MemoryTrail[] = [
  {
    id: 'trail-varanasi-ghats',
    title: 'Varanasi Living Ghats & Silk Alley Trail',
    theme: 'Spiritual Continuum & Ancestral Weaving',
    placeName: 'Varanasi, Uttar Pradesh',
    totalDistanceKm: 3.4,
    estimatedMinutes: 140,
    stops: [
      {
        order: 1,
        name: 'Assi Ghat Sunrise Chanting',
        highlight: 'Morning Vedic hymns, wrestlers practicing in traditional mud akhadas.',
        lat: 25.2917,
        lon: 83.0039,
        estimatedTimeMinutes: 30,
      },
      {
        order: 2,
        name: 'Tulsi Ghat & Ancient Ramcharitmanas House',
        highlight: 'The historic quarters where Goswami Tulsidas composed the Ramcharitmanas in Awadhi.',
        lat: 25.2965,
        lon: 83.0062,
        estimatedTimeMinutes: 25,
      },
      {
        order: 3,
        name: 'Madanpura Handloom Brocade Weaver Looms',
        highlight: 'Clattering jacquard pits where Muslim Ansari master weavers craft Zari silk.',
        lat: 25.305,
        lon: 83.0078,
        estimatedTimeMinutes: 45,
      },
      {
        order: 4,
        name: 'Dashashwamedh Ghat Sunset Aarati',
        highlight: 'The sacred evening ritual of brass lamps and conch shell resonance overlooking Ganga.',
        lat: 25.3076,
        lon: 83.0107,
        estimatedTimeMinutes: 40,
      },
    ],
  },
  {
    id: 'trail-hampi-boulder',
    title: 'Hampi Vijayanagara Empire Memory Trail',
    theme: 'Stone Engineering & Lost Imperial Markets',
    placeName: 'Hampi, Karnataka',
    totalDistanceKm: 4.8,
    estimatedMinutes: 180,
    stops: [
      {
        order: 1,
        name: 'Virupaksha Temple Courtyard',
        highlight: 'Unbroken worship since the 7th century through multiple empire dynasties.',
        lat: 15.3358,
        lon: 76.4601,
        estimatedTimeMinutes: 40,
      },
      {
        order: 2,
        name: 'Hampi Bazaar Ancient Colonnades',
        highlight: 'Once the diamond and Persian gem bazaar that dazzled medieval travelers.',
        lat: 15.3351,
        lon: 76.4635,
        estimatedTimeMinutes: 30,
      },
      {
        order: 3,
        name: 'Achyutaraya Temple & Courtesan Street',
        highlight: 'Secluded valley temple flanked by monolithic granite pillars and water conduits.',
        lat: 15.3338,
        lon: 76.4682,
        estimatedTimeMinutes: 40,
      },
      {
        order: 4,
        name: 'Vittala Temple & Ranga Mandapa Musical Pillars',
        highlight: 'The famous stone chariot and pillars tuned to Indian classical swaras.',
        lat: 15.3385,
        lon: 76.4795,
        estimatedTimeMinutes: 50,
      },
    ],
  },
  {
    id: 'trail-jaipur-craft',
    title: 'Pink City Royal Guilds & Haveli Walk',
    theme: 'Craft Guilds, Gem Cutting & Blue Pottery',
    placeName: 'Jaipur, Rajasthan',
    totalDistanceKm: 2.9,
    estimatedMinutes: 120,
    stops: [
      {
        order: 1,
        name: 'Hawa Mahal & Wind Screen Facade',
        highlight: '953 jharokhas engineered for natural Venturi draft cooling and royal purdah observation.',
        lat: 26.9239,
        lon: 75.8267,
        estimatedTimeMinutes: 35,
      },
      {
        order: 2,
        name: 'Johari Bazaar Gem & Kundan Workshop Alleys',
        highlight: 'Generational jewelers setting untreated emeralds in 24k gold foil foil-work.',
        lat: 26.9205,
        lon: 75.8252,
        estimatedTimeMinutes: 30,
      },
      {
        order: 3,
        name: 'Kishanpole Bazaar Woodcarving & Marble Guilds',
        highlight: 'Artisans sculpting Makrana marble murtis and Shekhawati carved teak doors.',
        lat: 26.9189,
        lon: 75.819,
        estimatedTimeMinutes: 30,
      },
      {
        order: 4,
        name: 'Laxmi Mishthan Bhandar (LMB) Ghewar Tasting',
        highlight: 'Tasting honeycomb disc Ghewar soaked in saffron sugar syrup since 1727.',
        lat: 26.9208,
        lon: 75.8248,
        estimatedTimeMinutes: 25,
      },
    ],
  },
];

export const MemoryTrailsView: React.FC<MemoryTrailsViewProps> = ({
  onSelectPlace,
  onSaveItineraryStop,
}) => {
  const [selectedTrail, setSelectedTrail] = useState<MemoryTrail>(CURATED_TRAILS[0]);
  const [activeStop, setActiveStop] = useState<MemoryTrailStop>(selectedTrail.stops[0]);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleSelectTrail = (trail: MemoryTrail) => {
    setSelectedTrail(trail);
    setActiveStop(trail.stops[0]);
  };

  const handleSaveStop = (stop: MemoryTrailStop) => {
    if (onSaveItineraryStop) {
      onSaveItineraryStop({
        title: `${stop.name} (${selectedTrail.title})`,
        location: selectedTrail.placeName,
        day: 1,
      });
      setSavedStatus(stop.name);
      setTimeout(() => setSavedStatus(null), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
            <Footprints className="w-3.5 h-3.5" />
            Walkable Living Heritage Routes
          </div>
          <h2 className="text-3xl font-bold font-heritage text-stone-900">
            Aarambh Memory Trails
          </h2>
          <p className="text-sm text-stone-600 max-w-2xl mt-1">
            Carefully paced, pedestrian-first routes connecting monuments, active workshops, living
            viewpoints, and vernacular memory stops.
          </p>
        </div>

        {/* Trail Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {CURATED_TRAILS.map((trail) => (
            <button
              key={trail.id}
              onClick={() => handleSelectTrail(trail)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedTrail.id === trail.id
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {trail.placeName.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Trail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trail Overview & Stops Sequence */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block mb-1">
              {selectedTrail.theme}
            </span>
            <h3 className="text-xl font-bold font-heritage text-stone-900">
              {selectedTrail.title}
            </h3>

            <div className="flex items-center gap-4 text-xs text-stone-500 mt-2 pb-3 border-b border-stone-100">
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-amber-600" />
                <strong>{selectedTrail.totalDistanceKm}</strong> km trail
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <strong>{selectedTrail.estimatedMinutes}</strong> mins pace
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {selectedTrail.stops.length} stops
              </span>
            </div>

            {/* Sequence of stops */}
            <div className="mt-4 space-y-3">
              {selectedTrail.stops.map((stop) => {
                const isActive = activeStop.name === stop.name;
                return (
                  <div
                    key={stop.order}
                    onClick={() => setActiveStop(stop)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isActive
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {stop.order}
                        </div>
                        <div>
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isActive ? 'text-amber-950' : 'text-stone-900'
                            }`}
                          >
                            {stop.name}
                          </h4>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {stop.highlight}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-stone-400 font-mono whitespace-nowrap">
                        ~{stop.estimatedTimeMinutes}m
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-200/50 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveStop(stop);
                        }}
                        className="text-[11px] text-stone-500 hover:text-amber-700 flex items-center gap-1 transition-colors"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Add Stop to My Itinerary</span>
                      </button>

                      <span className="text-[10px] text-stone-400 font-mono">
                        {stop.lat.toFixed(3)}°, {stop.lon.toFixed(3)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {savedStatus && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Added "{savedStatus}" to your saved itinerary.</span>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Map for Trail */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-stone-200/90 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                <span className="font-bold text-stone-800">Trail Cartography</span>
              </div>
              <span className="text-stone-500">
                Centered on Stop {activeStop.order}: <strong>{activeStop.name}</strong>
              </span>
            </div>

            <MapView
              destination={{
                placeName: activeStop.name,
                lat: activeStop.lat,
                lon: activeStop.lon,
              }}
              trailStops={selectedTrail.stops}
            />

            {/* Stop Context Card */}
            <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-700">
                    Stop #{activeStop.order} of {selectedTrail.stops.length}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900">{activeStop.name}</h4>
                </div>
                <button
                  onClick={() => onSelectPlace(selectedTrail.placeName)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Explore City Heritage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {activeStop.highlight}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
