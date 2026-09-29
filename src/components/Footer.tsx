import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';
import { AarambhLogo } from './AarambhLogo';
import { SavedItineraryItem } from '../types';
import {
  Camera,
  MapPin,
  Globe,
  Compass,
  Landmark,
  ShieldCheck,
  Bookmark,
  ChevronRight,
  Award,
  ArrowUp,
  X,
  Trash2,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface FooterProps {
  onTabChange: (tab: string) => void;
  onOpenSaveMemory: () => void;
  onReopenIntro: () => void;
  savedItinerary?: SavedItineraryItem[];
  onOpenItinerary?: () => void;
  onRemoveItineraryItem?: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onTabChange,
  onOpenSaveMemory,
  onReopenIntro,
  savedItinerary = [],
  onOpenItinerary,
  onRemoveItineraryItem,
}) => {
  const { user, language, setLanguage } = useAuth();
  const langCode = (language || 'EN').substring(0, 2).toUpperCase();

  // Modal to view saved trips
  const [showSavedTripsModal, setShowSavedTripsModal] = useState(false);

  // Visited sites count / details
  const [visitedSitesCount, setVisitedSitesCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aarambh_visited_sites');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const visited = parsed.filter((s: any) => s.visited);
          return visited.length > 0 ? visited.length : 3;
        }
      }
    } catch (e) {}
    return 3;
  });

  // Passport stamps count
  const [passportStampsCount, setPassportStampsCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aarambh_digital_passport');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.stamps && Array.isArray(parsed.stamps)) {
          return parsed.stamps.length;
        }
      }
    } catch (e) {}
    return 5;
  });

  useEffect(() => {
    const checkCounts = () => {
      try {
        const savedSites = localStorage.getItem('aarambh_visited_sites');
        if (savedSites) {
          const parsed = JSON.parse(savedSites);
          if (Array.isArray(parsed)) {
            const v = parsed.filter((s: any) => s.visited);
            if (v.length > 0) setVisitedSitesCount(v.length);
          }
        }
        const savedPassport = localStorage.getItem('aarambh_digital_passport');
        if (savedPassport) {
          const parsed = JSON.parse(savedPassport);
          if (parsed?.stamps && Array.isArray(parsed.stamps)) {
            setPassportStampsCount(parsed.stamps.length);
          }
        }
      } catch (e) {}
    };
    window.addEventListener('focus', checkCounts);
    return () => window.removeEventListener('focus', checkCounts);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSavedTrips = () => {
    if (onOpenItinerary) {
      onOpenItinerary();
    } else {
      setShowSavedTripsModal(true);
    }
  };

  return (
    <footer className="border-t border-stone-200/90 bg-[#FAF9F5] text-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* ============================================================ */}
        {/* TOP BAR: BRAND + SLEEK SAVED TRIPS & HERITAGE SHORTCUTS */}
        {/* ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-stone-200/80">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              <AarambhLogo size="md" />
              <span className="hidden sm:inline-block h-4 w-px bg-stone-300" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                National Living Heritage Archive
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-md">
              {getTranslation('footerTagline', langCode) ||
                'Preserving India’s living lore, sacred circuits, oral memories, and 42+ UNESCO heritage sites.'}
            </p>
          </div>

          {/* Quick Access Action Pills (Saved Trips, Visited Sites, Passport) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Primary Saved Trips Button */}
            <button
              id="footer-saved-trips-btn"
              onClick={handleOpenSavedTrips}
              className="group px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              title="View all your saved trips & itinerary stops"
            >
              <Bookmark className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
              <span>Saved Trips</span>
              <span className="px-2 py-0.5 rounded-full bg-stone-950 text-amber-300 font-mono text-[10px]">
                {savedItinerary.length}
              </span>
            </button>

            {/* Saved/Visited Sites Shortcut */}
            <button
              id="footer-saved-sites-btn"
              onClick={() => onTabChange('certificate')}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="View verified visited heritage monuments"
            >
              <Landmark className="w-3.5 h-3.5 text-stone-500" />
              <span>Saved Sites</span>
              <span className="px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600 font-mono text-[10px]">
                {visitedSitesCount}
              </span>
            </button>

            {/* Digital Passport Stamps Shortcut */}
            <button
              id="footer-passport-btn"
              onClick={() => onTabChange('passport')}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Digital Yatra Passport"
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Passport</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 font-mono text-[10px]">
                {passportStampsCount}
              </span>
            </button>

            {/* Preserve Memory Action */}
            <button
              id="footer-preserve-memory-btn"
              onClick={onOpenSaveMemory}
              className="px-3.5 py-2 rounded-2xl bg-stone-900 hover:bg-black text-stone-100 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Contribute</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DIRECTORY LINKS (CLEAN, 4 COMPACT COLUMNS) */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          {/* Col 1: Explore Monuments */}
          <div className="space-y-2.5">
            <h4 className="font-bold uppercase tracking-wider text-stone-900 text-[11px] flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-700" />
              <span>Heritage Discovery</span>
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li>
                <button
                  onClick={() => onTabChange('scanner')}
                  className="hover:text-amber-900 transition-colors cursor-pointer text-amber-950 font-bold flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>Heritage Scanner (Camera AI)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('explore')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Sacred Cities & Trails
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('evisit')}
                  className="hover:text-amber-900 transition-colors cursor-pointer text-amber-950 font-medium flex items-center gap-1"
                >
                  <span>🪔</span> 3D Darshan E-Visits
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('heritage')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  42+ UNESCO & ASI Sites
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('maps')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  GIS Geo-Cultural Map
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Pilgrimage & Planner */}
          <div className="space-y-2.5">
            <h4 className="font-bold uppercase tracking-wider text-stone-900 text-[11px] flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-700" />
              <span>Journey Planning</span>
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li>
                <button
                  onClick={handleOpenSavedTrips}
                  className="hover:text-amber-900 transition-colors cursor-pointer font-bold text-amber-950 flex items-center gap-1"
                >
                  <span>🗺️</span> View Saved Trips ({savedItinerary.length})
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('plan-trip')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Multi-Stop Route Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('passport')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Digital Yatra Passport
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('certificate')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Web3 Pilgrim Certificate
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Living Culture & Community */}
          <div className="space-y-2.5">
            <h4 className="font-bold uppercase tracking-wider text-stone-900 text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Living Culture</span>
            </h4>
            <ul className="space-y-1.5 text-stone-600">
              <li>
                <button
                  onClick={() => onTabChange('living-heritage')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Living Craft Clusters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('creator')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Artisan Contributor Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('games-canvas')}
                  className="hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Moksha Patam & Chaupar
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (user?.role === 'ADMIN') {
                      onTabChange('admin');
                    } else {
                      // Open the new AdminAuthModal
                      document.dispatchEvent(new CustomEvent('open-admin-auth'));
                    }
                  }}
                  className="hover:text-amber-900 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Curator Moderation Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Language */}
          <div className="space-y-2.5">
            <h4 className="font-bold uppercase tracking-wider text-stone-900 text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-700" />
              <span>Languages & Walkthrough</span>
            </h4>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {SUPPORTED_LANGUAGES.slice(0, 6).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer ${
                    langCode === l.code
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  <span>{l.flag}</span> <span className="ml-0.5">{l.code}</span>
                </button>
              ))}
            </div>

            <button
              onClick={onReopenIntro}
              className="text-[11px] text-amber-900 hover:underline font-semibold flex items-center gap-1 pt-1 cursor-pointer"
            >
              <span>SIH 2026 Strategy Guide</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BOTTOM STRIP: CLEAN COPYRIGHT & TOP BUTTON */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>© 2026 AARAMBH • Living Heritage Archive</span>
            <span>•</span>
            <span className="text-stone-400">Open Cultural Data Initiative</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-stone-400">
              Grounding: Archaeological Survey of India (ASI) & UNESCO
            </span>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* SAVED TRIPS QUICK MODAL (FALLBACK IF DRAWER NOT PASSED) */}
      {/* ============================================================ */}
      {showSavedTripsModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] my-8 shrink-0">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-amber-50 to-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heritage text-stone-900">
                    My Saved Trips & Itinerary
                  </h3>
                  <p className="text-xs text-stone-500">
                    {savedItinerary.length} destinations bookmarked for your pilgrimage
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSavedTripsModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Saved Trips */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {savedItinerary.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-3">
                  <Compass className="w-12 h-12 text-stone-300 mx-auto stroke-1" />
                  <h4 className="text-sm font-bold text-stone-700">No saved trips yet</h4>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto">
                    While exploring 42+ UNESCO sites or sacred circuits, click "Add to Itinerary" to curate your journey.
                  </p>
                  <button
                    onClick={() => {
                      setShowSavedTripsModal(false);
                      onTabChange('plan-trip');
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Route Planner</span>
                  </button>
                </div>
              ) : (
                savedItinerary.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-stone-50 hover:bg-amber-50/50 border border-stone-200/80 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono">
                          Day {item.day || 1}
                        </span>
                        <span className="text-xs text-stone-500 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{item.location}</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 truncate">
                        {item.title}
                      </h4>
                    </div>

                    {onRemoveItineraryItem && (
                      <button
                        onClick={() => onRemoveItineraryItem(item.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove from itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setShowSavedTripsModal(false);
                  onTabChange('plan-trip');
                }}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Plan Route & Trains</span>
              </button>

              <button
                onClick={() => setShowSavedTripsModal(false)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-semibold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
};
