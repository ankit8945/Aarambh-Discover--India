import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/translations';
import { AarambhLogo } from './AarambhLogo';
import {
  ChevronDown,
  Globe,
  Menu,
  X,
  Bookmark,
  User,
  LogOut,
  Award,
  Sparkles,
  Compass,
  Check,
  Camera,
  Scan,
  MapPin,
  Search,
} from 'lucide-react';

const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSaveMemory: () => void;
  onOpenItinerary: () => void;
  onReopenIntro: () => void;
  onOpenSearch?: () => void;
  savedItineraryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenSaveMemory,
  onOpenItinerary,
  onReopenIntro,
  savedItineraryCount,
}) => {
  const { user, openAuthModal, signOut, switchRole, language, setLanguage } = useAuth();

  // Dropdown state: 'more' | 'lang' | 'user' | null
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');

  const langCode = (language || 'EN').substring(0, 2).toUpperCase();
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === langCode) || SUPPORTED_LANGUAGES[0];

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile navigation sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <>
      <header
      ref={dropdownRef}
      className="sticky top-0 z-50 w-full shadow-xs transition-all"
      style={{
        background:
          'linear-gradient(90deg, #F89B29 0%, #FBB35A 14%, #FFFFFF 30%, #FFFFFF 70%, #60B872 88%, #319C45 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LEFT: Mobile Sidebar Trigger + Authentic Aarambh Brand Logo Mark */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              onTabChange('explore');
              setActiveDropdown(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center text-left cursor-pointer select-none transition-transform hover:opacity-95 shrink-0"
            aria-label="Aarambh Home"
          >
            <AarambhLogo size="md" />
          </button>
        </div>

        {/* CENTER: Focused High-Value USPs + Clean "More" Menu */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-3 text-sm font-medium text-stone-800">
          {/* 1. Core Feature USP: Heritage Scanner (Camera AI Recognition & Oral Memories) */}
          <button
            onClick={() => {
              onTabChange('scanner');
              setActiveDropdown(null);
            }}
            className={`py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center gap-1.5 text-xs xl:text-sm ${
              currentTab === 'scanner'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black shadow-xs ring-2 ring-amber-400'
                : 'text-stone-900 hover:bg-amber-100/80 bg-white/80 border border-amber-400/80 font-bold shadow-2xs'
            }`}
            title="Heritage Scanner: Point device camera to identify monuments & recall history and living oral memories"
          >
            <Camera className="w-3.5 h-3.5 text-stone-950" />
            <span>Heritage Scanner</span>
          </button>

          {/* 2. Core Innovation USP: Digital Yatra Passport */}
          <button
            onClick={() => {
              onTabChange('passport');
              setActiveDropdown(null);
            }}
            className={`py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center gap-1.5 text-xs xl:text-sm ${
              currentTab === 'passport'
                ? 'bg-amber-900 text-white font-bold shadow-xs'
                : 'text-stone-900 hover:bg-amber-100/80 bg-white/70 border border-stone-300 font-semibold shadow-2xs'
            }`}
            title="Digital Yatra Passport with Live Rubber Ink Stamps & XP"
          >
            <span>🛂</span>
            <span>Passport</span>
          </button>

          {/* 3. Core USP: 3D Darshan E-Visit */}
          <button
            onClick={() => {
              onTabChange('evisit');
              setActiveDropdown(null);
            }}
            className={`py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center gap-1.5 text-xs xl:text-sm ${
              currentTab === 'evisit'
                ? 'bg-stone-900 text-white font-bold shadow-xs'
                : 'text-stone-800 hover:bg-black/5'
            }`}
          >
            <span>🪔</span>
            <span>E-Visit</span>
          </button>

          {/* 4. Core Live Crowdsource & Community USP: Traveler Hub (Radar • Fair Fares • Bazaar • Chat) */}
          <button
            onClick={() => {
              onTabChange('traveler-hub');
              setActiveDropdown(null);
            }}
            className={`py-1.5 px-3 rounded-full transition-all cursor-pointer flex items-center gap-1.5 text-xs xl:text-sm ${
              ['traveler-hub', 'radar', 'bazaar', 'chat', 'fares'].includes(currentTab)
                ? 'bg-stone-950 text-amber-300 font-bold shadow-xs ring-1 ring-amber-400/50'
                : 'text-stone-900 hover:bg-amber-100/80 bg-white/80 border border-stone-300 font-semibold shadow-2xs'
            }`}
            title="Live Radar, Fair Auto Fares, Local Artisan Bazaar & Community Chat"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Traveler Hub</span>
          </button>

          {/* 5. Clean "More" Dropdown: Explore, Heritage Sites, Crafts, Games, Lore & Web3 */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('more')}
              className={`py-1.5 px-3 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-xs xl:text-sm font-medium ${
                ['explore', 'heritage', 'living-heritage', 'games-canvas', 'community', 'certificate', 'creator'].includes(currentTab)
                  ? 'bg-stone-900 text-white font-bold shadow-xs'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-black/5'
              }`}
            >
              <span>More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  activeDropdown === 'more' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {activeDropdown === 'more' && (
              <div className="absolute left-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-stone-200 animate-fade-in z-50 space-y-1">
                {/* 1. Explore */}
                <button
                  onClick={() => {
                    onTabChange('explore');
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'explore'
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <Compass className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <div className="font-semibold">{getTranslation('explore', langCode) || 'Explore & Discover'}</div>
                    <div className="text-[10px] text-stone-500">Interactive Map, Timeline & Search</div>
                  </div>
                </button>

                {/* 2. Heritage Sites */}
                <button
                  onClick={() => {
                    onTabChange('heritage');
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'heritage'
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-semibold">{getTranslation('heritage', langCode) || 'Heritage Sites'}</div>
                    <div className="text-[10px] text-stone-500">UNESCO & ASI protected monuments</div>
                  </div>
                </button>

                {/* 3. Living Crafts */}
                <button
                  onClick={() => {
                    onTabChange('living-heritage');
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'living-heritage'
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <span className="text-sm">🏺</span>
                  <div>
                    <div className="font-semibold">{getTranslation('crafts', langCode) || 'Living Crafts'}</div>
                    <div className="text-[10px] text-stone-500">Artisans, Handlooms & GI Tags</div>
                  </div>
                </button>

                {/* 4. Games & Canvas */}
                <button
                  onClick={() => {
                    onTabChange('games-canvas');
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'games-canvas'
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <span className="text-sm">🎲</span>
                  <div>
                    <div className="font-semibold">Games & Canvas</div>
                    <div className="text-[10px] text-stone-500">Moksha Patam, Chaupar & Kolam</div>
                  </div>
                </button>

                {/* 5. Cultural Atlas & Heritage Trails Map */}
                <button
                  onClick={() => {
                    onTabChange('maps');
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'maps'
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <span className="text-sm">🗺️</span>
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>Cultural Atlas & Trails</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-700 text-white text-[8px] font-bold">MAP</span>
                    </div>
                    <div className="text-[10px] text-stone-500">Regional history routes & custom drawing</div>
                  </div>
                </button>

                {/* 6. Community Lore */}
                <button
                  onClick={() => {
                    onTabChange('community');
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'community'
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <span className="text-sm">👥</span>
                  <div>
                    <div className="font-semibold">Community Lore</div>
                    <div className="text-[10px] text-stone-500">Crowdsourced oral narratives</div>
                  </div>
                </button>

                {/* 6. Web3 Certificate */}
                <button
                  onClick={() => {
                    onTabChange('certificate');
                    setActiveDropdown(null);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    currentTab === 'certificate'
                      ? 'bg-amber-50 text-amber-950 font-bold'
                      : 'hover:bg-stone-100 text-stone-800'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-semibold flex items-center gap-1">
                      <span>Web3 Certificate</span>
                      <span className="px-1 py-0.2 rounded bg-amber-600 text-white text-[8px] font-bold">NFT</span>
                    </div>
                    <div className="text-[10px] text-stone-500">Blockchain verified Yatra badge</div>
                  </div>
                </button>

                {/* If Creator: Contributor Studio */}
                {user?.role === 'CULTURAL_CREATOR' && (
                  <button
                    onClick={() => {
                      onTabChange('creator');
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'creator'
                        ? 'bg-orange-50 text-orange-950 font-bold'
                        : 'hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span className="text-sm">🎨</span>
                    <div>
                      <div className="font-semibold text-orange-900">Contributor Studio</div>
                      <div className="text-[10px] text-stone-500">Submit lore, crafts & audio</div>
                    </div>
                  </button>
                )}

                {/* 7. Strategic Foundation & Platform Blueprint */}
                <div className="pt-1.5 mt-1 border-t border-stone-200/80">
                  <button
                    onClick={() => {
                      onReopenIntro();
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-stone-900 border border-amber-200/80 transition-all cursor-pointer shadow-2xs"
                  >
                    <span className="text-base">🏛️</span>
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-stone-950">
                        <span>Strategic Foundation</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 text-[9px] font-black tracking-wide">
                          SIH 2026
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-600">
                        Sovereign blueprint, 8 live pillars & future roadmap
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT CONTROLS: [Plan Trip] CTA button, Language & Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          
          {/* Saved Places Bookmark Counter */}
          {savedItineraryCount > 0 && (
            <button
              onClick={onOpenItinerary}
              className="relative p-2 rounded-full hover:bg-black/5 text-stone-800 transition-colors cursor-pointer"
              title={getTranslation('savedPlaces', langCode)}
            >
              <Bookmark className="w-4 h-4 text-stone-800" />
              <span className="absolute 0 top-0.5 right-0.5 w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shadow-2xs">
                {savedItineraryCount}
              </span>
            </button>
          )}

          {/* Primary USP CTA: "Plan Trip" (Desktop/Tablet only; on mobile accessible via sidebar & bottom bar) */}
          <button
            onClick={() => {
              onTabChange('plan-trip');
              setActiveDropdown(null);
            }}
            className={`hidden md:inline-flex px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer items-center gap-1.5 ${
              currentTab === 'plan-trip'
                ? 'bg-black text-amber-300 ring-2 ring-amber-400'
                : 'bg-[#18181B] hover:bg-black text-white active:scale-95'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{getTranslation('planTrip', langCode) || 'Plan Trip'}</span>
          </button>

          {/* Language Switcher: 🌐 EN ⌄ (Desktop/Tablet; on mobile accessible in sidebar) */}
          <div className="hidden md:block relative">
            <button
              onClick={() => toggleDropdown('lang')}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full text-stone-800 hover:text-stone-950 text-xs sm:text-sm font-medium hover:bg-black/5 transition-colors cursor-pointer"
              title="Select Language"
            >
              <Globe className="w-4 h-4 text-sky-700" />
              <span className="font-semibold">{currentLangObj.code}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-stone-600 transition-transform ${
                  activeDropdown === 'lang' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Language Selection Dropdown Menu */}
            {activeDropdown === 'lang' && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-stone-200 animate-fade-in z-50 space-y-1">
                <div className="px-3 py-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between border-b border-stone-100">
                  <span>{getTranslation('language', langCode)}</span>
                  <span className="text-amber-700 font-semibold">{SUPPORTED_LANGUAGES.length} Languages</span>
                </div>

                <div className="max-h-64 overflow-y-auto pr-0.5 space-y-1">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setActiveDropdown(null);
                        
                        // Force Google Translate to translate the entire page
                        const targetLang = l.code.toLowerCase();
                        if (targetLang === 'en') {
                           // Remove translation cookie
                           document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                           document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
                        } else {
                           document.cookie = `googtrans=/en/${targetLang}; path=/`;
                           document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname}`;
                        }
                        
                        // Reload to apply translation to entire page
                        setTimeout(() => window.location.reload(), 100);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                        langCode === l.code
                          ? 'bg-amber-50 text-amber-900 font-bold'
                          : 'hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{l.flag}</span>
                        <span>{l.name}</span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono">{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sign In with Google Quick Button if in Guest Mode */}
          {user?.isGuest && (
            <button
              onClick={() => openAuthModal('TRAVELER')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              title="Sign in with Gmail as Contributor or Traveler"
            >
              <GoogleIcon className="w-3.5 h-3.5" />
              <span>Sign in with Google</span>
            </button>
          )}

          {/* User Profile Avatar Icon (Desktop/Tablet; on mobile accessible in sidebar) */}
          <div className="hidden md:block relative">
            <button
              onClick={() => toggleDropdown('user')}
              className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center cursor-pointer transition-all overflow-hidden ${
                !user?.isGuest && user?.authProvider === 'google'
                  ? 'bg-amber-100 text-stone-900 border-2 border-amber-600 ring-2 ring-blue-500/40 shadow-xs'
                  : 'bg-stone-900/10 hover:bg-stone-900/20 text-stone-900 border border-stone-900/20'
              }`}
              title={user?.isGuest ? 'Guest Explorer (Click to Sign in)' : `${user.name} (${user.role})`}
            >
              {user?.avatar || user?.photoURL ? (
                <img
                  src={user.avatar || user.photoURL}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-3.5 h-3.5 text-stone-800" />
              )}
            </button>

            {activeDropdown === 'user' && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl p-3 shadow-2xl border border-stone-200 animate-fade-in z-50 space-y-2.5">
                {/* User Identity Header */}
                <div className="px-1 border-b border-stone-100 pb-2">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-xs font-bold text-stone-900 truncate">
                      {user?.name || 'Heritage Pilgrim'}
                    </div>
                    {!user?.isGuest ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700 shrink-0">
                        <GoogleIcon className="w-2.5 h-2.5" />
                        <span>Google</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-mono shrink-0">
                        Guest
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate font-mono">
                    {user?.email || (user?.isGuest ? 'Guest Mode (Not signed in)' : 'traveler@aarambh.in')}
                  </div>
                </div>

                {/* 1-CLICK ROLE SWITCHER (Contributor <-> Traveler) */}
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/90">
                  <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Active Role Track</span>
                    <span className="text-amber-800 font-semibold">
                      {user?.role === 'CULTURAL_CREATOR' ? 'Contributor' : user?.role === 'ADMIN' ? 'Curator' : 'Traveler'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        switchRole('TRAVELER');
                        onTabChange('explore');
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        user?.role === 'TRAVELER'
                          ? 'bg-amber-900 text-white shadow-xs'
                          : 'text-stone-600 hover:bg-stone-200/80 bg-white border border-stone-200'
                      }`}
                    >
                      <Compass className="w-3 h-3" />
                      <span>Traveler</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole('CULTURAL_CREATOR');
                        onTabChange('creator');
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        user?.role === 'CULTURAL_CREATOR'
                          ? 'bg-orange-700 text-white shadow-xs'
                          : 'text-stone-600 hover:bg-stone-200/80 bg-white border border-stone-200'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Contributor</span>
                    </button>
                  </div>
                </div>

                {/* Guest Sign-in prompt */}
                {user?.isGuest && (
                  <button
                    onClick={() => {
                      openAuthModal('TRAVELER');
                      setActiveDropdown(null);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span>Sign in with Google / Gmail</span>
                  </button>
                )}

                {/* Role Specific Actions */}
                <div className="space-y-0.5 pt-1 border-t border-stone-100">
                  {user?.role === 'CULTURAL_CREATOR' ? (
                    <button
                      onClick={() => {
                        onTabChange('creator');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 font-bold transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>🎨</span>
                      <span>My Contributor Studio</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onTabChange('passport');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-stone-100 text-stone-800 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span>🛂</span>
                      <span>Digital Yatra Passport</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onOpenSaveMemory();
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-stone-100 text-stone-800 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>📸</span>
                    <span>{getTranslation('contributeMemoryBtn', langCode)}</span>
                  </button>

                  <button
                    onClick={() => {
                      onTabChange('admin');
                      setActiveDropdown(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-stone-100 text-stone-800 font-medium transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>🏛️</span>
                    <span>{getTranslation('curatorDesk', langCode)}</span>
                  </button>
                </div>

                {/* Bottom action: Sign out or Sign in */}
                <div className="pt-1.5 border-t border-stone-100">
                  {!user?.isGuest ? (
                    <button
                      onClick={() => {
                        signOut();
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-xl hover:bg-red-50 text-red-600 font-medium transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">Switch account</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        openAuthModal('CULTURAL_CREATOR');
                        setActiveDropdown(null);
                      }}
                      className="w-full text-center px-2 py-1 text-[11px] text-orange-700 hover:underline font-semibold cursor-pointer"
                    >
                      Sign in as Cultural Contributor
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile / Tablet Sidebar Toggle Button (Prominent & Unmissable on Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-black text-amber-300 border border-stone-800 flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
            aria-label="Open Navigation Sidebar"
          >
            <Menu className="w-4 h-4 text-amber-300 stroke-[2.5]" />
            <span className="text-xs font-black font-mono text-white tracking-wider">MENU</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE & TABLET OFF-CANVAS SLIDE-IN NAVIGATION SIDEBAR                    */}
      {/* ========================================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex justify-start">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-In Sidebar Sheet (Left-Anchored Classic Drawer) */}
          <aside
            className="relative w-[88vw] max-w-sm sm:w-[400px] bg-white h-full flex flex-col shadow-2xl border-r border-stone-200 z-10 animate-slide-in-left overflow-hidden select-none"
            style={{ minHeight: '100dvh', maxHeight: '100dvh' }}
          >
            {/* Top Sovereign Color Band */}
            <div
              className="h-1.5 w-full shrink-0"
              style={{
                background:
                  'linear-gradient(90deg, #F89B29 0%, #FFFFFF 50%, #319C45 100%)',
              }}
            />

            {/* Sidebar Header */}
            <div className="p-4 border-b border-stone-200/90 bg-stone-50/90 flex items-center justify-between shrink-0">
              <button
                onClick={() => {
                  onTabChange('explore');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 text-left cursor-pointer"
              >
                <AarambhLogo size="sm" />
                <div>
                  <div className="text-xs font-bold font-heritage text-stone-900 leading-tight">
                    AARAMBH
                  </div>
                  <div className="text-[10px] text-amber-900 font-mono font-semibold">
                    Living Heritage Navigation
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close navigation sidebar"
              >
                <X className="w-4 h-4 text-stone-800" />
              </button>
            </div>

            {/* Fast Feature & Section Search Bar */}
            <div className="p-3 bg-stone-50 border-b border-stone-200 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Search 15+ features, maps & hubs..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {sidebarSearch && (
                  <button
                    onClick={() => setSidebarSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Sidebar Body with All Items Visible */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
              
              {/* 1. AUTH & ROLE TRACK SECTION */}
              {user?.isGuest ? (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      Guest Explorer Mode
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-bold font-mono">
                      Free Access
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                    Sign in with Google to save your passport stamps, custom trails, and unlocked ranks.
                  </p>
                  <button
                    onClick={() => {
                      openAuthModal('TRAVELER');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-transform active:scale-95"
                  >
                    <GoogleIcon className="w-3.5 h-3.5" />
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center border border-amber-300 overflow-hidden shrink-0">
                        {user?.avatar || user?.photoURL ? (
                          <img
                            src={user.avatar || user.photoURL}
                            alt={user.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user?.name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
                          <span className="truncate">{user?.name}</span>
                          <span className="text-[9px] text-blue-700 bg-blue-50 border border-blue-200 px-1 rounded-full font-bold">
                            ✓
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono truncate">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer shrink-0"
                    >
                      Sign Out
                    </button>
                  </div>

                  {/* 1-Click Role Switcher */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-stone-200">
                    <button
                      onClick={() => {
                        switchRole('TRAVELER');
                        onTabChange('explore');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        user?.role === 'TRAVELER'
                          ? 'bg-amber-900 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600'
                      }`}
                    >
                      <Compass className="w-3 h-3" />
                      <span>Traveler</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole('CULTURAL_CREATOR');
                        onTabChange('creator');
                        setMobileMenuOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        user?.role === 'CULTURAL_CREATOR'
                          ? 'bg-orange-700 text-white shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Contributor</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. CORE SIGNATURE INNOVATIONS */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 px-1 flex items-center justify-between">
                  <span>Signature Innovations</span>
                  <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-mono">CORE AI</span>
                </div>

                {/* 1. Heritage Scanner */}
                {(!sidebarSearch || 'heritage scanner ai camera monument identify'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('scanner');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'scanner'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md ring-2 ring-amber-400'
                        : 'bg-white hover:bg-stone-50 border border-stone-200 text-stone-900'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-stone-950 flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4 text-stone-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span className="truncate">Heritage Scanner</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-400/50 text-stone-950 text-[9px] font-mono font-bold">AI CAMERA</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Point camera at monuments & recall oral lore</div>
                    </div>
                  </button>
                )}

                {/* 2. Digital Passport */}
                {(!sidebarSearch || 'digital yatra passport stamps mudras xp'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('passport');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'passport'
                        ? 'bg-amber-900 text-white shadow-xs'
                        : 'bg-white hover:bg-stone-50 border border-stone-200 text-stone-900'
                    }`}
                  >
                    <span className="text-base shrink-0">🛂</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span className="truncate">Digital Yatra Passport</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 text-[9px] font-mono font-bold">MUDRAS</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Live ink rubber stamps & printable yatra ID</div>
                    </div>
                  </button>
                )}

                {/* 3. 3D E-Visit */}
                {(!sidebarSearch || 'evisit 3d virtual darshan vr 360 pooja'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('evisit');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'evisit'
                        ? 'bg-stone-900 text-amber-200 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border border-stone-200 text-stone-900'
                    }`}
                  >
                    <span className="text-base shrink-0">🪔</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span className="truncate">3D E-Visit & Virtual Darshan</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 text-[9px] font-mono font-bold">360° VR</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">360° sanctum walkthroughs & pooja rituals</div>
                    </div>
                  </button>
                )}

                {/* 4. Traveler Hub */}
                {(!sidebarSearch || 'traveler hub radar bazaar fair tariffs auto fare chat'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('traveler-hub');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'traveler-hub'
                        ? 'bg-stone-900 text-emerald-300 shadow-xs'
                        : 'bg-white hover:bg-stone-50 border border-stone-200 text-stone-900'
                    }`}
                  >
                    <div className="relative flex h-2.5 w-2.5 shrink-0 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span className="truncate">Traveler Hub & Fair Tariffs</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 text-[9px] font-mono font-bold">LIVE RADAR</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Live radar, fair auto rates & artisan bazaar</div>
                    </div>
                  </button>
                )}

                {/* 5. Cultural Atlas & Trails */}
                {(!sidebarSearch || 'cultural atlas trails map trade routes layers custom drawing'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('maps');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'maps'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-300/80 text-emerald-950'
                    }`}
                  >
                    <span className="text-base shrink-0">🗺️</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span className="truncate">Cultural Atlas & Trails</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-700 text-white text-[8px] font-bold">THEMATIC LAYERS</span>
                      </div>
                      <div className="text-[10px] text-stone-600 font-normal truncate">Trade routes, ancient hotspots, weather & custom trails</div>
                    </div>
                  </button>
                )}
              </div>

              {/* 3. ITINERARY & EXPLORATION */}
              <div className="space-y-1.5 pt-1 border-t border-stone-200">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 px-1 flex items-center justify-between">
                  <span>Itinerary & Exploration</span>
                  <span className="text-[9px] text-stone-500 font-mono">TOOLS</span>
                </div>

                {/* Explore Heritage */}
                {(!sidebarSearch || 'explore monuments places search unesco'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('explore');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'explore'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span className="text-base">🏛️</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">Explore Heritage Directory</div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Pan-India heritage directory with regional filters</div>
                    </div>
                  </button>
                )}

                {/* Plan Trip */}
                {(!sidebarSearch || 'plan trip itinerary ai days route generator'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('plan-trip');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'plan-trip'
                        ? 'bg-stone-900 text-amber-300 font-bold'
                        : 'bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200/70 text-amber-950'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>AI Trip Planner</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[8px] font-bold">SMART</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Multi-day personalized sacred yatras & budgets</div>
                    </div>
                  </button>
                )}

                {/* Saved Places Itinerary */}
                {(!sidebarSearch || 'saved bookmarks itinerary places'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onOpenItinerary();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-amber-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>Saved Places & Stops</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[9px] font-bold">
                          {savedItineraryCount}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Review your saved pilgrimage spots & download</div>
                    </div>
                  </button>
                )}
              </div>

              {/* 4. LIVING TRADITIONS & GUILDS */}
              <div className="space-y-1.5 pt-1 border-t border-stone-200">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 px-1">
                  Living Traditions & Arts
                </div>

                {/* Monuments & Architecture */}
                {(!sidebarSearch || 'monuments architecture styles dynasties unesco'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('heritage');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'heritage'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span className="text-base">🏰</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">Monuments & Architecture</div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Dynasties, Dravidian & Nagara sacred structures</div>
                    </div>
                  </button>
                )}

                {/* Craft Guilds */}
                {(!sidebarSearch || 'crafts guilds living heritage artisans weavers pottery'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('living-heritage');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'living-heritage'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span className="text-base">🏺</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">Craft Guilds & Living Traditions</div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">GI tags, master weavers, bell metal & woodwork</div>
                    </div>
                  </button>
                )}

                {/* Ancient Games & Madhubani Canvas */}
                {(!sidebarSearch || 'ancient games chaupar moksha patam madhubani canvas art'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('games-canvas');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'games-canvas'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span className="text-base">🎲</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">Ancient Games & Folk Canvas</div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Play Chaupar, Moksha Patam & draw Madhubani art</div>
                    </div>
                  </button>
                )}
              </div>

              {/* 5. COMMUNITY LORE & WEB3 */}
              <div className="space-y-1.5 pt-1 border-t border-stone-200">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 px-1">
                  Oral Lore & Blockchain
                </div>

                {/* Oral Lore */}
                {(!sidebarSearch || 'oral lore community stories folk tales audio'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('community');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'community'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span className="text-base">👥</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">Oral Lore & Community Archive</div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Living memories, audio recordings & unwritten lore</div>
                    </div>
                  </button>
                )}

                {/* Web3 Certificate */}
                {(!sidebarSearch || 'web3 certificate blockchain nft badge yatra'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onTabChange('certificate');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                      currentTab === 'certificate'
                        ? 'bg-amber-900 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>Web3 Yatra Certificate</span>
                        <span className="px-1 py-0.2 rounded bg-amber-600 text-white text-[8px] font-bold">NFT</span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-normal truncate">Blockchain-verified soulbound pilgrimage credential</div>
                    </div>
                  </button>
                )}

                {/* Contribute Lore Action */}
                {(!sidebarSearch || 'contribute submit memory photo audio lore'.includes(sidebarSearch.toLowerCase())) && (
                  <button
                    onClick={() => {
                      onOpenSaveMemory();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full p-2.5 rounded-xl text-left font-semibold flex items-center gap-2.5 bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 text-orange-950 transition-colors cursor-pointer"
                  >
                    <span className="text-base">📸</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold">Contribute Living Memory</div>
                      <div className="text-[10px] text-stone-600 font-normal truncate">Upload oral histories, photographs & ancient folk stories</div>
                    </div>
                  </button>
                )}
              </div>

              {/* 6. STRATEGIC FOUNDATION (SIH 2026 BLUEPRINT) & PORTALS */}
              <div className="space-y-1.5 pt-1 border-t border-stone-200">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 px-1">
                  Sovereign Blueprint & Portals
                </div>

                {/* Strategic Foundation */}
                <button
                  onClick={() => {
                    onReopenIntro();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 text-left font-bold flex items-center justify-between shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">🏛️</span>
                    <div className="truncate">
                      <div className="text-xs font-bold text-stone-950 truncate">
                        Strategic Foundation
                      </div>
                      <div className="text-[10px] text-stone-600 font-normal truncate">
                        Sovereign blueprint & 8 live pillars
                      </div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-black font-mono shrink-0 ml-1">
                    SIH 2026
                  </span>
                </button>

                {/* Contributor Studio if Creator */}
                {user?.role === 'CULTURAL_CREATOR' && (
                  <button
                    onClick={() => {
                      onTabChange('creator');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'creator'
                        ? 'bg-orange-700 text-white shadow-xs'
                        : 'bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200'
                    }`}
                  >
                    <span className="text-base shrink-0">🎨</span>
                    <div>
                      <div className="text-xs font-bold">Contributor Studio</div>
                      <div className="text-[10px] opacity-80 font-normal">Manage your submitted lore & crafts</div>
                    </div>
                  </button>
                )}

                {/* Curator Desk (Admin) */}
                <button
                  onClick={() => {
                    onTabChange('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-2 rounded-xl text-left font-semibold flex items-center gap-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs transition-colors cursor-pointer"
                >
                  <span>🏛️</span>
                  <span>{getTranslation('curatorDesk', langCode)}</span>
                </button>
              </div>

              {/* 7. IN-SIDEBAR LANGUAGE SWITCHER */}
              <div className="pt-1 border-t border-stone-200 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 px-1 flex items-center justify-between">
                  <span>Language / भाषा</span>
                  <span className="text-amber-800 font-semibold">{currentLangObj.name}</span>
                </div>

                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setMobileMenuOpen(false);
                        const targetLang = l.code.toLowerCase();
                        if (targetLang === 'en') {
                          document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                          document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
                        } else {
                          document.cookie = `googtrans=/en/${targetLang}; path=/`;
                          document.cookie = `googtrans=/en/${targetLang}; path=/; domain=${window.location.hostname}`;
                        }
                        setTimeout(() => window.location.reload(), 100);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        langCode === l.code
                          ? 'bg-stone-900 text-white shadow-2xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="p-3 border-t border-stone-200 bg-stone-50/90 space-y-2 shrink-0">
              <button
                onClick={() => {
                  onTabChange('plan-trip');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Plan Your Cultural Yatra</span>
              </button>
              <div className="text-[10px] text-center text-stone-400 font-mono">
                SIH 2026 • Bharat Living Heritage Layer
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>

    {/* ========================================================================= */}
    {/* MOBILE BOTTOM NAVIGATION BAR (< lg)                                       */}
    {/* ========================================================================= */}
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-2xl py-1 px-2 flex items-center justify-around pb-safe select-none">
      {/* 1. Explore */}
      <button
        onClick={() => onTabChange('explore')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentTab === 'explore'
            ? 'text-amber-900 font-bold scale-105'
            : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <span className="text-base leading-none">🏛️</span>
        <span className="text-[10px] mt-0.5 font-medium">Explore</span>
      </button>

      {/* 2. Scanner */}
      <button
        onClick={() => onTabChange('scanner')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentTab === 'scanner'
            ? 'text-amber-900 font-bold scale-105'
            : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <Camera className="w-4 h-4" />
        <span className="text-[10px] mt-0.5 font-medium">Scanner</span>
      </button>

      {/* 3. Passport */}
      <button
        onClick={() => onTabChange('passport')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentTab === 'passport'
            ? 'text-amber-900 font-bold scale-105'
            : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <span className="text-base leading-none">🛂</span>
        <span className="text-[10px] mt-0.5 font-medium">Passport</span>
      </button>

      {/* 4. Atlas / Maps */}
      <button
        onClick={() => onTabChange('maps')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
          currentTab === 'maps'
            ? 'text-emerald-800 font-bold scale-105'
            : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <span className="text-base leading-none">🗺️</span>
        <span className="text-[10px] mt-0.5 font-medium">Atlas</span>
      </button>

      {/* 5. Signature USP: Traveler Hub (Live Radar, Fair Auto Fares & Bazaar) */}
      <button
        onClick={() => onTabChange('traveler-hub')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
          currentTab === 'traveler-hub'
            ? 'text-emerald-900 font-bold scale-105'
            : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <div className="relative">
          <span className="text-base leading-none">📡</span>
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
        <span className="text-[10px] mt-0.5 font-bold font-mono">Hub & Fares</span>
      </button>
    </nav>
  </>
);
};
