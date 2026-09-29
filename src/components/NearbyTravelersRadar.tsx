import React, { useState, useEffect } from 'react';
import {
  Users,
  Radio,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Plus,
  Send,
  Loader2,
  CheckCircle2,
  Navigation,
  ThumbsUp,
  AlertCircle,
  Eye,
  X,
  Compass,
} from 'lucide-react';
import { fetchNearbyTravelers, submitCrowdsourceCheckin } from '../services/api';
import { CrowdsourceData, NearbyTraveler } from '../types';

interface NearbyTravelersRadarProps {
  placeName?: string;
  monumentName?: string;
  lat?: number;
  lon?: number;
  onSelectPlace?: (place: string) => void;
}

export const NearbyTravelersRadar: React.FC<NearbyTravelersRadarProps> = ({
  placeName = 'Agra',
  monumentName = 'Taj Mahal',
  lat = 27.1751,
  lon = 78.0421,
}) => {
  const [data, setData] = useState<CrowdsourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [wavingIds, setWavingIds] = useState<Record<string, boolean>>({});

  // Check-in form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Solo Explorer' | 'Family Traveler' | 'Heritage Photographer' | 'Verified Local Guide'>('Solo Explorer');
  const [locationName, setLocationName] = useState(`${monumentName} East Gate`);
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchNearbyTravelers(placeName, monumentName, lat, lon);
      setData(res);
    } catch (err) {
      console.error('Failed to load nearby crowdsource data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [placeName, monumentName, lat, lon]);

  const handleWave = (travelerId: string) => {
    setWavingIds((prev) => ({ ...prev, [travelerId]: true }));
    setTimeout(() => {
      setWavingIds((prev) => ({ ...prev, [travelerId]: false }));
    }, 2500);
  };

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !locationName.trim()) return;

    try {
      setSubmitting(true);
      await submitCrowdsourceCheckin({
        userName: name,
        userRole: role,
        place: placeName,
        monument: monumentName,
        locationName,
        statusMessage: statusMessage.trim() || `Exploring ${monumentName} right now!`,
        lat,
        lon,
      });
      setCheckinSuccess(true);
      setName('');
      setStatusMessage('');
      await loadData();
      setTimeout(() => {
        setCheckinSuccess(false);
        setCheckinModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Checkin error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-5 sm:p-7 space-y-6">
      {/* Header with live radar indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                Live Nearby Travelers Radar
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                LIVE
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Crowdsourced real-time presence around{' '}
              <span className="font-semibold text-stone-800">{monumentName}</span> ({placeName})
            </p>
          </div>
        </div>

        {/* Check-In CTA Button */}
        <button
          onClick={() => setCheckinModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Navigation className="w-4 h-4" />
          <span>I am Here (Check-In)</span>
        </button>
      </div>

      {/* Live Crowd Meter & Footfall Intelligence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Footfall Count */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-medium uppercase tracking-wide">
              Active Travelers
            </div>
            <div className="text-lg font-bold text-stone-900">
              {loading ? '...' : `${data?.totalNearbyCount || 23} Active Now`}
            </div>
          </div>
        </div>

        {/* Crowd Density */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-medium uppercase tracking-wide">
              Crowd Density
            </div>
            <div className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>{data?.crowdLevel || 'Moderate'}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
          </div>
        </div>

        {/* Live Gate Recommendation */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3.5 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wide">
              Smart Entry Tip
            </div>
            <div className="text-xs text-emerald-950 font-medium line-clamp-2 mt-0.5">
              {data?.bestGateTip || 'East Gate (Shilpgram) queue is ~35% shorter right now.'}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Radar Scanner View */}
      <div className="relative rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-black p-6 sm:p-8 text-white overflow-hidden border border-stone-800 flex flex-col items-center justify-center min-h-[260px]">
        {/* Radar Rings Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-96 h-96 rounded-full border border-emerald-400" />
          <div className="absolute w-72 h-72 rounded-full border border-emerald-400" />
          <div className="absolute w-48 h-48 rounded-full border border-emerald-400" />
          <div className="absolute w-24 h-24 rounded-full border border-emerald-400" />
          <div className="absolute w-full h-[1px] bg-emerald-400/40" />
          <div className="absolute h-full w-[1px] bg-emerald-400/40" />
        </div>

        {/* Rotating Radar Sweep Line */}
        <div className="absolute w-44 h-44 rounded-full origin-center pointer-events-none animate-spin" style={{ animationDuration: '6s' }}>
          <div className="w-full h-1/2 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-t-full" />
        </div>

        {/* Center Monument Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-white">
            🏛️
          </div>
          <span className="mt-2 text-xs font-bold text-amber-200 tracking-wide bg-stone-900/90 px-3 py-1 rounded-full border border-amber-500/30">
            {monumentName} Center
          </span>
          <span className="text-[10px] text-stone-400 mt-0.5">Ground Zero</span>
        </div>

        {/* Nearby Traveler Pulse Blips (Positioned around the center) */}
        {data?.activeTravelers?.slice(0, 5).map((t, index) => {
          // Calculate arbitrary circular offsets for visual scatter
          const angles = [45, 135, 210, 290, 340];
          const dists = [70, 95, 60, 110, 85];
          const angle = (angles[index % angles.length] * Math.PI) / 180;
          const dist = dists[index % dists.length];
          const x = Math.cos(angle) * dist;
          const y = Math.sin(angle) * dist;

          return (
            <div
              key={t.id}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute z-20 group cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-emerald-400/30 animate-ping" />
                <div className="w-8 h-8 rounded-full bg-stone-800 border-2 border-emerald-400 text-sm flex items-center justify-center shadow-md shadow-emerald-500/30 transition-transform group-hover:scale-125">
                  {t.avatar || '🎒'}
                </div>
              </div>

              {/* Hover Tooltip */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-stone-950 text-white text-[11px] p-2.5 rounded-xl shadow-xl border border-stone-700 w-44 text-center z-30">
                <div className="font-bold text-amber-300">{t.name}</div>
                <div className="text-stone-400 text-[10px]">{t.locationName}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  {t.distanceMeters}m away • {t.checkedInAgo}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Travelers Live Feed List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-800 uppercase tracking-wider flex items-center gap-2">
            <span>Nearby Traveler Feed</span>
            <span className="text-xs font-normal text-stone-400">
              ({data?.activeTravelers?.length || 0} checked in nearby)
            </span>
          </h4>
          <span className="text-xs text-stone-500">Auto-refreshing live</span>
        </div>

        {loading && !data ? (
          <div className="py-12 flex flex-col items-center justify-center text-stone-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs">Scanning frequencies around {monumentName}...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data?.activeTravelers?.map((traveler) => (
              <div
                key={traveler.id}
                className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/60 hover:bg-stone-50 transition-all space-y-2.5 shadow-2xs hover:shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-white border border-stone-300 flex items-center justify-center text-lg shadow-2xs">
                      {traveler.avatar || '🎒'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-stone-900">{traveler.name}</span>
                        {traveler.verifiedTourist && (
                          <span title="Verified Tourist">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-700 font-medium">
                        {traveler.role}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <MapPin className="w-3 h-3" />
                      <span>{traveler.distanceMeters}m away</span>
                    </span>
                    <div className="text-[10px] text-stone-400 mt-0.5 flex items-center justify-end gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{traveler.checkedInAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                <p className="text-xs text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200/60 leading-relaxed italic">
                  "{traveler.statusMessage}"
                </p>

                {/* Spot & Action */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                  <span className="font-medium text-stone-600 truncate max-w-[200px]">
                    📍 {traveler.locationName}
                  </span>
                  <button
                    onClick={() => handleWave(traveler.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      wavingIds[traveler.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200/80 hover:bg-stone-300 text-stone-700'
                    }`}
                  >
                    <span>{wavingIds[traveler.id] ? '👋 Waved!' : 'Say Namaste 👋'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-In Modal */}
      {checkinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  📍
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Check-In at {monumentName}</h3>
                  <p className="text-xs text-stone-500">Share your live presence on Aarambh Radar</p>
                </div>
              </div>
              <button
                onClick={() => setCheckinModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkinSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
                <h4 className="font-bold text-stone-900 text-base">You are on the Radar!</h4>
                <p className="text-xs text-stone-500">
                  Fellow travelers near {monumentName} can now see your live presence and tip.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCheckinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name / Travel Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Traveler Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Solo Explorer">Solo Explorer 🎒</option>
                    <option value="Family Traveler">Family Traveler 👨‍👩‍👧</option>
                    <option value="Heritage Photographer">Heritage Photographer 📸</option>
                    <option value="Verified Local Guide">Verified Local Guide 🏛️</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Exact Location / Gate *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="e.g. Taj East Gate / Shilpgram / Mehtab Bagh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Live Status or Useful Tip for Fellow Travelers
                  </label>
                  <textarea
                    rows={2}
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="e.g. Queue is short at East Gate right now, morning sun is perfect!"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckinModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !locationName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Check-In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
