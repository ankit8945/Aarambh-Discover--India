import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  generateConnectedTripPlan,
  searchTrains,
  replanDay,
  saveItinerary,
} from '../services/api';
import { ConnectedTripMap } from '../components/ConnectedTripMap';
import {
  Calendar,
  Compass,
  MapPin,
  Clock,
  Printer,
  BookmarkCheck,
  Loader2,
  Train,
  CheckCircle2,
  Users,
  Wallet,
  ArrowRight,
  Sun,
  CloudRain,
  AlertTriangle,
  RefreshCw,
  PhoneCall,
  Shield,
  Check,
  ExternalLink,
  ArrowLeftRight,
  Download,
  Share2,
  Plus,
  Trash2,
  Droplets,
  Wind,
  Thermometer,
  Umbrella,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { ArchitectureDiagramModal } from '../components/ArchitectureDiagramModal';
import { ConnectedTripPlan, TrainOption } from '../types';
import { downloadItineraryICS, convertFromINR } from '../utils/itineraryExport';
import { handlePrintSection } from '../utils/print';

interface PlanTripViewProps {
  onSelectPlace: (placeName: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  category: 'Sanctuary Attire' | 'Tech & Docs' | 'Health & Weather' | 'Local Essentials';
  checked: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'c1',
    text: 'Modest breathable cotton or linen attire (covers shoulders & knees for temple sanctums)',
    category: 'Sanctuary Attire',
    checked: true,
  },
  {
    id: 'c2',
    text: 'Slip-on footwear or sandals for quick removal at temple parikrama thresholds',
    category: 'Sanctuary Attire',
    checked: false,
  },
  {
    id: 'c3',
    text: 'Light cotton shawl or angavastram for morning ghat breeze or evening aarti',
    category: 'Sanctuary Attire',
    checked: false,
  },
  {
    id: 'c4',
    text: 'High-capacity power bank & fast charging cable for all-day heritage trail navigation',
    category: 'Tech & Docs',
    checked: false,
  },
  {
    id: 'c5',
    text: 'DigiLocker government photo ID & printed / offline railway e-ticket with PNR',
    category: 'Tech & Docs',
    checked: true,
  },
  {
    id: 'c6',
    text: 'Insulated reusable water bottle / copper flask for hydration during walking tours',
    category: 'Health & Weather',
    checked: false,
  },
  {
    id: 'c7',
    text: 'Herbal mosquito repellent balm or spray for riverside ghats and twilight walks',
    category: 'Health & Weather',
    checked: false,
  },
  {
    id: 'c8',
    text: 'Compact umbrella or wide-brim sun hat for midday heritage monument courtyards',
    category: 'Health & Weather',
    checked: false,
  },
  {
    id: 'c9',
    text: 'Small cash notes (₹50, ₹100) for local cycle rickshaws, boatmen, and artisan guild tips',
    category: 'Local Essentials',
    checked: false,
  },
];

const POPULAR_DESTINATIONS = [
  { from: 'New Delhi', to: 'Varanasi', days: 3, label: 'Kashi & Sarnath' },
  { from: 'New Delhi', to: 'Jaipur', days: 3, label: 'Pink City & Havelis' },
  { from: 'Bengaluru', to: 'Hampi', days: 4, label: 'Vijayanagara Empire' },
  { from: 'Chennai', to: 'Madurai', days: 3, label: 'Meenakshi & Chola Temples' },
  { from: 'New Delhi', to: 'Rishikesh', days: 2, label: 'Ganga & Foothills' },
  { from: 'New Delhi', to: 'Agra', days: 2, label: 'Taj & Fatehpur Sikri' },
];

const INTEREST_OPTIONS = [
  { id: 'Heritage', label: 'Monuments & History' },
  { id: 'Living Heritage', label: 'Artisans & Crafts' },
  { id: 'Sacred Sites', label: 'Temples & Spiritual Sites' },
  { id: 'Food', label: 'Local Cuisine' },
  { id: 'Architecture', label: 'Havelis & Stepwells' },
];

export const PlanTripView: React.FC<PlanTripViewProps> = ({ onSelectPlace, onNavigateTab }) => {
  const { user, openAuthModal } = useAuth();

  // Form states
  const [startingPoint, setStartingPoint] = useState('New Delhi');
  const [destination, setDestination] = useState('Varanasi');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [durationDays, setDurationDays] = useState(3);
  const [travelersCount, setTravelersCount] = useState(2);
  const [budgetTier, setBudgetTier] = useState<'Budget' | 'Moderate' | 'Heritage Luxury'>('Moderate');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Heritage',
    'Living Heritage',
    'Food',
    'Sacred Sites',
  ]);

  // Train search state
  const [availableTrains, setAvailableTrains] = useState<TrainOption[]>([]);
  const [selectedTrainNumber, setSelectedTrainNumber] = useState<string>('');
  const [trainSearching, setTrainSearching] = useState(false);
  const [trainNotice, setTrainNotice] = useState<string | null>(null);
  const [officialBookingUrl, setOfficialBookingUrl] = useState<string>(
    'https://www.irctc.co.in/nget/train-search'
  );

  // Generation & Plan states
  const [loading, setLoading] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedPlan, setConnectedPlan] = useState<ConnectedTripPlan | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Detailed Weather Section expanded state
  const [weatherExpanded, setWeatherExpanded] = useState(true);

  // Architecture Diagram Modal State
  const [showArchModal, setShowArchModal] = useState(false);

  // Smart Packing & Preparation Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('aarambh_trip_checklist');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_CHECKLIST;
  });
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ChecklistItem['category']>('Local Essentials');
  const [showAddForm, setShowAddForm] = useState(false);

  // Sync checklist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aarambh_trip_checklist', JSON.stringify(checklist));
    } catch (e) {}
  }, [checklist]);

  // Auto-search available trains in the background when origin/dest changes
  useEffect(() => {
    if (!startingPoint.trim() || !destination.trim()) return;

    const timer = setTimeout(async () => {
      setTrainSearching(true);
      try {
        const res = await searchTrains(startingPoint, destination, startDate);
        setAvailableTrains(res.trains);
        setTrainNotice(res.notice);
        if (res.officialBookingUrl) setOfficialBookingUrl(res.officialBookingUrl);
        if (res.trains.length > 0) {
          setSelectedTrainNumber(res.trains[0].trainNumber);
        } else {
          setSelectedTrainNumber('');
        }
      } catch (e) {
        // Silently tolerate background search
      } finally {
        setTrainSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [startingPoint, destination, startDate]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSwapLocations = () => {
    const temp = startingPoint;
    setStartingPoint(destination);
    setDestination(temp);
  };

  const handleQuickRouteSelect = (route: (typeof POPULAR_DESTINATIONS)[0]) => {
    setStartingPoint(route.from);
    setDestination(route.to);
    setDurationDays(route.days);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please enter a destination in India.');
      return;
    }

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const plan = await generateConnectedTripPlan({
        from: startingPoint.trim() || 'New Delhi',
        to: destination.trim(),
        startDate,
        durationDays,
        travelersCount,
        budgetTier,
        interests: selectedInterests,
        selectedTrainNumber: selectedTrainNumber || undefined,
      });

      setConnectedPlan(plan);
      setActiveDayIndex(0);
      if (plan.availableTrains && plan.availableTrains.length > 0) {
        setAvailableTrains(plan.availableTrains);
        if (plan.selectedTrain) {
          setSelectedTrainNumber(plan.selectedTrain.trainNumber);
        }
      }
    } catch (err: any) {
      setError('Could not generate the itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickReplan = async (dayNumber: number) => {
    if (!connectedPlan) return;
    setReplanning(true);
    try {
      const updated = await replanDay(
        connectedPlan,
        dayNumber,
        'Midday heat and weather adaptation'
      );
      setConnectedPlan(updated);
    } catch (e) {
      console.error('Replan failed', e);
    } finally {
      setReplanning(false);
    }
  };

  const handleLaunchPassport = () => {
    try {
      const saved = localStorage.getItem('aarambh_digital_passport');
      let current: any = {};
      if (saved) {
        try {
          current = JSON.parse(saved);
        } catch (e) {}
      }
      current.originCity = startingPoint;
      current.destinationCity = destination;
      current.circuitName = `${startingPoint} to ${destination} Yatra`;
      current.tripStartDate = startDate;
      localStorage.setItem('aarambh_digital_passport', JSON.stringify(current));
    } catch (e) {}
    if (onNavigateTab) {
      onNavigateTab('passport');
    }
  };

  const handleSaveToProfile = async () => {
    if (!connectedPlan) return;
    if (!user) {
      openAuthModal();
      return;
    }

    try {
      await saveItinerary({
        title: connectedPlan.title,
        startingPoint: connectedPlan.fromLocation.placeName,
        destination: connectedPlan.toLocation.placeName,
        destinations: [connectedPlan.toLocation.placeName],
        durationDays: connectedPlan.durationDays,
        items: [],
        userId: user.id,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save itinerary', err);
    }
  };

  const handleShare = () => {
    if (!connectedPlan) return;
    const text = `Aarambh Itinerary: ${connectedPlan.title} (${connectedPlan.fromLocation.placeName} to ${connectedPlan.toLocation.placeName}, ${connectedPlan.durationDays} Days).`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  // Checklist handlers
  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleDeleteChecklistItem = (id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const newItem: ChecklistItem = {
      id: 'custom-' + Date.now(),
      text: newItemText.trim(),
      category: newItemCategory,
      checked: false,
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewItemText('');
    setShowAddForm(false);
  };

  const checkedCount = checklist.filter((item) => item.checked).length;
  const checklistProgress = checklist.length > 0 ? Math.round((checkedCount / checklist.length) * 100) : 0;

  // Weather helper: choose appropriate icon & color
  const getWeatherIcon = (condition: string, temp: number) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    }
    if (temp >= 33) {
      return <Thermometer className="w-5 h-5 text-red-500" />;
    }
    if (cond.includes('cloud')) {
      return <Sun className="w-5 h-5 text-amber-500" />;
    }
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 text-stone-800 font-sans">
      {/* 1. CLEAN, ELEGANT HEADER */}
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Train className="w-3.5 h-3.5 text-amber-700" />
            <span>Connected Heritage Travel</span>
          </div>

          <button
            type="button"
            onClick={() => setShowArchModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300/80 text-stone-700 hover:text-stone-900 text-xs font-semibold transition-colors cursor-pointer"
            title="View Page & System Architecture Diagram"
          >
            <Layers className="w-3.5 h-3.5 text-amber-800" />
            <span>Architecture Diagram</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heritage text-stone-900 tracking-tight">
          Plan Your Journey
        </h1>
        <p className="text-sm sm:text-base text-stone-600 max-w-2xl leading-relaxed">
          Create structured travel itineraries combining Indian Railways schedules, detailed satellite weather forecasts, and living artisan heritage visits across India.
        </p>

        {/* Popular Quick-Select Routes */}
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500 font-medium">Popular circuits:</span>
          {POPULAR_DESTINATIONS.map((route, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleQuickRouteSelect(route)}
              className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
            >
              {route.from} ➔ {route.to} ({route.days}d)
            </button>
          ))}
        </div>
      </div>

      {/* 2. THE PLANNING FORM (Clean & Grounded Card) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 sm:p-7 space-y-6">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Row 1: Origin & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                From (Starting City)
              </label>
              <input
                type="text"
                required
                value={startingPoint}
                onChange={(e) => setStartingPoint(e.target.value)}
                placeholder="e.g. New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:bg-white focus:border-amber-700 focus:outline-none transition-colors"
              />
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center pb-1">
              <button
                type="button"
                onClick={handleSwapLocations}
                className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-amber-50 text-stone-600 hover:text-amber-800 transition-colors cursor-pointer"
                title="Swap origin and destination"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                To (Destination City)
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Varanasi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-medium focus:bg-white focus:border-amber-700 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Date, Duration, Travelers, Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Departure Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:border-amber-700 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                Duration
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:border-amber-700 focus:outline-none"
              >
                <option value={1}>1 Day (Day Trip)</option>
                <option value={2}>2 Days (Weekend)</option>
                <option value={3}>3 Days (Recommended)</option>
                <option value={4}>4 Days</option>
                <option value={5}>5 Days</option>
                <option value={7}>7 Days (Full Week)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                Travelers
              </label>
              <select
                value={travelersCount}
                onChange={(e) => setTravelersCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:border-amber-700 focus:outline-none"
              >
                <option value={1}>1 Solo Traveler</option>
                <option value={2}>2 People</option>
                <option value={3}>3 People</option>
                <option value={4}>4 People (Family)</option>
                <option value={6}>6+ Group</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-stone-500" />
                Budget Preference
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:bg-white focus:border-amber-700 focus:outline-none"
              >
                <option value="Budget">Budget (Ashrams & Sleeper/CC)</option>
                <option value="Moderate">Moderate (Heritage Haveli & 3AC)</option>
                <option value="Heritage Luxury">Heritage Luxury (Palace & 1AC)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Rail Connection Selection */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-amber-700" />
                Indian Railways Train Connection
              </span>
              {trainSearching ? (
                <span className="text-stone-500 flex items-center gap-1 text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-700" />
                  Checking timetables...
                </span>
              ) : (
                <a
                  href={officialBookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1 text-[11px]"
                >
                  IRCTC Official Booking <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {availableTrains.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedTrainNumber}
                  onChange={(e) => setSelectedTrainNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-200 text-xs font-medium focus:border-amber-700 focus:outline-none"
                >
                  {availableTrains.map((t) => (
                    <option key={t.trainNumber} value={t.trainNumber}>
                      {t.trainName} (#{t.trainNumber}) • Departs {t.departureTime} ({t.duration})
                    </option>
                  ))}
                </select>

                <div className="text-xs text-stone-600 flex items-center px-2 py-1 bg-white rounded-lg border border-stone-200">
                  <span>
                    Stations:{' '}
                    <strong>
                      {availableTrains.find((t) => t.trainNumber === selectedTrainNumber)?.originStationCode}
                    </strong>{' '}
                    ➔{' '}
                    <strong>
                      {availableTrains.find((t) => t.trainNumber === selectedTrainNumber)?.destinationStationCode}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                {trainNotice ||
                  'Enter origin and destination to check connecting trains on the Indian Railways network.'}
              </p>
            )}
          </div>

          {/* Row 4: Travel Interests */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              What would you like to experience?
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((opt) => {
                const active = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-amber-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Itinerary...</span>
                </>
              ) : (
                <>
                  <span>Create Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. GENERATED ITINERARY VIEW */}
      {connectedPlan && !loading && (
        <div id="printable-itinerary-plan" className="space-y-6 pt-2">
          {/* Action & Summary Card */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-bold font-heritage text-stone-900">
                  {connectedPlan.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-medium">
                  <span className="text-stone-800 font-semibold">
                    {connectedPlan.fromLocation.placeName} ➔ {connectedPlan.toLocation.placeName}
                  </span>
                  <span>•</span>
                  <span>
                    {connectedPlan.durationDays} Days ({connectedPlan.startDate} to {connectedPlan.endDate})
                  </span>
                  <span>•</span>
                  <span>{connectedPlan.travelersCount} Traveler(s)</span>
                </div>
              </div>

              {/* Utility Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleLaunchPassport}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open in Digital Yatra Passport"
                >
                  <span>Passport</span>
                </button>

                <button
                  onClick={() => downloadItineraryICS(connectedPlan)}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Download .ics file for Google / Apple Calendar"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Calendar (.ics)</span>
                </button>

                <button
                  onClick={() => handlePrintSection('printable-itinerary-plan', 'portrait')}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print this itinerary"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {shareCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  <span>{shareCopied ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  onClick={handleSaveToProfile}
                  className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>Save Trip</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Highlights Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Rail Connection */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 font-medium block">Train Connection</span>
                <span className="font-bold text-stone-900 block">
                  {connectedPlan.selectedTrain
                    ? `${connectedPlan.selectedTrain.trainName} (#${connectedPlan.selectedTrain.trainNumber})`
                    : 'Indian Railways Express'}
                </span>
                <span className="text-stone-500 text-[11px] block">
                  {connectedPlan.nearestOriginStation.code} ➔ {connectedPlan.nearestDestStation.code}
                </span>
              </div>

              {/* Weather Forecast */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 font-medium block">Destination Weather</span>
                <span className="font-bold text-stone-900 block flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  {connectedPlan.weatherPoints[1]?.temperature || 26}°C •{' '}
                  {connectedPlan.weatherPoints[1]?.condition || 'Clear'}
                </span>
                <span className="text-stone-500 text-[11px] block">
                  {connectedPlan.weatherPoints[1]?.advisory || 'Good weather for outdoor walks'}
                </span>
              </div>

              {/* Estimated Budget */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-stone-500 font-medium block">Estimated Budget Total</span>
                <span className="font-bold text-amber-900 text-sm block">
                  {convertFromINR(connectedPlan.budgetBreakdown.totalEstimated, 'INR')}
                </span>
                <span className="text-stone-500 text-[11px] block">
                  ~{convertFromINR(Math.round(connectedPlan.budgetBreakdown.totalEstimated / connectedPlan.travelersCount), 'INR')}{' '}
                  per person ({connectedPlan.travelersCount} travelers)
                </span>
              </div>
            </div>
          </div>

          {/* 4. DETAILED METEOROLOGICAL & WEATHER INTELLIGENCE REPORT (USER REQUESTED DETAILED REPORT) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-5">
            <div
              onClick={() => setWeatherExpanded(!weatherExpanded)}
              className="flex items-center justify-between cursor-pointer select-none"
            >
              <div className="space-y-0.5">
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-600" />
                  Detailed Meteorological & Weather Intelligence Report
                </h3>
                <p className="text-xs text-stone-500">
                  Micro-climate forecasts, optimal outdoor windows, humidity and rain probabilities powered by Open-Meteo.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
                <span>{weatherExpanded ? 'Collapse' : 'Expand Details'}</span>
                {weatherExpanded ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </div>
            </div>

            {weatherExpanded && (
              <div className="space-y-5 pt-2 border-t border-stone-100">
                {/* Micro-Climate Comparison Cards (Origin vs Destination) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedPlan.weatherPoints.map((wp, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-stone-50/80 border border-stone-200/80 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] uppercase font-bold tracking-wider text-stone-500">
                            {wp.type === 'departure' ? 'Origin City' : 'Destination Cultural Core'}
                          </span>
                          <h4 className="font-bold text-base text-stone-900">{wp.locationName}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-stone-200 shadow-2xs">
                          {getWeatherIcon(wp.condition, wp.temperature)}
                          <span className="font-bold text-lg text-stone-900 font-mono">
                            {wp.temperature}°C
                          </span>
                        </div>
                      </div>

                      {/* Micro-Metrics Bar */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-white rounded-lg border border-stone-100 space-y-0.5">
                          <span className="text-stone-400 text-[10px] block">Feels Like</span>
                          <span className="font-semibold text-stone-800">
                            {wp.apparentTemperature}°C
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-stone-100 space-y-0.5">
                          <span className="text-stone-400 text-[10px] block flex items-center justify-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-500" /> Rain Prob
                          </span>
                          <span className="font-semibold text-stone-800">
                            {wp.precipitationProb ?? 10}%
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-stone-100 space-y-0.5">
                          <span className="text-stone-400 text-[10px] block flex items-center justify-center gap-1">
                            <Wind className="w-3 h-3 text-teal-600" /> Wind
                          </span>
                          <span className="font-semibold text-stone-800">
                            {wp.windSpeed || 12} km/h
                          </span>
                        </div>
                      </div>

                      {/* Weather Advisory Note */}
                      <p className="text-xs text-stone-600 bg-white/70 p-2.5 rounded-lg border border-stone-100 leading-relaxed">
                        {wp.advisory ||
                          (wp.temperature > 30
                            ? 'High daytime temperatures expected. Prioritize outdoor heritage monuments during morning hours.'
                            : 'Favorable seasonal weather for walking exploration and heritage photography.')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Day-by-Day Forecast & Optimal Visiting Windows */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Day-by-Day Optimal Heritage Windows
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {connectedPlan.days.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2"
                      >
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="font-bold text-xs text-stone-900">
                            Day {day.dayNumber} ({day.date})
                          </span>
                          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                            <Sun className="w-3.5 h-3.5 text-amber-600" />
                            {day.weatherSummary?.maxTemp || 28}° / {day.weatherSummary?.minTemp || 18}°C
                          </span>
                        </div>

                        <div className="text-xs space-y-1">
                          <div className="text-stone-700 font-medium">
                            {day.weatherSummary?.condition || 'Clear & Sunny'}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            <strong>Optimal Window:</strong>{' '}
                            {day.weatherSummary?.bestWindow || '06:30 AM - 09:30 AM & 04:30 PM - 07:00 PM'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Impact Alerts & Suggested Alternatives */}
                {connectedPlan.weatherImpacts && connectedPlan.weatherImpacts.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        Midday Heat / Inclement Weather Adaptation Notice
                      </span>
                      <button
                        onClick={() => handleOneClickReplan(connectedPlan.days[activeDayIndex].dayNumber)}
                        disabled={replanning}
                        className="px-2.5 py-1 rounded-md bg-white hover:bg-amber-100 border border-amber-300 text-[11px] font-bold text-amber-900 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${replanning ? 'animate-spin text-amber-700' : ''}`} />
                        <span>Adapt Day {connectedPlan.days[activeDayIndex].dayNumber} Itinerary</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {connectedPlan.weatherImpacts.map((alert, i) => (
                        <div key={i} className="text-xs text-amber-900 space-y-1">
                          <p>
                            <strong>Day {alert.dayNumber} ({alert.activityTitle}):</strong> {alert.warningText}
                          </p>
                          <p className="text-[11px] text-amber-800">
                            <em>Recommended Visit Window:</em> {alert.recommendedWindow}
                          </p>
                          {alert.suggestedAlternative && (
                            <div className="p-2 rounded-lg bg-white/90 border border-amber-200 text-[11px] text-stone-700">
                              <strong>Sheltered Alternative:</strong> {alert.suggestedAlternative.title} — {alert.suggestedAlternative.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 5. INTERACTIVE ROUTE MAP */}
          <ConnectedTripMap
            tripPlan={connectedPlan}
            activeDayIndex={activeDayIndex}
            onSelectPlace={onSelectPlace}
          />

          {/* 6. DAY NAVIGATION & DAILY ACTIVITIES */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-6">
            {/* Day Selector Tabs */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                {connectedPlan.days.map((day, idx) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      activeDayIndex === idx
                        ? 'bg-amber-800 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>

              {/* Weather Replan Button */}
              <button
                onClick={() => handleOneClickReplan(connectedPlan.days[activeDayIndex].dayNumber)}
                disabled={replanning}
                className="px-3 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Adjust activities if midday heat is high"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${replanning ? 'animate-spin text-amber-700' : ''}`} />
                <span>Adjust for Weather</span>
              </button>
            </div>

            {/* Active Day Header */}
            {connectedPlan.days[activeDayIndex] && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-amber-950 block text-sm">
                      Day {connectedPlan.days[activeDayIndex].dayNumber}: {connectedPlan.days[activeDayIndex].theme}
                    </span>
                    <span className="text-stone-600 text-xs">
                      {connectedPlan.days[activeDayIndex].transitSummary}
                    </span>
                  </div>
                  {connectedPlan.days[activeDayIndex].weatherSummary && (
                    <div className="text-right text-xs text-stone-600 shrink-0">
                      <span className="font-semibold text-amber-900">
                        {connectedPlan.days[activeDayIndex].weatherSummary?.condition}
                      </span>
                      <div className="text-[11px] text-stone-500">
                        Best window: {connectedPlan.days[activeDayIndex].weatherSummary?.bestWindow}
                      </div>
                    </div>
                  )}
                </div>

                {/* Activities List */}
                <div className="space-y-3">
                  {connectedPlan.days[activeDayIndex].activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-xl border border-stone-200 hover:border-amber-300 transition-colors bg-white space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-mono text-xs font-semibold">
                            {act.time}
                          </span>
                          <span className="text-xs font-semibold text-stone-500">
                            {act.culturalCategory}
                          </span>
                          {act.indoor && (
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">
                              Sheltered Indoor
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          {act.durationMinutes} mins
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-stone-900">{act.placeTitle}</h4>
                        <p className="text-xs text-stone-600 leading-relaxed font-light">
                          {act.description}
                        </p>
                      </div>

                      {act.weatherWarning && (
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{act.weatherWarning}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => onSelectPlace(act.placeTitle)}
                          className="font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Cultural Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <span className="text-[11px] text-stone-400">
                          {act.source || 'Aarambh Heritage Index'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 7. SMART TRAVEL & PACKING CHECKLIST (USER REQUESTED CHECKLIST FEATURE RESTORED) */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Smart Travel & Sanctuary Readiness Checklist
                </h3>
                <p className="text-xs text-stone-500">
                  Essential preparation for comfortable temple visits, heritage walks, and weather readiness.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Progress pill */}
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${checklistProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-700">
                    {checkedCount}/{checklist.length}
                  </span>
                </div>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Add Custom Item Form */}
            {showAddForm && (
              <form onSubmit={handleAddChecklistItem} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Extra camera memory card, temple socks..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs focus:outline-none focus:border-amber-700"
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 text-xs font-medium focus:outline-none"
                >
                  <option value="Sanctuary Attire">Sanctuary Attire</option>
                  <option value="Tech & Docs">Tech & Docs</option>
                  <option value="Health & Weather">Health & Weather</option>
                  <option value="Local Essentials">Local Essentials</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}

            {/* Checklist Grid grouped by category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleChecklistItem(item.id)}
                  className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                    item.checked
                      ? 'bg-emerald-50/50 border-emerald-300 text-stone-500'
                      : 'bg-white border-stone-200 hover:border-stone-300 text-stone-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      className="mt-0.5 text-stone-400 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleChecklistItem(item.id);
                      }}
                    >
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                    <div className="space-y-0.5">
                      <span className={`text-xs ${item.checked ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                        {item.text}
                      </span>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChecklistItem(item.id);
                    }}
                    className="text-stone-300 hover:text-red-500 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 8. BUDGET BREAKDOWN DETAILS CARD */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-3">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-700" />
              Estimated Budget Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Train Tickets</span>
                <span className="font-bold text-stone-900 text-sm">
                  {convertFromINR(connectedPlan.budgetBreakdown.trainCost, 'INR')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Local Transit</span>
                <span className="font-bold text-stone-900 text-sm">
                  {convertFromINR(connectedPlan.budgetBreakdown.localTransitCost, 'INR')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Accommodation</span>
                <span className="font-bold text-stone-900 text-sm">
                  {convertFromINR(connectedPlan.budgetBreakdown.stayCost, 'INR')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-500 block text-[11px]">Food & Activities</span>
                <span className="font-bold text-stone-900 text-sm">
                  {convertFromINR(
                    connectedPlan.budgetBreakdown.foodAndDining +
                      connectedPlan.budgetBreakdown.activitiesAndEntry,
                    'INR'
                  )}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              Estimated total for {connectedPlan.travelersCount} travelers is{' '}
              <strong>{convertFromINR(connectedPlan.budgetBreakdown.totalEstimated, 'INR')}</strong>. Actual fares may vary depending on ticket class and season.
            </p>
          </div>

          {/* 9. PRACTICAL INFORMATION: EMERGENCY CONTACTS & NOTES */}
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-stone-600" />
              Essential Travel Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <span className="font-semibold text-stone-700 block">Emergency Helplines</span>
                <div className="flex flex-wrap gap-2">
                  {connectedPlan.safety.emergencyHelplines.map((hl, i) => (
                    <a
                      key={i}
                      href={`tel:${hl.number}`}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <PhoneCall className="w-3 h-3 text-stone-500" />
                      <span>{hl.name}:</span>
                      <strong>{hl.number}</strong>
                    </a>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-stone-700 block">Sanctuary & Visit Protocols</span>
                <p className="text-stone-600 leading-relaxed text-xs">
                  {connectedPlan.safety.localCustomsNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Diagram Interactive Modal */}
      <ArchitectureDiagramModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
      />
    </div>
  );
};
