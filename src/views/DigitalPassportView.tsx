import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { DigitalYatraPassport, PassportStamp, StampInkColor, StampShape } from '../types';
import { PassportStampBadge } from '../components/PassportStampBadge';
import { AarambhLogo } from '../components/AarambhLogo';
import { heritageAudio } from '../utils/audioEffects';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Stamp,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Download,
  Share2,
  Printer,
  Compass,
  Award,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  RotateCw,
  Plane,
  Train,
  ShieldCheck,
  Globe,
  User,
  Zap,
  Lock,
  Unlock,
  TrendingUp,
  Flame,
  Star,
  Trophy,
  X,
  Layers,
  ArrowRight,
  Camera,
  Check,
} from 'lucide-react';
import { handlePrintSection } from '../utils/print';
import { SocialShareModal } from '../components/SocialShareModal';
import { executeWebShare, isWebShareSupported, SharePayload } from '../utils/socialShare';
import {
  calculateUserXP,
  XP_LEVELS,
  UserXPBreakdown,
  XP_RATES,
  getStoredHeritageSites,
  toggleHeritageSiteVisit,
  HeritageVisitTrackerItem,
  recordMemorySavedXP,
} from '../utils/experiencePoints';

// Iconic Indian destinations that can be stamped
const HERITAGE_DESTINATIONS: Array<{
  id: string;
  name: string;
  hindiName: string;
  city: string;
  state: string;
  epoch: string;
  category: string;
  inkColor: StampInkColor;
  shape: StampShape;
  iconSymbol: string;
}> = [
  {
    id: 'varanasi-kashi',
    name: 'Kashi Vishwanath & Ganga Ghats',
    hindiName: 'काशी विश्वनाथ एवं दशाश्वमेध घाट',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    epoch: 'Ancient Vedic',
    category: 'Sacred Mandir',
    inkColor: 'crimson',
    shape: 'round',
    iconSymbol: '🕉️',
  },
  {
    id: 'hampi-virupaksha',
    name: 'Hampi Virupaksha & Stone Chariot',
    hindiName: 'हम्पी विरुपाक्ष मन्दिर',
    city: 'Hampi',
    state: 'Karnataka',
    epoch: '14th Century CE',
    category: 'UNESCO Landmark',
    inkColor: 'ochre',
    shape: 'octagon',
    iconSymbol: '🏛️',
  },
  {
    id: 'jaipur-amber',
    name: 'Amber Palace & Sheesh Mahal',
    hindiName: 'आमेर दुर्ग एवं शीश महल',
    city: 'Jaipur',
    state: 'Rajasthan',
    epoch: '1592 CE',
    category: 'Royal Citadel',
    inkColor: 'indigo',
    shape: 'shield',
    iconSymbol: '🏰',
  },
  {
    id: 'konark-sun',
    name: 'Konark Sun Chariot Temple',
    hindiName: 'कोणार्क सूर्य मन्दिर',
    city: 'Puri District',
    state: 'Odisha',
    epoch: '1250 CE',
    category: 'UNESCO Landmark',
    inkColor: 'ochre',
    shape: 'round',
    iconSymbol: '☸️',
  },
  {
    id: 'kedarnath-dham',
    name: 'Kedarnath Sacred Jyotirlinga',
    hindiName: 'केदारनाथ ज्योतिर्लिंग धाम',
    city: 'Rudraprayag',
    state: 'Uttarakhand',
    epoch: '8th Century CE',
    category: 'Himalayan Shrine',
    inkColor: 'emerald',
    shape: 'octagon',
    iconSymbol: '🏔️',
  },
  {
    id: 'amritsar-golden',
    name: 'Sri Harmandir Sahib (Golden Temple)',
    hindiName: 'श्री हरिमन्दिर साहिब',
    city: 'Amritsar',
    state: 'Punjab',
    epoch: '1577 CE',
    category: 'Sacred Gurdwara',
    inkColor: 'ochre',
    shape: 'round',
    iconSymbol: '✨',
  },
  {
    id: 'madurai-meenakshi',
    name: 'Madurai Meenakshi Sundareswarar',
    hindiName: 'मीनाक्षी अम्मन मन्दिर',
    city: 'Madurai',
    state: 'Tamil Nadu',
    epoch: '6th Century CE',
    category: 'Dravidian Gopuram',
    inkColor: 'purple',
    shape: 'shield',
    iconSymbol: '🛕',
  },
  {
    id: 'khajuraho-temples',
    name: 'Khajuraho Monument Complex',
    hindiName: 'खजुराहो मन्दिर समूह',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    epoch: '950 CE',
    category: 'UNESCO Landmark',
    inkColor: 'crimson',
    shape: 'round',
    iconSymbol: '🗿',
  },
  {
    id: 'ellora-kailasa',
    name: 'Kailasa Monolithic Temple (Cave 16)',
    hindiName: 'कैलास एकाश्मक मन्दिर एलोरा',
    city: 'Aurangabad',
    state: 'Maharashtra',
    epoch: '756 CE',
    category: 'Rock-Cut Marvel',
    inkColor: 'indigo',
    shape: 'octagon',
    iconSymbol: '⛰️',
  },
  {
    id: 'rani-ki-vav',
    name: 'Rani ki Vav Stepwell',
    hindiName: 'रानी की वाव',
    city: 'Patan',
    state: 'Gujarat',
    epoch: '1063 CE',
    category: 'Subterranean Heritage',
    inkColor: 'emerald',
    shape: 'rect',
    iconSymbol: '🌊',
  },
  {
    id: 'bodhgaya-mahabodhi',
    name: 'Mahabodhi Mahavihara',
    hindiName: 'महाबोधि मन्दिर बोधगया',
    city: 'Bodh Gaya',
    state: 'Bihar',
    epoch: '3rd Century BCE',
    category: 'Buddhist Sacred Site',
    inkColor: 'ochre',
    shape: 'round',
    iconSymbol: '🌿',
  },
  {
    id: 'delhi-redfort',
    name: 'Lal Qila (Red Fort)',
    hindiName: 'लाल किला दिल्ली',
    city: 'New Delhi',
    state: 'Delhi',
    epoch: '1638 CE',
    category: 'National Monument',
    inkColor: 'crimson',
    shape: 'shield',
    iconSymbol: '🚩',
  },
];

const POPULAR_ORIGIN_CITIES = [
  'New Delhi',
  'Varanasi',
  'Mumbai',
  'Jaipur',
  'Bengaluru',
  'Kolkata',
  'Chennai',
  'Ahmedabad',
  'Srinagar',
  'Amritsar',
  'Bhubaneswar',
  'Hyderabad',
];

interface DigitalPassportViewProps {
  onNavigateTab?: (tab: string) => void;
  onOpenSaveMemory?: () => void;
}

export const DigitalPassportView: React.FC<DigitalPassportViewProps> = ({
  onNavigateTab,
  onOpenSaveMemory,
}) => {
  const { user } = useAuth();

  // Sound toggle
  const [soundOn, setSoundOn] = useState<boolean>(heritageAudio.isEnabled());

  // User Experience Points & Level Progression Engine
  const [xpData, setXpData] = useState<UserXPBreakdown>(calculateUserXP);
  const prevLevelRef = useRef<number>(xpData.currentLevel.level);
  const [showLevelUpModal, setShowLevelUpModal] = useState<boolean>(false);
  const [showRoadmapModal, setShowRoadmapModal] = useState<boolean>(false);
  const [showVisitedSitesModal, setShowVisitedSitesModal] = useState<boolean>(false);
  const [page4SubTab, setPage4SubTab] = useState<'levels' | 'earn' | 'badges'>('levels');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Social Sharing Web Share Modal State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharePayload, setSharePayload] = useState<SharePayload>({
    title: 'Aarambh Digital Yatra Passport',
    text: 'Explore and preserve Bharat’s timeless heritage with me on Aarambh!',
  });

  const handleSharePassport = async (customPayload?: Partial<SharePayload>) => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://aarambh.heritage.in';
    const payload: SharePayload = {
      title: customPayload?.title || `Aarambh Heritage Passport • Level ${xpData.currentLevel.level}: ${xpData.currentLevel.title}`,
      text:
        customPayload?.text ||
        `🏛️ I am currently Level ${xpData.currentLevel.level} (${xpData.currentLevel.title} • ${xpData.currentLevel.hindiTitle}) on the Aarambh Digital Yatra Passport!\n\n✨ Total XP: ${xpData.totalXP}\n🛂 Mudra Stamps: ${xpData.passportStampsCount}\n🏛️ Visited Heritage Sites: ${xpData.sitesVisitedCount}\n📜 Living Memories: ${xpData.memoriesSavedCount}\n\nExplore and preserve Bharat's timeless heritage:`,
      url: customPayload?.url || currentUrl,
      imageUrl: customPayload?.imageUrl,
    };

    // If native Web Share API is available in browser, try it first
    if (isWebShareSupported()) {
      try {
        const res = await executeWebShare(payload);
        if (res.success && res.method === 'native') {
          showToast('Achievement shared successfully!');
          return;
        }
      } catch (e) {
        console.warn('Native share error:', e);
      }
    }
    // Fallback/rich sharing modal
    setSharePayload(payload);
    setShowShareModal(true);
  };

  // Visited heritage sites list for XP tracking
  const [visitedSites, setVisitedSites] = useState<HeritageVisitTrackerItem[]>(getStoredHeritageSites);
  const [siteSearchQuery, setSiteSearchQuery] = useState<string>('');
  const [newSiteName, setNewSiteName] = useState<string>('');
  const [newSiteState, setNewSiteState] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleToggleSiteVisit = (siteId: string) => {
    const { updatedSites, isNowVisited } = toggleHeritageSiteVisit(siteId);
    setVisitedSites(updatedSites);
    heritageAudio.playStampSound();
    if (isNowVisited) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#d97706', '#2563eb'],
      });
      showToast(`Heritage site marked as visited! (+${XP_RATES.SITE_VISITED} XP)`);
    } else {
      showToast('Site visit removed from tracker.');
    }
  };

  const handleAddCustomSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;

    const newSite: HeritageVisitTrackerItem = {
      id: `custom-site-${Date.now()}`,
      name: newSiteName.trim(),
      state: newSiteState.trim() || 'Bharat',
      category: 'monument',
      visited: true,
      visitedDate: new Date().toISOString().split('T')[0],
    };

    const updated = [newSite, ...visitedSites];
    setVisitedSites(updated);
    try {
      localStorage.setItem('aarambh_visited_sites', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('aarambh-xp-updated', { detail: { action: 'SITE_ADDED' } }));
    } catch (e) {
      console.warn(e);
    }

    setNewSiteName('');
    setNewSiteState('');
    heritageAudio.playStampSound();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#d97706', '#f59e0b'],
    });
    showToast(`Added and marked ${newSite.name} as visited! (+${XP_RATES.SITE_VISITED} XP)`);
  };

  // Re-calculate XP dynamically whenever stamps, storage, or custom event changes
  useEffect(() => {
    const refreshXP = () => {
      const updated = calculateUserXP();
      if (updated.currentLevel.level > prevLevelRef.current) {
        setShowLevelUpModal(true);
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.4 },
          colors: ['#f59e0b', '#dc2626', '#2563eb', '#10b981'],
        });
        heritageAudio.playStampSound();
      }
      prevLevelRef.current = updated.currentLevel.level;
      setXpData(updated);
    };

    refreshXP();

    window.addEventListener('aarambh-xp-updated', refreshXP);
    window.addEventListener('storage', refreshXP);
    return () => {
      window.removeEventListener('aarambh-xp-updated', refreshXP);
      window.removeEventListener('storage', refreshXP);
    };
  }, []);

  // Passport state
  const [passport, setPassport] = useState<DigitalYatraPassport>(() => {
    const saved = localStorage.getItem('aarambh_digital_passport');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback below
      }
    }
    return {
      passportNumber: 'IND-YR-2026-78419',
      holderName: 'Arun Heritage Traveler',
      originCity: 'New Delhi',
      destinationCity: 'Varanasi',
      tripStartDate: new Date().toISOString().split('T')[0],
      circuitName: 'Sacred Ganga & Kashi Yatra Circuit',
      issueDate: '12 September 2026',
      stamps: [
        {
          id: 'varanasi-kashi',
          name: 'Kashi Vishwanath & Ganga Ghats',
          hindiName: 'काशी विश्वनाथ एवं दशाश्वमेध घाट',
          city: 'Varanasi',
          state: 'Uttar Pradesh',
          date: '2026-09-12',
          inkColor: 'crimson',
          shape: 'round',
          motto: 'सत्यमेव जयते',
          iconSymbol: '🕉️',
          verified: true,
          rotation: -4,
          stampCategory: 'Sacred Mandir',
        },
        {
          id: 'origin-stamp',
          name: 'Yatra Origin Departure Seal',
          hindiName: 'यात्रा प्रस्थान मोहर',
          city: 'New Delhi',
          state: 'Delhi NCR',
          date: '2026-09-12',
          inkColor: 'indigo',
          shape: 'octagon',
          motto: 'अतिथि देवो भव',
          iconSymbol: '🚆',
          verified: true,
          rotation: 3,
          stampCategory: 'Origin Station',
        },
      ],
      stampedCount: 2,
      totalTripsCompleted: 1,
      citizenshipTier: 'Sanskriti Sahayak',
    };
  });

  // Current booklet page: 0 = Cover, 1 = Bio / ID Page, 2 = Visa Page 1, 3 = Visa Page 2, 4 = Badges & Perks
  const [activePage, setActivePage] = useState<number>(1);

  // New Trip Start form modal / state
  const [showTripSetup, setShowTripSetup] = useState<boolean>(false);
  const [newOrigin, setNewOrigin] = useState<string>(passport.originCity);
  const [newDestination, setNewDestination] = useState<string>(passport.destinationCity);
  const [newCircuit, setNewCircuit] = useState<string>(passport.circuitName);

  // Stamping Animation State
  const [isStampingAnimation, setIsStampingAnimation] = useState<boolean>(false);
  const [animatingStamp, setAnimatingStamp] = useState<PassportStamp | null>(null);
  const [justStampedId, setJustStampedId] = useState<string | null>(null);

  // Custom Place to Stamp
  const [showCustomStampModal, setShowCustomStampModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customColor, setCustomColor] = useState<StampInkColor>('crimson');

  // Search in stamping drawer
  const [searchQuery, setSearchQuery] = useState('');

  // Persist passport
  useEffect(() => {
    localStorage.setItem('aarambh_digital_passport', JSON.stringify(passport));
  }, [passport]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    heritageAudio.setEnabled(next);
  };

  const handlePageChange = (page: number) => {
    setActivePage(page);
    heritageAudio.playPageFlipSound();
  };

  // Perform a realistic stamp slam animation
  const handleStampPlace = (dest: typeof HERITAGE_DESTINATIONS[0]) => {
    // Check if already stamped
    const already = passport.stamps.some((s) => s.id === dest.id);
    if (already) {
      showToast(`${dest.name} is already stamped in your digital passport!`);
      return;
    }

    const newStamp: PassportStamp = {
      id: dest.id,
      name: dest.name,
      hindiName: dest.hindiName,
      city: dest.city,
      state: dest.state,
      date: new Date().toISOString().split('T')[0],
      inkColor: dest.inkColor,
      shape: dest.shape,
      motto: 'सत्यमेव जयते',
      iconSymbol: dest.iconSymbol,
      verified: true,
      rotation: Math.floor(Math.random() * 14) - 7, // natural -7 to +7 deg
      stampCategory: dest.category,
    };

    setAnimatingStamp(newStamp);
    setIsStampingAnimation(true);

    // Auto-navigate to visa pages to watch the stamp drop
    setActivePage(2);

    setTimeout(() => {
      // Audio THUD impact!
      heritageAudio.playStampSound();

      // Confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#b91c1c', '#1e3a8a', '#d97706', '#059669'],
      });

      // Update passport state
      setPassport((prev) => {
        const nextStamps = [...prev.stamps, newStamp];
        const count = nextStamps.length;
        let tier: DigitalYatraPassport['citizenshipTier'] = 'Sanskriti Sahayak';
        if (count >= 12) tier = 'Maha Yatri';
        else if (count >= 7) tier = 'Dharohar Rakshak';
        else if (count >= 4) tier = 'Yatra Pathik';

        return {
          ...prev,
          stamps: nextStamps,
          stampedCount: count,
          citizenshipTier: tier,
        };
      });

      setJustStampedId(newStamp.id);
      showToast(`Stamped ${newStamp.name}! (+${XP_RATES.PASSPORT_STAMP} XP)`);

      // Automatically mark destination in visited sites ledger if exists
      const currentStored = getStoredHeritageSites();
      const match = currentStored.find((s) => s.id === dest.id || s.name.toLowerCase().includes(dest.name.toLowerCase()) || dest.name.toLowerCase().includes(s.name.toLowerCase()));
      if (match && !match.visited) {
        const { updatedSites } = toggleHeritageSiteVisit(match.id);
        setVisitedSites(updatedSites);
      }

      window.dispatchEvent(new CustomEvent('aarambh-xp-updated'));

      setTimeout(() => {
        setIsStampingAnimation(false);
        setAnimatingStamp(null);
      }, 700);

      setTimeout(() => {
        setJustStampedId(null);
      }, 3000);
    }, 600);
  };

  const handleStartNewTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim()) return;

    // Generate origin departure stamp
    const originStamp: PassportStamp = {
      id: `origin-${Date.now()}`,
      name: `Departure: ${newOrigin}`,
      hindiName: `प्रस्थान केंद्र: ${newOrigin}`,
      city: newOrigin,
      state: 'Bharat',
      date: new Date().toISOString().split('T')[0],
      inkColor: 'indigo',
      shape: 'octagon',
      motto: 'शुभ यात्रा',
      iconSymbol: '🛫',
      verified: true,
      rotation: Math.floor(Math.random() * 10) - 5,
      stampCategory: 'Origin Departure Seal',
    };

    setPassport((prev) => ({
      ...prev,
      originCity: newOrigin,
      destinationCity: newDestination || 'Varanasi',
      circuitName: newCircuit || 'Custom Bharat Heritage Circuit',
      passportNumber: `IND-YR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      stamps: [originStamp, ...prev.stamps.filter((s) => !s.id.startsWith('origin-'))],
      stampedCount: prev.stamps.length + 1,
    }));

    setShowTripSetup(false);
    setActivePage(1); // open to bio page
    heritageAudio.playStampSound();
  };

  const handleAddCustomStamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customCity.trim()) return;

    const customStamp: PassportStamp = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      city: customCity.trim(),
      state: 'Bharat',
      date: new Date().toISOString().split('T')[0],
      inkColor: customColor,
      shape: 'round',
      motto: 'धर्माय नमः',
      iconSymbol: '🏛️',
      verified: true,
      rotation: Math.floor(Math.random() * 12) - 6,
      stampCategory: 'Custom Explorer Site',
    };

    setAnimatingStamp(customStamp);
    setIsStampingAnimation(true);
    setActivePage(2);
    setShowCustomStampModal(false);

    setTimeout(() => {
      heritageAudio.playStampSound();
      setPassport((prev) => ({
        ...prev,
        stamps: [...prev.stamps, customStamp],
        stampedCount: prev.stamps.length + 1,
      }));
      setJustStampedId(customStamp.id);
      setTimeout(() => {
        setIsStampingAnimation(false);
        setAnimatingStamp(null);
      }, 700);
    }, 600);

    setCustomName('');
    setCustomCity('');
  };

  const filteredDestinations = HERITAGE_DESTINATIONS.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Divide stamps across pages (Page 2: stamps 0-5, Page 3: stamps 6-11, etc.)
  const page1Stamps = passport.stamps.slice(0, 6);
  const page2Stamps = passport.stamps.slice(6, 12);

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-stone-900 pb-20 selection:bg-amber-100 relative">
      {/* Toast Notification Banner (No window.alert) */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-amber-300 px-5 py-3 rounded-full text-xs font-semibold shadow-2xl border border-amber-500/40 backdrop-blur-md flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-amber-700" />
                  Bharatiya Sanskriti Yatra Mudra
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-300 text-stone-700 text-xs font-mono font-semibold">
                  {passport.passportNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-royal text-stone-950">
                Aarambh Digital Heritage Passport
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl font-light">
                Your sovereign digital passport for exploring India. Gain Experience Points (XP) and ascend Cultural Ranks as you preserve living memories, visit ancient sanctuaries, and collect official ink seals.
              </p>
            </div>

            {/* Quick Actions & Sound Control */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSound}
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  soundOn
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-stone-100 border-stone-300 text-stone-500'
                }`}
                title={soundOn ? 'Sound Effects Enabled' : 'Sound Muted'}
              >
                {soundOn ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{soundOn ? 'SFX On' : 'Muted'}</span>
              </button>

              <button
                onClick={() => setShowTripSetup(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Compass className="w-4 h-4 text-amber-200" />
                <span>Start New Trip</span>
              </button>

              <button
                onClick={() => handlePrintSection('printable-passport-booklet', 'portrait', true)}
                className="px-4 py-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Print Passport Booklet"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>Print</span>
              </button>

              <button
                onClick={() => handleSharePassport()}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                title="Share your Cultural Passport achievements & mudra stamps via Web Share API"
              >
                <Share2 className="w-4 h-4 text-stone-950" />
                <span>Share Passport</span>
              </button>
            </div>
          </div>

          {/* USER EXPERIENCE POINTS & CULTURAL LEVEL HUD RIBBON */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 border border-stone-800 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Left: Level Badge & Rank */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30 border border-amber-300/40 shrink-0">
                  {xpData.currentLevel.badgeIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-400/30">
                      Level {xpData.currentLevel.level} • {xpData.currentLevel.hindiTitle}
                    </span>
                    <span className="text-xs font-bold text-amber-300 font-mono">
                      {xpData.totalXP} Total XP
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                    <span>{xpData.currentLevel.title}</span>
                  </h3>
                  <p className="text-[11px] text-stone-400 font-serif italic">
                    "{xpData.currentLevel.motto}"
                  </p>
                </div>
              </div>

              {/* Center: Interactive Progress Bar to Next Level */}
              <div className="flex-1 max-w-md space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-300">
                    {xpData.nextLevel ? (
                      <>Next Rank: <strong className="text-amber-300">{xpData.nextLevel.title}</strong></>
                    ) : (
                      <span className="text-amber-400 font-bold">Supreme Rank Attained</span>
                    )}
                  </span>
                  <span className="text-amber-400 font-bold">
                    {xpData.nextLevel ? `${xpData.xpNeededForNext} XP to Level ${xpData.nextLevel.level}` : 'Max Tier'}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-stone-950 border border-stone-800 p-0.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-700 shadow-sm"
                    style={{ width: `${xpData.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                  <span>{xpData.xpInCurrentLevel} / {xpData.nextLevel ? xpData.nextLevel.minXP - xpData.currentLevel.minXP : '∞'} XP in Tier</span>
                  <span>{xpData.progressPercent}% Completed</span>
                </div>
              </div>

              {/* Right: View Roadmap & Share */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRoadmapModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Award className="w-3.5 h-3.5 text-stone-950" />
                  <span>Cultural Levels Dossier</span>
                </button>

                <button
                  onClick={() => handleSharePassport()}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-400/40 text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  title="Share your cultural progress with friends"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Micro Counters Row - Interactive */}
            <div className="mt-3 pt-3 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (onOpenSaveMemory) onOpenSaveMemory();
                  else if (onNavigateTab) onNavigateTab('memory');
                }}
                className="flex items-center gap-2 text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors text-left cursor-pointer"
                title="Save a memory to earn +150 XP"
              >
                <span className="text-amber-400 text-base">📝</span>
                <div>
                  <div className="text-[11px] leading-tight">
                    Memories: <strong className="text-white">{xpData.memoriesSavedCount}</strong>
                  </div>
                  <span className="text-amber-400 font-mono text-[9px] font-bold">+{xpData.memoriesXP} XP • Save Memory</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowVisitedSitesModal(true)}
                className="flex items-center gap-2 text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors text-left cursor-pointer"
                title="Mark visited heritage sites to earn +100 XP each"
              >
                <span className="text-amber-400 text-base">🏛️</span>
                <div>
                  <div className="text-[11px] leading-tight">
                    Sites Visited: <strong className="text-white">{xpData.sitesVisitedCount}</strong>
                  </div>
                  <span className="text-amber-400 font-mono text-[9px] font-bold">+{xpData.sitesVisitedXP} XP • Check Sites</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(2)}
                className="flex items-center gap-2 text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors text-left cursor-pointer"
                title="Collect official rubber stamps to earn +80 XP each"
              >
                <span className="text-amber-400 text-base">🛂</span>
                <div>
                  <div className="text-[11px] leading-tight">
                    Mudra Stamps: <strong className="text-white">{xpData.passportStampsCount}</strong>
                  </div>
                  <span className="text-amber-400 font-mono text-[9px] font-bold">+{xpData.passportStampsXP} XP • Visas</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab ? onNavigateTab('scanner') : null}
                className="flex items-center gap-2 text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-stone-800/60 transition-colors text-left cursor-pointer"
                title="Scan monuments with camera to earn +75 XP each"
              >
                <span className="text-amber-400 text-base">📷</span>
                <div>
                  <div className="text-[11px] leading-tight">
                    Camera Scans: <strong className="text-white">{xpData.monumentsScannedCount}</strong>
                  </div>
                  <span className="text-amber-400 font-mono text-[9px] font-bold">+{xpData.monumentsScannedXP} XP • Scanner</span>
                </div>
              </button>
            </div>
          </div>

          {/* PAGE NAVIGATION TABS */}
          <div className="flex items-center justify-between border-t border-stone-100 mt-5 pt-3 overflow-x-auto gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[
                { id: 0, label: 'Cover', icon: '📘' },
                { id: 1, label: 'Identity / Bio', icon: '👤' },
                { id: 2, label: `Visas (1-6) [${page1Stamps.length}]`, icon: '🪶' },
                { id: 3, label: `Visas (7-12) [${page2Stamps.length}]`, icon: '🪶' },
                { id: 4, label: `XP & Levels (${xpData.totalXP} XP)`, icon: '🎖️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handlePageChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activePage === tab.id
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-stone-600 bg-stone-50 px-3 py-1 rounded-md border border-stone-200">
              <MapPin className="w-3 h-3 text-amber-600" />
              <span>Origin: <strong>{passport.originCity}</strong></span>
              <span className="text-stone-300">•</span>
              <span>Total Stamps: <strong className="text-amber-800">{passport.stamps.length}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN PASSPORT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: THE PASSPORT BOOKLET VIEW (SPAN 7) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* BOOKLET ENCLOSURE */}
            <div id="printable-passport-booklet" className="relative w-full max-w-xl perspective-1000">
              
              {/* STAMPING ANIMATION OVERLAY (The Flying Rubber Stamp) */}
              {isStampingAnimation && animatingStamp && (
                <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
                  <div className="flex flex-col items-center animate-stamp-slam drop-shadow-2xl">
                    {/* Wooden / Brass Stamp Handle */}
                    <div className="w-10 h-16 bg-gradient-to-b from-[#4a2a18] via-[#783e1e] to-[#2c180e] rounded-t-full border-2 border-[#d97706] shadow-xl flex items-center justify-center">
                      <div className="w-2 h-10 bg-amber-400/40 rounded-full" />
                    </div>
                    {/* Brass Mount Collar */}
                    <div className="w-18 h-4 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 rounded-sm border border-amber-900 shadow-md" />
                    {/* Rubber Head */}
                    <div className="w-28 h-8 bg-stone-800 rounded-md border border-stone-900 shadow-2xl flex items-center justify-center">
                      <span className="text-[10px] font-mono text-amber-300 font-bold tracking-widest uppercase">
                        ★ ASI MUDRA ★
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= PAGE 0: COVER ================= */}
              <div
                onClick={() => handlePageChange(1)}
                className={`passport-page w-full min-h-[520px] sm:min-h-[580px] bg-[#14213d] text-[#e5a93b] rounded-2xl p-8 sm:p-12 shadow-2xl border-4 border-[#0b1325] flex flex-col justify-between items-center text-center select-none cursor-pointer transition-transform hover:scale-[1.01] relative overflow-hidden ${activePage !== 0 ? 'hidden hide-on-print-passport' : ''}`}
                style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(0,0,0,0.6)',
                  }}
                >
                  {/* Leatherette Grain Effect */}
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)',
                      backgroundSize: '4px 4px',
                    }}
                  />

                  {/* Top Gold Headings */}
                  <div className="space-y-2 z-10">
                    <div className="text-sm sm:text-base font-bold tracking-[0.25em] uppercase font-serif">
                      गणराज्य भारत
                    </div>
                    <div className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-[#F3E5AB]">
                      REPUBLIC OF INDIA
                    </div>
                  </div>

                  {/* Center Emblem & Aarambh Insignia */}
                  <div className="my-auto z-10 flex flex-col items-center space-y-5">
                    {/* Ashoka Lion / Sacred Mandala Emblem */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-[#e5a93b] p-2 flex items-center justify-center shadow-inner">
                      <div className="w-full h-full rounded-full border border-dashed border-[#F3E5AB] flex flex-col items-center justify-center">
                        <AarambhLogo size="lg" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-xl sm:text-2xl font-black font-royal tracking-widest text-[#FBF5B7] uppercase drop-shadow-md">
                        आरम्भ यात्रा पासपोर्ट
                      </h2>
                      <div className="text-xs sm:text-sm font-serif font-bold tracking-widest text-[#e5a93b] uppercase">
                        AARAMBH HERITAGE PASSPORT
                      </div>
                    </div>
                  </div>

                  {/* Bottom Passport Details */}
                  <div className="w-full z-10 border-t border-[#e5a93b]/40 pt-4 flex items-center justify-between text-xs font-mono text-[#F3E5AB]/80">
                    <span>{passport.passportNumber}</span>
                    <span className="flex items-center gap-1 font-bold text-white hover:underline">
                      Open Booklet <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              

              {/* ================= PAGE 1: BIO / ID PAGE ================= */}
              
                <div
                  id="passport-bio-page"
                  className={`passport-page w-full min-h-[520px] sm:min-h-[580px] bg-[#FAF6EE] text-stone-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-stone-300 flex flex-col justify-between select-none relative overflow-hidden font-sans ${activePage !== 1 ? 'hidden hide-on-print-passport' : ''}`}
                  style={{
                    backgroundImage: 'radial-gradient(#d6c7b0 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                >
                  {/* Subtle Guilloche Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                    <svg className="w-96 h-96" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
                      <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>

                  {/* Top Security Header */}
                  <div className="border-b-2 border-stone-300 pb-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-stone-500 font-mono">
                        BHARAT CULTURAL CITIZENRY REGISTRY
                      </div>
                      <div className="text-sm sm:text-base font-black font-royal text-stone-900">
                        भारत गणराज्य • PASSPORT / पारपत्र
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-full border border-amber-400 flex items-center gap-1 shadow-2xs">
                        <span>{xpData.currentLevel.badgeIcon}</span>
                        <span>Level {xpData.currentLevel.level} • {xpData.currentLevel.title}</span>
                      </span>
                    </div>
                  </div>

                  {/* Bio Info Grid */}
                  <div className="my-auto py-4 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    {/* Left: Passport Photo / Avatar */}
                    <div className="sm:col-span-4 flex flex-col items-center">
                      <div className="w-28 h-36 bg-gradient-to-tr from-stone-200 to-stone-100 rounded-xl border-2 border-stone-400 p-1 shadow-inner relative flex flex-col items-center justify-center overflow-hidden">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Traveler"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-stone-400">
                            <User className="w-12 h-12 text-stone-500" />
                            <span className="text-[9px] font-mono text-stone-500 mt-1 font-bold">HERITAGE YATRI</span>
                          </div>
                        )}
                        {/* Official holographic watermark stamp across photo */}
                        <div className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full border border-amber-500/60 bg-amber-400/20 backdrop-blur-xs flex items-center justify-center rotate-12">
                          <span className="text-[6px] font-mono font-bold text-amber-900 text-center leading-tight">
                            ASI<br />VERIFIED
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] font-mono text-stone-500 font-semibold">
                        STATUS: ACTIVE
                      </div>
                    </div>

                    {/* Right: Traveler Fields */}
                    <div className="sm:col-span-8 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-stone-400 font-mono">Passport No.</div>
                          <div className="font-mono font-bold text-stone-900 text-sm">{passport.passportNumber}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-stone-400 font-mono">Traveler Name</div>
                          <div className="font-bold text-stone-900 truncate">
                            {user?.displayName || passport.holderName}
                          </div>
                        </div>
                      </div>

                      {/* Official Cultural Citizen Rank & Experience Points Seal */}
                      <div className="p-2.5 bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100/80 rounded-xl border border-amber-300 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{xpData.currentLevel.badgeIcon}</span>
                            <div>
                              <div className="text-[9px] uppercase font-bold text-amber-900 font-mono flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-700" />
                                <span>CULTURAL RANK • LEVEL {xpData.currentLevel.level}</span>
                              </div>
                              <div className="text-xs font-black text-stone-900 flex items-center gap-1">
                                <span>{xpData.currentLevel.title}</span>
                                <span className="text-[10px] font-normal text-amber-800 font-serif">({xpData.currentLevel.hindiTitle})</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold bg-amber-900 text-amber-100 px-2 py-0.5 rounded-full border border-amber-700 shadow-2xs">
                              {xpData.totalXP} XP
                            </span>
                            <div className="text-[8px] font-mono text-amber-900 mt-0.5">
                              {xpData.nextLevel ? `${xpData.xpNeededForNext} XP to Lvl ${xpData.nextLevel.level}` : 'Top Rank'}
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar within Passport Bio Page */}
                        <div className="w-full h-1.5 rounded-full bg-amber-200/80 mt-1.5 overflow-hidden border border-amber-300/60">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-orange-600 rounded-full"
                            style={{ width: `${xpData.progressPercent}%` }}
                          />
                        </div>

                        <div className="mt-1 text-[9px] text-stone-600 font-mono flex items-center justify-between">
                          <span>Memories: {xpData.memoriesSavedCount} (+{xpData.memoriesXP} XP)</span>
                          <span>•</span>
                          <span>Sites: {xpData.sitesVisitedCount} (+{xpData.sitesVisitedXP} XP)</span>
                          <span>•</span>
                          <span>Stamps: {xpData.passportStampsCount} (+{xpData.passportStampsXP} XP)</span>
                        </div>
                      </div>

                      {/* Origin City (KEY REQUIREMENT: Jha se trip start krega) */}
                      <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[9px] uppercase font-extrabold text-amber-900 font-mono flex items-center gap-1">
                              <Compass className="w-3 h-3 text-amber-700" />
                              <span>Trip Origin / प्रस्थान स्थल</span>
                            </div>
                            <div className="text-sm font-black text-amber-950 mt-0.5">
                              {passport.originCity}
                            </div>
                          </div>
                          <button
                            onClick={() => setShowTripSetup(true)}
                            className="text-[10px] text-amber-800 font-bold underline hover:text-amber-950"
                          >
                            Change Origin
                          </button>
                        </div>
                        <div className="text-[10px] text-stone-600 mt-1">
                          Circuit: <strong className="text-stone-800">{passport.circuitName}</strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-[9px] uppercase font-bold text-stone-400 font-mono">Issue Date</div>
                          <div className="font-medium text-stone-800">{passport.issueDate}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase font-bold text-stone-400 font-mono">Validity</div>
                          <div className="font-bold text-emerald-800">LIFETIME BHARAT CITIZEN</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] uppercase font-bold text-stone-400 font-mono">Authority</div>
                        <div className="text-[11px] font-semibold text-stone-800">
                          Aarambh Sanskriti Mission & ASI Heritage Trust
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom MRZ Lines (Machine Readable Zone) */}
                  <div className="border-t-2 border-stone-300 pt-2 font-mono text-[8px] sm:text-[10px] md:text-[11px] text-stone-600 tracking-wider sm:tracking-widest break-all bg-stone-100/60 p-2 rounded-lg leading-tight">
                    P&lt;INDBHARAT&lt;&lt;{(user?.displayName || passport.holderName).replace(/\s+/g, '&lt;').toUpperCase()}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                    <br />
                    {passport.passportNumber.replace(/-/g, '')}7IND2609124M9999999&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02
                  </div>

                  {/* Page 1 Action Strip: Share Achievement & Print */}
                  <div className="pt-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => handleSharePassport()}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Passport Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintSection('printable-passport-booklet', 'portrait', true)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Download / Print Booklet</span>
                    </button>
                  </div>
                </div>
              

              {/* ================= PAGE 2 & 3: VISAS AND STAMPS ================= */}
              
                <div
                  className={`passport-page w-full min-h-[520px] sm:min-h-[580px] bg-[#FAF7F0] text-stone-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-stone-300 flex flex-col justify-between select-none relative overflow-hidden ${(activePage !== 2 && activePage !== 3) ? 'hidden hide-on-print-passport' : ''}`}
                  style={{
                    backgroundImage: `
                      radial-gradient(#c7b299 1px, transparent 1px),
                      repeating-linear-gradient(45deg, rgba(200, 180, 150, 0.05) 0px, rgba(200, 180, 150, 0.05) 20px, transparent 20px, transparent 40px)
                    `,
                    backgroundSize: '20px 20px, 40px 40px',
                  }}
                >
                  {/* Top Visa Page Header */}
                  <div className="border-b border-stone-300 pb-2 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-400">
                        VISAS & HERITAGE ENTRY MUDRAS / वीज़ा पृष्ठ
                      </div>
                      <div className="text-sm font-bold font-royal text-stone-800">
                        {activePage === 2 ? 'PAGE 1 - 2 (NORTH & CENTRAL)' : 'PAGE 3 - 4 (SOUTH & EAST)'}
                      </div>
                    </div>
                    <div className="text-xs font-mono font-bold text-stone-500">
                      PAGE {activePage} OF 4
                    </div>
                  </div>

                  {/* The Stamps Grid (2 rows x 3 cols = 6 slots) */}
                  <div className="my-auto py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 justify-items-center items-center">
                    {(activePage === 2 ? page1Stamps : page2Stamps).map((st) => (
                      <div key={st.id} className="relative">
                        <PassportStampBadge
                          stamp={st}
                          size="sm"
                          isJustStamped={justStampedId === st.id}
                        />
                      </div>
                    ))}

                    {/* Empty Slots waiting to be stamped */}
                    {Array.from({
                      length: Math.max(0, 6 - (activePage === 2 ? page1Stamps.length : page2Stamps.length)),
                    }).map((_, idx) => (
                      <div
                        key={`empty-${idx}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-stone-300/80 flex flex-col items-center justify-center p-2 text-center text-stone-400 group hover:border-amber-400 transition-colors"
                      >
                        <Stamp className="w-5 h-5 text-stone-300 group-hover:text-amber-600 transition-colors mb-1" />
                        <span className="text-[8px] font-mono uppercase font-bold tracking-wider">
                          Awaiting Visit
                        </span>
                        <span className="text-[7px] text-stone-400">
                          Click place on right
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Footer Note */}
                  <div className="border-t border-stone-200 pt-2 flex items-center justify-between text-[10px] font-mono text-stone-500">
                    <span>SEALED BY ASI ARCHIVAL LEDGER</span>
                    <span className="text-amber-800 font-bold">
                      {passport.stamps.length} SITES CERTIFIED
                    </span>
                  </div>
                </div>
              

              {/* ================= PAGE 4: CULTURAL PROGRESSION & XP ROADMAP ================= */}
              
                <div
                  className={`passport-page w-full min-h-[520px] sm:min-h-[580px] bg-white text-stone-900 rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-stone-300 flex flex-col justify-between select-none relative overflow-hidden ${activePage !== 4 ? 'hidden hide-on-print-passport' : ''}`}
                >
                  {/* Top Page Header */}
                  <div className="border-b border-stone-200 pb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>BHARAT CULTURAL CITIZENRY REGISTRY • XP SYSTEM</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold font-royal text-stone-900 flex items-center gap-2">
                        <span>Cultural Ranks & Levels</span>
                        <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          {xpData.totalXP} Total XP
                        </span>
                      </h3>
                    </div>

                    {/* Page 4 Sub-Navigation Pills */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPage4SubTab('levels')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          page4SubTab === 'levels'
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Levels (1-6)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage4SubTab('earn')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          page4SubTab === 'earn'
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Earn XP
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage4SubTab('badges')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          page4SubTab === 'badges'
                            ? 'bg-amber-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Badges
                      </button>
                    </div>
                  </div>

                  {/* SUB-TAB 1: CULTURAL LEVELS (1-6) */}
                  {page4SubTab === 'levels' && (
                    <div className="my-auto py-2 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {/* Active Level Spotlight Banner */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{xpData.currentLevel.badgeIcon}</span>
                          <div>
                            <div className="text-[10px] font-mono uppercase font-bold text-amber-900 flex items-center gap-1">
                              <span>ACTIVE RANK • LEVEL {xpData.currentLevel.level}</span>
                            </div>
                            <div className="text-sm font-black text-stone-900">
                              {xpData.currentLevel.title}{' '}
                              <span className="text-xs font-normal text-amber-800 font-serif">
                                ({xpData.currentLevel.hindiTitle})
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-500 italic mt-0.5">
                              "{xpData.currentLevel.motto}"
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSharePassport()}
                            className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95"
                            title="Share cultural rank and unlocked badges"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowRoadmapModal(true)}
                            className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
                          >
                            <span>XP Dossier</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* The 6 Levels Mini Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {XP_LEVELS.map((tier) => {
                          const isCurrent = xpData.currentLevel.level === tier.level;
                          const isUnlocked = xpData.totalXP >= tier.minXP;
                          const remainingXP = tier.minXP - xpData.totalXP;

                          return (
                            <div
                              key={tier.level}
                              className={`p-2.5 rounded-xl border transition-all ${
                                isCurrent
                                  ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/40 shadow-xs'
                                  : isUnlocked
                                  ? 'bg-stone-50/80 border-stone-200'
                                  : 'bg-stone-50/40 border-stone-200/60 opacity-60'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{tier.badgeIcon}</span>
                                  <div>
                                    <div className="font-bold text-stone-900 text-xs flex items-center gap-1">
                                      <span>Lvl {tier.level}: {tier.title}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-amber-800 font-semibold">
                                      {tier.minXP}{tier.maxXP < 99999 ? ` - ${tier.maxXP}` : '+'} XP
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  {isCurrent ? (
                                    <span className="text-[9px] font-mono font-bold bg-amber-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                      Current
                                    </span>
                                  ) : isUnlocked ? (
                                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" /> Done
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-stone-400 flex items-center gap-0.5">
                                      <Lock className="w-2.5 h-2.5" /> -{remainingXP} XP
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-[10px] text-stone-500 mt-1.5 truncate">
                                🎁 {tier.perks[0]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: HOW TO EARN XP (MEMORIES & SITES) */}
                  {page4SubTab === 'earn' && (
                    <div className="my-auto py-2 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* 1. Save Memories */}
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg">📝</span>
                              <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                                +150 XP / memory
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-stone-900 mt-1">Preserve Living Memories</h4>
                            <p className="text-[10px] text-stone-600 mt-0.5">
                              Record community oral stories, family folklore, or artisan crafts.
                            </p>
                            <div className="text-[10px] font-mono text-stone-500 mt-1">
                              Saved: <strong className="text-amber-900">{xpData.memoriesSavedCount}</strong> (+{xpData.memoriesXP} XP)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenSaveMemory) onOpenSaveMemory();
                              else if (onNavigateTab) onNavigateTab('memory');
                            }}
                            className="w-full py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Preserve Memory (+150 XP)</span>
                          </button>
                        </div>

                        {/* 2. Visit Heritage Sites */}
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg">🏛️</span>
                              <span className="text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                                +100 XP / site
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-stone-900 mt-1">Visit Heritage Sanctuaries</h4>
                            <p className="text-[10px] text-stone-600 mt-0.5">
                              Mark ancient temples, stepwells, forts, and UNESCO landmarks visited.
                            </p>
                            <div className="text-[10px] font-mono text-stone-500 mt-1">
                              Visited: <strong className="text-emerald-900">{xpData.sitesVisitedCount}</strong> (+{xpData.sitesVisitedXP} XP)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowVisitedSitesModal(true)}
                            className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Visited Sites (+100 XP)</span>
                          </button>
                        </div>

                        {/* 3. Collect Mudra Seals */}
                        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg">🛂</span>
                              <span className="text-[10px] font-mono font-bold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-md">
                                +80 XP / stamp
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-stone-900 mt-1">Stamp Passport Visas</h4>
                            <p className="text-[10px] text-stone-600 mt-0.5">
                              Collect official ASI archival entry mudras across north, south, and central circuits.
                            </p>
                            <div className="text-[10px] font-mono text-stone-500 mt-1">
                              Stamped: <strong className="text-blue-900">{xpData.passportStampsCount}</strong> (+{xpData.passportStampsXP} XP)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handlePageChange(2)}
                            className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Stamp className="w-3 h-3" />
                            <span>Open Stamping Desk</span>
                          </button>
                        </div>

                        {/* 4. Camera Monument Scans */}
                        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-col justify-between space-y-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-lg">📷</span>
                              <span className="text-[10px] font-mono font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-md">
                                +75 XP / scan
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-stone-900 mt-1">Optical Camera Scanner</h4>
                            <p className="text-[10px] text-stone-600 mt-0.5">
                              Point camera at any monument for instant neural identification and oral history.
                            </p>
                            <div className="text-[10px] font-mono text-stone-500 mt-1">
                              Scans: <strong className="text-purple-900">{xpData.monumentsScannedCount}</strong> (+{xpData.monumentsScannedXP} XP)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onNavigateTab ? onNavigateTab('scanner') : null}
                            className="w-full py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Launch Scanner (+75 XP)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: PILGRIM BADGES */}
                  {page4SubTab === 'badges' && (
                    <div className="grid grid-cols-2 gap-2.5 my-auto py-2 max-h-[380px] overflow-y-auto pr-1">
                      {[
                        {
                          title: 'Ghat Pilgrim',
                          desc: 'Visit sacred Ganga / Yamuna Ghats',
                          unlocked: passport.stamps.some((s) => s.city.includes('Varanasi')) || visitedSites.some((s) => s.id.includes('varanasi') && s.visited),
                          icon: '🪔',
                        },
                        {
                          title: 'Fortress Explorer',
                          desc: 'Stamp or visit 1 Royal Citadel',
                          unlocked: passport.stamps.some((s) => s.city.includes('Jaipur') || s.state.includes('Rajasthan')) || visitedSites.some((s) => s.id.includes('amber') && s.visited),
                          icon: '🏰',
                        },
                        {
                          title: 'Chola & Vijayanagara',
                          desc: 'Preserve ancient Deccan empires',
                          unlocked: passport.stamps.some((s) => s.city.includes('Hampi') || s.state.includes('Tamil Nadu')) || visitedSites.some((s) => s.id.includes('hampi') && s.visited),
                          icon: '🏛️',
                        },
                        {
                          title: 'Subterranean Master',
                          desc: 'Explore historical stepwell marvels',
                          unlocked: passport.stamps.some((s) => s.id.includes('stepwell') || s.id.includes('vav')) || visitedSites.some((s) => s.id.includes('vav') && s.visited),
                          icon: '🌊',
                        },
                        {
                          title: 'Himalayan Devbhumi',
                          desc: 'Pilgrimage to sacred Char Dham',
                          unlocked: passport.stamps.some((s) => s.state.includes('Uttarakhand')) || visitedSites.some((s) => s.id.includes('kedarnath') && s.visited),
                          icon: '🏔️',
                        },
                        {
                          title: 'Maha Yatri Club',
                          desc: 'Collect 5+ official mudras & sites',
                          unlocked: (passport.stamps.length + visitedSites.filter((s) => s.visited).length) >= 5,
                          icon: '👑',
                        },
                      ].map((badge, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                            badge.unlocked
                              ? 'bg-amber-50/70 border-amber-300 text-stone-900 shadow-2xs'
                              : 'bg-stone-50 border-stone-200 opacity-50'
                          }`}
                        >
                          <div className="text-xl">{badge.icon}</div>
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1">
                              {badge.title}
                              {badge.unlocked && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            </div>
                            <div className="text-[10px] text-stone-500 leading-tight mt-0.5">{badge.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bottom Security Footer */}
                  <div className="border-t border-stone-200 pt-2 flex items-center justify-between text-[10px] font-mono text-stone-500">
                    <span>SEALED BY ASI ARCHIVAL LEDGER</span>
                    <button
                      type="button"
                      onClick={() => setShowRoadmapModal(true)}
                      className="text-amber-800 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>Ascend Ranks • View Full Dossier</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              

              {/* BOOKLET CONTROLS (PREV / NEXT PAGE) */}
              <div className="flex items-center justify-between mt-4 w-full px-2">
                <button
                  onClick={() => handlePageChange(Math.max(0, activePage - 1))}
                  disabled={activePage === 0}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 disabled:opacity-30 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Previous Page
                </button>

                <div className="text-xs font-mono text-stone-600">
                  Page {activePage} of 4
                </div>

                <button
                  onClick={() => handlePageChange(Math.min(4, activePage + 1))}
                  disabled={activePage === 4}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 disabled:opacity-30 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 flex items-center gap-1 cursor-pointer"
                >
                  Next Page <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: DESTINATION STAMPING DRAWER (SPAN 5) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold font-royal text-stone-900 flex items-center gap-2">
                    <Stamp className="w-4 h-4 text-amber-700" />
                    <span>Stamp Visited Places</span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Click any place below to apply its official rubber ink seal
                  </p>
                </div>

                <button
                  onClick={() => setShowCustomStampModal(true)}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-bold text-stone-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom Place</span>
                </button>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search landmark, city, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Stamping Directory List */}
              <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                {filteredDestinations.map((dest) => {
                  const isStamped = passport.stamps.some((s) => s.id === dest.id);

                  return (
                    <div
                      key={dest.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isStamped
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-stone-50/70 border-stone-200 hover:bg-amber-50/50 hover:border-amber-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{dest.iconSymbol}</span>
                          <span className="font-bold text-xs text-stone-900 truncate">
                            {dest.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">{dest.city}, {dest.state}</span>
                          <span className="text-stone-300">•</span>
                          <span className="font-mono text-stone-400">{dest.epoch}</span>
                        </div>
                      </div>

                      {isStamped ? (
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Stamped
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStampPlace(dest)}
                          className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <Stamp className="w-3 h-3 text-amber-200" />
                          <span>Stamp</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

              {/* Trip Planner Bridge Card */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-2xl border border-amber-200 space-y-2">
                <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-amber-800" />
                  <span>Planning a live trip right now?</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Head over to the Trip Planner to customize your travel route, check real IRCTC trains, and auto-sync your itinerary into your passport!
                </p>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('plan-trip')}
                    className="mt-1 text-xs font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Connected Trip Planner</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: START NEW TRIP / ORIGIN SETUP ================= */}
      {showTripSetup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-2xl space-y-5 animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Yatra Initiation
              </span>
              <h3 className="text-xl font-bold font-royal text-stone-900">
                Start Trip & Issue Passport
              </h3>
              <p className="text-xs text-stone-500">
                Where will your pilgrimage or heritage journey begin? We will stamp your starting origin into your digital passport.
              </p>
            </div>

            <form onSubmit={handleStartNewTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Starting City / Origin (प्रस्थान नगर) *
                </label>
                <input
                  type="text"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="e.g. New Delhi, Varanasi, Jaipur, etc."
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Quick Pick Chips */}
              <div>
                <div className="text-[11px] font-semibold text-stone-500 mb-1.5">Popular Starting Points:</div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_ORIGIN_CITIES.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setNewOrigin(city)}
                      className={`px-2 py-0.5 rounded-md text-xs transition-colors cursor-pointer ${
                        newOrigin === city
                          ? 'bg-amber-700 text-white font-bold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Target Destination or Circuit Name
                </label>
                <input
                  type="text"
                  value={newCircuit}
                  onChange={(e) => setNewCircuit(e.target.value)}
                  placeholder="e.g. Kashi Vishwanath & Sacred Ghats"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTripSetup(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Issue Passport & Stamp Origin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD CUSTOM STAMP ================= */}
      {showCustomStampModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-2xl space-y-5 animate-fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Explorer Discovery
              </span>
              <h3 className="text-xl font-bold font-royal text-stone-900">
                Stamp a Custom Monument or Temple
              </h3>
              <p className="text-xs text-stone-500">
                Did you visit an ancient stepwell, village shrine, or regional fort? Add it to your passport with a custom ink color!
              </p>
            </div>

            <form onSubmit={handleAddCustomStamp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Monument / Landmark Name *</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sanchi Stupa, Golconda Fort"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">City / Region *</label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="e.g. Hyderabad, Sanchi, Thanjavur"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Stamp Ink Color</label>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'crimson', bg: 'bg-red-700', label: 'Crimson' },
                    { id: 'indigo', bg: 'bg-blue-900', label: 'Indigo' },
                    { id: 'emerald', bg: 'bg-emerald-700', label: 'Emerald' },
                    { id: 'ochre', bg: 'bg-amber-700', label: 'Ochre' },
                    { id: 'purple', bg: 'bg-purple-800', label: 'Purple' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setCustomColor(color.id as StampInkColor)}
                      className={`w-7 h-7 rounded-full ${color.bg} transition-all cursor-pointer ${
                        customColor === color.id
                          ? 'ring-4 ring-amber-300 scale-110'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomStampModal(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Apply Custom Mudra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: LEVEL UP CELEBRATION MODAL ================= */}
      {showLevelUpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-amber-400 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden">
            {/* Background Aura */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-mono font-bold tracking-widest uppercase">
                ★ CULTURAL ELEVATION ACHIEVED ★
              </span>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-orange-500/30 border-2 border-amber-200 mt-3 animate-bounce">
                {xpData.currentLevel.badgeIcon}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-royal text-white pt-2">
                Level {xpData.currentLevel.level}: {xpData.currentLevel.title}
              </h3>
              <div className="text-sm font-serif font-bold text-amber-300">
                {xpData.currentLevel.hindiTitle}
              </div>
              <p className="text-xs text-stone-300 italic max-w-md mx-auto">
                "{xpData.currentLevel.motto}"
              </p>
            </div>

            {/* Unlocked Privileges */}
            <div className="relative z-10 bg-stone-950/70 rounded-2xl p-4 border border-stone-800 text-left space-y-2.5">
              <div className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Newly Unlocked Heritage Privileges:</span>
              </div>
              <div className="space-y-1.5">
                {xpData.currentLevel.perks.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-stone-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleSharePassport({
                    title: `🏆 Cultural Elevation Achieved: Level ${xpData.currentLevel.level} • ${xpData.currentLevel.title}!`,
                    text: `🎉 I have officially achieved Level ${xpData.currentLevel.level} (${xpData.currentLevel.title} • ${xpData.currentLevel.hindiTitle}) on the Aarambh Digital Yatra Passport!\n\n"${xpData.currentLevel.motto}"\n\n✨ Total XP: ${xpData.totalXP} | Visited Sites: ${xpData.sitesVisitedCount} | Stamps: ${xpData.passportStampsCount}\n\nJoin me in exploring and preserving India's living cultural legacy:`,
                  });
                }}
                className="w-full sm:w-1/2 py-3 bg-stone-950 hover:bg-stone-850 text-amber-300 border border-amber-400 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Share Elevation</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLevelUpModal(false)}
                className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black rounded-xl text-xs sm:text-sm shadow-lg transition-all cursor-pointer active:scale-95"
              >
                Claim & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: FULL CULTURAL LEVELS DOSSIER & ROADMAP ================= */}
      {showRoadmapModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Official Progression Engine
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {xpData.totalXP} Accumulated XP
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-royal text-white flex items-center gap-2">
                  <Award className="w-6 h-6 text-amber-400" />
                  <span>Cultural Citizen Levels & Perks</span>
                </h3>
                <p className="text-xs text-stone-300 font-light max-w-xl">
                  Earn XP by preserving living memories, visiting historical sites, stamping entry mudras, and scanning monuments. Ascend through 6 sacred tiers of heritage stewardship.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRoadmapModal(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-amber-50 p-3 sm:px-6 border-b border-amber-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-700" />
                <span>Quick Ways to Earn XP Right Now:</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoadmapModal(false);
                    if (onOpenSaveMemory) onOpenSaveMemory();
                    else if (onNavigateTab) onNavigateTab('memory');
                  }}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Save Memory (+150 XP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRoadmapModal(false);
                    setShowVisitedSitesModal(true);
                  }}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Mark Site Visited (+100 XP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowRoadmapModal(false);
                    if (onNavigateTab) onNavigateTab('scanner');
                  }}
                  className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Scan Monument (+75 XP)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSharePassport();
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share Status</span>
                </button>
              </div>
            </div>

            {/* Scrollable Levels List */}
            <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
              {XP_LEVELS.map((tier) => {
                const isCurrent = xpData.currentLevel.level === tier.level;
                const isUnlocked = xpData.totalXP >= tier.minXP;
                const remainingXP = tier.minXP - xpData.totalXP;

                return (
                  <div
                    key={tier.level}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-md'
                        : isUnlocked
                        ? 'bg-stone-50 border-stone-200'
                        : 'bg-stone-50/50 border-stone-200/80 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border shrink-0 ${
                            isCurrent
                              ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300'
                              : isUnlocked
                              ? 'bg-stone-200 border-stone-300'
                              : 'bg-stone-100 border-stone-200 opacity-60'
                          }`}
                        >
                          {tier.badgeIcon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                              LEVEL {tier.level}
                            </span>
                            <span className="text-xs font-mono font-bold text-stone-500">
                              {tier.minXP}{tier.maxXP < 99999 ? ` - ${tier.maxXP}` : '+'} XP
                            </span>
                          </div>
                          <h4 className="text-base font-bold font-royal text-stone-900 mt-0.5 flex items-center gap-2">
                            <span>{tier.title}</span>
                            <span className="text-xs font-normal text-amber-800 font-serif">
                              ({tier.hindiTitle})
                            </span>
                          </h4>
                          <p className="text-[11px] text-stone-500 italic">
                            "{tier.motto}"
                          </p>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="self-start sm:self-auto shrink-0">
                        {isCurrent ? (
                          <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-mono font-bold shadow-xs flex items-center gap-1.5 animate-pulse">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>ACTIVE RANK</span>
                          </span>
                        ) : isUnlocked ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>UNLOCKED</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-stone-200 text-stone-600 text-xs font-mono font-bold flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5 text-stone-500" />
                            <span>LOCKED ({remainingXP} XP needed)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Perks */}
                    <div className="mt-3 pt-3 border-t border-stone-200/80 space-y-1">
                      <div className="text-[10px] font-mono uppercase font-bold text-stone-500">
                        Unlocked Privileges & Features:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {tier.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-stone-700">
                            <CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
              <span>Points rate: Memories (+150 XP), Visits (+100 XP), Stamps (+80 XP), Camera Scans (+75 XP)</span>
              <button
                type="button"
                onClick={() => setShowRoadmapModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: HERITAGE SITES VISIT CHECKLIST MODAL ================= */}
      {showVisitedSitesModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-stone-200 shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Experience Points Multiplier
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    +100 XP Per Visited Site
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-royal text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span>Heritage Sites Visit Checklist</span>
                </h3>
                <p className="text-xs text-emerald-100 font-light">
                  Have you stood in these ancient monuments? Check them off to instantly earn +100 XP and elevate your cultural rank.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowVisitedSitesModal(false)}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sites Stats & Search Filter */}
            <div className="p-4 bg-emerald-50/70 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-stone-700">
                Sites Visited:{' '}
                <strong className="text-emerald-900 font-bold">
                  {visitedSites.filter((s) => s.visited).length}
                </strong>{' '}
                of {visitedSites.length} •{' '}
                <span className="text-emerald-800 font-mono font-bold">
                  +{visitedSites.filter((s) => s.visited).length * XP_RATES.SITE_VISITED} XP Earned
                </span>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter site, state, temple..."
                  value={siteSearchQuery}
                  onChange={(e) => setSiteSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Scrollable Sites Checklist */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-2 flex-1">
              {visitedSites
                .filter(
                  (site) =>
                    site.name.toLowerCase().includes(siteSearchQuery.toLowerCase()) ||
                    site.state.toLowerCase().includes(siteSearchQuery.toLowerCase()) ||
                    site.category.toLowerCase().includes(siteSearchQuery.toLowerCase())
                )
                .map((site) => {
                  return (
                    <div
                      key={site.id}
                      onClick={() => handleToggleSiteVisit(site.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                        site.visited
                          ? 'bg-emerald-50/80 border-emerald-300 hover:bg-emerald-100/70'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            site.visited
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {site.visited && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="space-y-0.5 min-w-0">
                          <div className="font-bold text-xs text-stone-900 truncate flex items-center gap-1.5">
                            <span>{site.name}</span>
                            <span className="text-[10px] font-mono font-normal text-stone-500 uppercase px-1.5 py-0.2 rounded bg-stone-200/60">
                              {site.category}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span className="truncate">{site.state}</span>
                            {site.visitedDate && (
                              <>
                                <span className="text-stone-300">•</span>
                                <span className="font-mono text-emerald-800 font-semibold">
                                  Visited on {site.visitedDate}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {site.visited ? (
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            +100 XP
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-400 group-hover:text-stone-600">
                            +100 XP
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Add Custom Visited Site Section */}
              <div className="pt-4 mt-4 border-t border-stone-200 space-y-2">
                <div className="text-xs font-bold text-stone-800 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Add Another Heritage Site You Visited</span>
                </div>
                <form onSubmit={handleAddCustomSite} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Site name (e.g. Sanchi Stupa, Meenakshi Temple)"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State / Region"
                    value={newSiteState}
                    onChange={(e) => setNewSiteState(e.target.value)}
                    className="w-32 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    Add (+100 XP)
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
              <span>Checking or adding a site immediately syncs with your Digital Passport and XP level</span>
              <button
                type="button"
                onClick={() => setShowVisitedSitesModal(false)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SOCIAL SHARE MODAL ================= */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        payload={sharePayload}
        badgeType="passport"
        subtitle="Broadcast your verified cultural rank, mudras & badges"
      />
    </div>
  );
};
