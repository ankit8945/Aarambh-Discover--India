import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import { LocationMetadata, HeritageData } from '../types';
import { fetchCompleteHeritage } from '../services/api';
import { UniversalSearch } from '../components/UniversalSearch';
import { MapView } from '../components/MapView';
import { CulturalGraph } from '../components/CulturalGraph';
import { TalkToPastModal } from '../components/TalkToPastModal';
import { CommentSection } from '../components/CommentSection';
import { DownloadMemoryCardModal } from '../components/DownloadMemoryCardModal';
import { NearbyTravelersRadar } from '../components/NearbyTravelersRadar';
import { FairPriceTransitGuide } from '../components/FairPriceTransitGuide';
import { LocalMarketplace } from '../components/LocalMarketplace';
import { DailyCulturalQuizPoll } from '../components/DailyCulturalQuizPoll';
import { SocialShareModal } from '../components/SocialShareModal';
import { executeWebShare, isWebShareSupported, SharePayload } from '../utils/socialShare';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  MessageSquare,
  Camera,
  Bookmark,
  ShieldCheck,
  Utensils,
  Languages,
  Footprints,
  Info,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Download,
  Landmark,
  Hammer,
  BookOpen,
  Sun,
  AlertTriangle,
  Heart,
  Search,
  Check,
  ChevronRight,
  Eye,
  Share2,
} from 'lucide-react';

interface ExploreViewProps {
  initialPlace?: string;
  onOpenSaveMemory: (placeName?: string, lat?: number, lon?: number, address?: string) => void;
  onSaveItineraryStop: (stop: { title: string; location: string; day: number }) => void;
  onNavigateTab?: (tab: string) => void;
}

// Curated high-res imagery for pictorial discovery
const FEATURED_HERITAGE_PLACES = [
  {
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    image: '/images/monuments/varanasi-ghats.jpg',
    tag: 'Living Ghats & Sacred Silk Weaves',
    epoch: '11th Century BCE',
  },
  {
    name: 'Hampi',
    state: 'Karnataka',
    image: '/images/monuments/hampi-monuments.jpg',
    tag: 'Vijayanagara Stone Monoliths',
    epoch: '14th Century CE',
  },
  {
    name: 'Amber Fort',
    state: 'Jaipur, Rajasthan',
    image: '/images/monuments/amber-fort.jpg',
    tag: 'Sheesh Mahal & Hilltop Bastion',
    epoch: '16th Century CE',
  },
  {
    name: 'Rani ki Vav',
    state: 'Patan, Gujarat',
    image: '/images/monuments/rani-ki-vav.jpg',
    tag: 'Inverted Subterranean Stepwell',
    epoch: '11th Century CE',
  },
  {
    name: 'Konark Sun Temple',
    state: 'Odisha',
    image: '/images/monuments/konark-sun-temple.jpg',
    tag: 'Sun Chariot Wheels & Kalinga Masonry',
    epoch: '13th Century CE',
  },
  {
    name: 'Thanjavur',
    state: 'Tamil Nadu',
    image: '/images/monuments/brihadisvara-temple.jpg',
    tag: 'Brihadisvara Granite Vimana',
    epoch: '1010 CE',
  },
];

const LIVING_CRAFTS_PICTORIAL = [
  {
    name: 'Pattachitra Painting',
    place: 'Raghurajpur, Odisha',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Pattachitra_Painting_%2817042344385%29.jpg/960px-Pattachitra_Painting_%2817042344385%29.jpg',
    craftsman: 'Master Chitrakar Guilds',
    tag: 'Palm-Leaf Inscription',
  },
  {
    name: 'Rogan Art',
    place: 'Nirona, Kutch, Gujarat',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Rogan-art-Tree-of-Life-Abdul-Gafur-Khatri-29-12-2013.jpg/960px-Rogan-art-Tree-of-Life-Abdul-Gafur-Khatri-29-12-2013.jpg',
    craftsman: 'Khatri Family Heritage',
    tag: 'Castor Oil Paint Stylus',
  },
  {
    name: 'Bidriware Silver Inlay',
    place: 'Bidar, Karnataka',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Bidriware_Hookah.jpg/960px-Bidriware_Hookah.jpg',
    craftsman: 'Zinc & Silver Masters',
    tag: 'Soil Oxidation Finish',
  },
  {
    name: 'Chanderi Weaving',
    place: 'Madhya Pradesh',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Chanderi_saree.webp',
    craftsman: 'Handloom Weaver Clusters',
    tag: 'Zari Silk Weft',
  },
];

const HEIRLOOM_FOOD_PICTORIAL = [
  {
    name: 'Banarasi Paan & Thandai',
    place: 'Varanasi',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Banarasi_Ice_Paan_-_Kolkata_2016-02-02_0449.JPG/960px-Banarasi_Ice_Paan_-_Kolkata_2016-02-02_0449.JPG',
    season: 'Spring / Summer Rhythms',
    tag: 'Digestive Herb Tradition',
  },
  {
    name: 'Dal Baati Churma',
    place: 'Rajasthan',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f0/Dal_Baati_Churma.jpg/960px-Dal_Baati_Churma.jpg',
    season: 'Desert Harvest & Ghee',
    tag: 'Slow Cow-Dung Bati Roast',
  },
  {
    name: 'Puri Mahaprasad (Chhappan Bhog)',
    place: 'Puri, Odisha',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Jaganath_Temple_11d_-_Mahaprasad_%2826670020006%29.jpg/960px-Jaganath_Temple_11d_-_Mahaprasad_%2826670020006%29.jpg',
    season: 'Sacred Temple Hearth',
    tag: 'Clay-Pot Steaming',
  },
  {
    name: 'Filter Coffee & Neer Dosa',
    place: 'Udupi / Madikeri',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Indian_filter_coffee_in_Dabarah.jpg',
    season: 'Western Ghats Harvest',
    tag: 'Brass Dabarah Brew',
  },
];

const getPlaceFallbackImage = (placeName: string): string => {
  const norm = (placeName || '').toLowerCase();
  if (norm.includes('varanasi') || norm.includes('kashi') || norm.includes('banaras') || norm.includes('assi')) {
    return '/images/monuments/varanasi-ghats.jpg';
  }
  if (norm.includes('hampi')) {
    return '/images/monuments/hampi-monuments.jpg';
  }
  if (norm.includes('amber') || norm.includes('amer')) {
    return '/images/monuments/amber-fort.jpg';
  }
  if (norm.includes('hawa mahal') || norm.includes('jaipur')) {
    return '/images/monuments/hawa-mahal.jpg';
  }
  if (norm.includes('rani') || norm.includes('patan') || norm.includes('vav')) {
    return '/images/monuments/rani-ki-vav.jpg';
  }
  if (norm.includes('konark')) {
    return '/images/monuments/konark-sun-temple.jpg';
  }
  if (norm.includes('thanjavur') || norm.includes('brihadisvara')) {
    return '/images/monuments/brihadisvara-temple.jpg';
  }
  if (norm.includes('pune') || norm.includes('shaniwar') || norm.includes('sinhagad')) {
    return '/images/monuments/shaniwar-wada.jpg';
  }
  if (norm.includes('bastar') || norm.includes('jagdalpur') || norm.includes('chitrakot')) {
    return '/images/monuments/chitrakote-falls.jpg';
  }
  if (norm.includes('lucknow') || norm.includes('rumi') || norm.includes('imambara')) {
    return '/images/monuments/rumi-darwaza.jpg';
  }
  if (norm.includes('mysore') || norm.includes('mysuru')) {
    return '/images/monuments/mysore-palace.jpg';
  }
  if (norm.includes('kolkata') || norm.includes('calcutta') || norm.includes('howrah') || norm.includes('victoria')) {
    return '/images/monuments/victoria-memorial.jpg';
  }
  if (norm.includes('kedarnath')) {
    return '/images/epuja/kedarnath-dham.jpg';
  }
  if (norm.includes('badrinath')) {
    return '/images/epuja/badrinath-dham.jpg';
  }
  if (norm.includes('amritsar') || norm.includes('golden temple') || norm.includes('harmandir')) {
    return '/images/epuja/golden-temple.jpg';
  }
  if (norm.includes('khajuraho')) {
    return '/images/monuments/khajuraho.jpg';
  }
  if (norm.includes('ellora') || norm.includes('kailasa')) {
    return '/images/monuments/ellora-kailasa.jpg';
  }
  if (norm.includes('ajanta')) {
    return '/images/monuments/ajanta-caves.jpg';
  }
  if (norm.includes('elephanta')) {
    return '/images/monuments/elephanta-caves.jpg';
  }
  if (norm.includes('delhi') || norm.includes('qutb') || norm.includes('red fort')) {
    return '/images/monuments/red-fort-delhi.jpg';
  }
  if (norm.includes('agra') || norm.includes('taj mahal')) {
    return '/images/monuments/taj-mahal.jpg';
  }
  if (norm.includes('fatehpur')) {
    return '/images/monuments/fatehpur-sikri.jpg';
  }
  if (norm.includes('ujjain') || norm.includes('mahakaleshwar')) {
    return '/images/epuja/mahakaleshwar-ujjain.jpg';
  }
  if (norm.includes('tirupati') || norm.includes('balaji')) {
    return '/images/epuja/tirupati-balaji.jpg';
  }
  if (norm.includes('somnath')) {
    return '/images/epuja/somnath-mahadev-temple.jpg';
  }
  if (norm.includes('madurai') || norm.includes('meenakshi')) {
    return '/images/epuja/meenakshi-amman.jpg';
  }
  if (norm.includes('puri') || norm.includes('jagannath')) {
    return '/images/epuja/rath-yatra.jpg';
  }
  if (norm.includes('rameswaram') || norm.includes('rameshwaram')) {
    return '/images/epuja/rameswaram-ramanathaswamy.jpg';
  }
  if (norm.includes('siddhivinayak') || norm.includes('mumbai')) {
    return '/images/epuja/siddhivinayak-mumbai.jpg';
  }
  if (norm.includes('vaishno')) {
    return '/images/epuja/vaishno-devi.jpg';
  }
  if (norm.includes('kamakhya') || norm.includes('assam') || norm.includes('guwahati')) {
    return '/images/monuments/kamakhya-temple.jpg';
  }
  if (norm.includes('bodh gaya') || norm.includes('mahabodhi')) {
    return '/images/monuments/mahabodhi-temple.jpg';
  }
  if (norm.includes('nalanda')) {
    return '/images/monuments/nalanda-university.jpg';
  }
  if (norm.includes('sanchi')) {
    return '/images/monuments/sanchi-stupa.jpg';
  }
  if (norm.includes('bhimbetka')) {
    return '/images/monuments/bhimbetka-rock-shelters.jpg';
  }
  if (norm.includes('gwalior')) {
    return '/images/monuments/gwalior-fort.jpg';
  }
  if (norm.includes('mahabalipuram') || norm.includes('mamallapuram')) {
    return '/images/monuments/mahabalipuram.jpg';
  }
  if (norm.includes('chittorgarh') || norm.includes('chittor')) {
    return '/images/monuments/chittorgarh-fort.jpg';
  }
  if (norm.includes('kumbhalgarh')) {
    return '/images/monuments/kumbhalgarh-fort.jpg';
  }
  if (norm.includes('jodhpur') || norm.includes('mehrangarh')) {
    return '/images/monuments/mehrangarh-fort.jpg';
  }
  if (norm.includes('modhera')) {
    return '/images/monuments/modhera-sun-temple.jpg';
  }
  if (norm.includes('champaner')) {
    return '/images/monuments/champaner-pavagadh.jpg';
  }
  if (norm.includes('padmanabhaswamy') || norm.includes('kerala')) {
    return '/images/monuments/padmanabhaswamy-temple.jpg';
  }
  if (norm.includes('golconda') || norm.includes('hyderabad')) {
    return '/images/monuments/golconda-fort.jpg';
  }
  if (norm.includes('ramappa') || norm.includes('telangana')) {
    return '/images/monuments/ramappa-temple.jpg';
  }
  if (norm.includes('sarnath')) {
    return '/images/monuments/sarnath-dhamek.jpg';
  }
  if (norm.includes('unakoti') || norm.includes('tripura')) {
    return '/images/monuments/unakoti-rock-reliefs.jpg';
  }
  if (norm.includes('bishnupur')) {
    return '/images/monuments/bishnupur-temples.jpg';
  }
  if (norm.includes('chand baori') || norm.includes('abhaneri')) {
    return '/images/monuments/chand-baori.jpg';
  }
  return '/images/monuments/varanasi-ghats.jpg';
};

export const ExploreView: React.FC<ExploreViewProps> = ({
  initialPlace,
  onOpenSaveMemory,
  onSaveItineraryStop,
  onNavigateTab,
}) => {
  const { language } = useAuth();
  const langCode = (language || 'EN').substring(0, 2).toUpperCase();

  const [heritageData, setHeritageData] = useState<HeritageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [talkToPastOpen, setTalkToPastOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [activeCrowdTab, setActiveCrowdTab] = useState<'radar' | 'fares' | 'bazaar' | null>('radar');

  // Social Share State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);

  const handleSharePlace = async () => {
    if (!heritageData) return;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://aarambh.heritage.in';
    const placeAddr = heritageData.location?.formattedAddress || `${heritageData.placeName}, India`;
    const payload: SharePayload = {
      title: `Discover ${heritageData.placeName} • Living Heritage of Bharat`,
      text: `🏛️ Explore ${heritageData.placeName} (${placeAddr}) on Aarambh!\n\n${heritageData.tagline || heritageData.overview?.slice(0, 180)}...\n\nDiscover timeless oral histories, 3D darshan, and artisan crafts:`,
      url: currentUrl,
      imageUrl: heritageData.imageUrls?.[0],
    };

    if (isWebShareSupported()) {
      try {
        const res = await executeWebShare(payload);
        if (res.success && res.method === 'native') {
          return;
        }
      } catch (e) {
        console.warn('Web Share failed, opening modal:', e);
      }
    }
    setSharePayload(payload);
    setShareModalOpen(true);
  };

  // Section quick scroll
  const sectionsRef = {
    overview: useRef<HTMLDivElement>(null),
    history: useRef<HTMLDivElement>(null),
    crafts: useRef<HTMLDivElement>(null),
    food: useRef<HTMLDivElement>(null),
    graph: useRef<HTMLDivElement>(null),
    map: useRef<HTMLDivElement>(null),
    safety: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (section: keyof typeof sectionsRef) => {
    sectionsRef[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Load place by name or coordinates
  const loadPlaceData = async (
    placeName: string,
    lat?: number,
    lon?: number,
    state?: string,
    district?: string,
    formattedAddress?: string
  ) => {
    setLoading(true);
    setError(null);
    
    // Automatically scroll down to the loading/search area as soon as search begins
    setTimeout(() => {
      document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    try {
      const data = await fetchCompleteHeritage(
        placeName,
        lat,
        lon,
        state,
        district,
        formattedAddress
      );
      setHeritageData(data);
      // Scroll smoothly down to the loaded place details
      setTimeout(() => {
        sectionsRef.overview.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve location heritage data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPlace) {
      loadPlaceData(initialPlace);
    } else {
      setHeritageData(null);
    }
  }, [initialPlace]);

  const handleSelectLocation = (loc: LocationMetadata) => {
    loadPlaceData(
      loc.placeName,
      loc.lat,
      loc.lon,
      loc.state,
      loc.district,
      loc.formattedAddress
    );
  };

  const handleSaveCurrentToItinerary = () => {
    if (!heritageData) return;
    onSaveItineraryStop({
      title: `${heritageData.placeName} Cultural Heritage Tour`,
      location: heritageData.location.formattedAddress,
      day: 1,
    });
    setSavedSuccessMessage(`Added ${heritageData.placeName} to your itinerary!`);
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  return (
    <div className="bg-white text-stone-900 min-h-screen pb-24">
      {/* 1. EDITORIAL HERO SECTION - CLEAN, SPACIOUS, HIGH-CONTRAST */}
      <section className="relative w-full overflow-hidden bg-[#121110] text-white min-h-[520px] flex items-center">
        {/* Architectural Crisp Backdrop with Lower Brightness (No blur) */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/monuments/amber-fort.jpg"
            alt="Amber Fort Heritage India"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=2000&q=85';
            }}
            className="w-full h-full object-cover object-center opacity-40 filter contrast-110 brightness-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/70 to-[#121110]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full space-y-6">
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[#E2B16B]">
              {getTranslation('heroEyebrow', langCode)}
            </span>
            <span className="text-stone-500">•</span>
            <span className="text-xs sm:text-sm font-devanagari text-amber-300">
              अतिथिदेवो भव
            </span>
          </div>

          {/* Main Title - Large, Dignified Typography */}
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-royal tracking-tight text-white leading-tight">
              {getTranslation('discoverIndia', langCode)}
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-royal italic font-normal text-[#E2B16B] leading-tight">
              {getTranslation('beyondPlaces', langCode)}
            </h2>
          </div>

          {/* Subtitle - Matching user screenshot */}
          <p className="text-base sm:text-lg md:text-xl text-stone-300 font-light max-w-2xl leading-relaxed">
            {langCode === 'EN'
              ? 'Explore the stories, traditions, food, crafts and living culture that make every destination unique.'
              : getTranslation('heroSubtitle', langCode)}
          </p>

          {/* Action buttons - Sleek black & white pills matching user screenshot */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button type="button"
              onClick={() => {
                const el = document.getElementById('search-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3 rounded-full bg-[#121110] hover:bg-black text-white text-sm sm:text-base font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 border border-white/10 active:scale-95"
            >
              <span>Explore India →</span>
            </button>

            <button type="button"
              onClick={() => onNavigateTab && onNavigateTab('plan-trip')}
              className="px-7 py-3 rounded-full bg-white hover:bg-stone-100 text-stone-950 text-sm sm:text-base font-semibold shadow-md transition-all cursor-pointer active:scale-95"
            >
              {getTranslation('planMyJourneyBtn', langCode) || 'Plan My Journey'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. ELEVATED FLOATING UNIVERSAL SEARCH BAR - CLEAN & UNCLUTTERED */}
      <section id="search-anchor" className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 -mt-10">
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-2xl shadow-stone-900/10 space-y-4">
          <UniversalSearch
            onSelectLocation={handleSelectLocation}
            placeholder="Type any Indian destination (e.g., Varanasi, Hampi, Konark, Jaipur)..."
          />

          {/* Quick-select destination pills - bigger text and comfortable click targets */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="text-stone-500 font-semibold text-sm">Popular:</span>
            {['Varanasi', 'Hampi', 'Amber Fort', 'Rani ki Vav', 'Konark', 'Raghurajpur', 'Thanjavur'].map((p) => (
              <button type="button"
                key={p}
                onClick={() => loadPlaceData(p)}
                className="px-4 py-2 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-800 text-sm font-medium transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Loading feedback */}
      {loading && (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-lg font-semibold font-heritage text-stone-800">
            Unraveling Living Memory Layer for your search...
          </p>
        </div>
      )}

      {/* Error feedback */}
      {error && !loading && (
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <h3 className="text-red-800 font-bold text-lg">Unable to load cultural details</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button type="button"
              onClick={() => setError(null)}
              className="px-4 py-2 mt-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE DESTINATION DETAIL VIEW (ONLY WHEN A PLACE IS SELECTED) */}
      {heritageData && !loading ? (
        <section ref={sectionsRef.overview} className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
          {/* Back to Home & Actions Header */}
          <div className="flex items-center justify-between">
            <button type="button"
              onClick={() => setHeritageData(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 text-sm font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Discover Showcase</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSharePlace}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                title="Share this monument via Web Share"
              >
                <Share2 className="w-4 h-4 text-stone-950" />
                <span>Share</span>
              </button>
              <button type="button"
                onClick={() => setDownloadModalOpen(true)}
                className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Memory Card</span>
              </button>
              <button type="button"
                onClick={() => setTalkToPastOpen(true)}
                className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Talk to the Past</span>
              </button>
            </div>
          </div>

          {/* Place Banner Card */}
          <div className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Photo Banner */}
              <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[420px] bg-stone-100 overflow-hidden">
                <img
                  src={
                    heritageData.imageUrls && heritageData.imageUrls.length > 0
                      ? heritageData.imageUrls[0]
                      : getPlaceFallbackImage(heritageData.placeName)
                  }
                  alt={heritageData.placeName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const fallback = getPlaceFallbackImage(heritageData.placeName);
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                  className="w-full h-full object-cover object-[center_30%] filter brightness-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/40 pointer-events-none" />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Verified Heritage
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-black/80 text-stone-200 text-xs font-mono border border-white/20 shadow-lg">
                    {(Number(heritageData.location?.lat) || 20.593).toFixed(3)}°N, {(Number(heritageData.location?.lon) || 78.962).toFixed(3)}°E
                  </span>
                </div>

                {heritageData.weather && (
                  <div className="absolute bottom-4 left-4 px-4 py-2 rounded-full bg-black/85 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 shadow-xl">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>{heritageData.weather.temperature}°C, {heritageData.weather.condition}</span>
                  </div>
                )}
              </div>

              {/* Vital Information */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-white space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-sm text-amber-800 font-semibold">
                    <MapPin className="w-4 h-4" />
                    <span>{heritageData.location?.formattedAddress || `${heritageData.placeName}, India`}</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-royal text-stone-900">
                    {heritageData.placeName}
                  </h2>

                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-normal">
                    {heritageData.tagline || heritageData.overview}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <span className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 font-semibold">
                      🏛️ Monument of National Importance
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 font-semibold">
                      🧵 Active Living Guilds
                    </span>
                  </div>
                </div>

                {/* Direct Action Hub */}
                <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center gap-3">
                  <button type="button"
                    onClick={handleSaveCurrentToItinerary}
                    className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white text-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>Add to Itinerary</span>
                  </button>

                  <button type="button"
                    onClick={() => onOpenSaveMemory(heritageData.placeName)}
                    className="px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-stone-600" />
                    <span>Save Story</span>
                  </button>

                  <button type="button"
                    onClick={() => onNavigateTab && onNavigateTab('plan-trip')}
                    className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Plan Journey Here</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSharePlace}
                    className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-950 text-amber-300 border border-amber-400/40 text-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
                    title="Share monument with fellow travelers"
                  >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span>Share Monument</span>
                  </button>
                </div>

                {savedSuccessMessage && (
                  <div className="mt-2 text-sm font-semibold text-emerald-700 flex items-center gap-1.5 animate-fade-in">
                    <Check className="w-4 h-4" />
                    <span>{savedSuccessMessage}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Section Navigation Strip */}
            <div className="border-t border-stone-200 bg-stone-50/80 px-6 py-3 flex items-center gap-2.5 overflow-x-auto scrollbar-none text-sm">
              <span className="text-stone-500 font-bold uppercase text-xs tracking-wider whitespace-nowrap">
                Jump To:
              </span>
              {[
                { id: 'history', label: '🏛️ History' },
                { id: 'crafts', label: '🧵 Crafts' },
                { id: 'food', label: '🍲 Food' },
                { id: 'graph', label: '🕸️ Relationship Graph' },
                { id: 'map', label: '📍 Interactive Map' },
                { id: 'safety', label: '🛡️ Safety' },
              ].map((s) => (
                <button type="button"
                  key={s.id}
                  onClick={() => scrollToSection(s.id as any)}
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-stone-200 text-stone-800 font-medium whitespace-nowrap border border-stone-200 text-xs sm:text-sm cursor-pointer shadow-xs"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* CROWDSOURCING, FAIR FARES & LOCAL ARTISAN GUILDS ACTION BAR */}
          <div className="rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-royal text-stone-900">
                    Live Crowd Presence, Fair Fares & Local Guilds
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Real-time traveler radar, anti-overcharging tariffs & direct GI-tagged artisanal craft specialties around{' '}
                  <span className="font-semibold text-stone-800">{heritageData.placeName}</span>
                </p>
              </div>

              {/* Action Tabs Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveCrowdTab(activeCrowdTab === 'radar' ? null : 'radar')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCrowdTab === 'radar'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <span>📡</span>
                  <span>Nearby Radar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCrowdTab(activeCrowdTab === 'fares' ? null : 'fares')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCrowdTab === 'fares'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <span>🛺</span>
                  <span>Fair Auto Fares</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCrowdTab(activeCrowdTab === 'bazaar' ? null : 'bazaar')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCrowdTab === 'bazaar'
                      ? 'bg-stone-900 text-amber-200 shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  <span>🏺</span>
                  <span>Local Crafts & Sweets</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('traveler-hub')}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all flex items-center gap-1 cursor-pointer"
                  title="Open Full Traveler Hub"
                >
                  <span>Full Hub ↗</span>
                </button>
              </div>
            </div>

            {/* Expanded Active Tab Content */}
            {activeCrowdTab === 'radar' && (
              <NearbyTravelersRadar
                placeName={heritageData.placeName}
                monumentName={heritageData.placeName}
                lat={heritageData.location.lat}
                lon={heritageData.location.lon}
              />
            )}

            {activeCrowdTab === 'fares' && (
              <FairPriceTransitGuide cityName={heritageData.placeName} />
            )}

            {activeCrowdTab === 'bazaar' && (
              <LocalMarketplace
                cityName={heritageData.placeName}
                monumentName={heritageData.placeName}
                lat={heritageData.location.lat}
                lon={heritageData.location.lon}
              />
            )}
          </div>

          {/* History & Architecture Cards */}
          <div ref={sectionsRef.history} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3 group">
              <div className="flex items-center gap-2.5 text-amber-800">
                <Landmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold font-heritage">Civilizational Epoch</h3>
              </div>
              <p className="text-base text-stone-700 font-normal leading-relaxed">
                {heritageData.history}
              </p>
            </div>

            <div className="p-7 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3 group">
              <div className="flex items-center gap-2.5 text-stone-800">
                <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold font-heritage">Architectural Motifs</h3>
              </div>
              <p className="text-base text-stone-700 font-normal leading-relaxed">
                {heritageData.architecture}
              </p>
            </div>
          </div>

          {/* Living Culture & Heritage */}
          {(heritageData.traditionalFood?.length > 0 || heritageData.crafts?.length > 0) && (
            <section ref={sectionsRef.crafts} className="space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-2xl font-bold font-royal text-stone-900">
                  Living Culture & Heritage
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {heritageData.traditionalFood && heritageData.traditionalFood.length > 0 && (
                  <div className="p-7 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3 group h-full">
                    <div className="flex items-center gap-2.5 text-amber-800">
                      <Utensils className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold font-heritage">Traditional Food & Recipes</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      {heritageData.traditionalFood.slice(0, 3).map((food: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <h4 className="font-semibold text-stone-900">{food.name}</h4>
                          <p className="text-sm text-stone-700 font-normal leading-relaxed">
                            {food.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {heritageData.crafts && heritageData.crafts.length > 0 && (
                  <div className="p-7 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3 group h-full">
                    <div className="flex items-center gap-2.5 text-stone-800">
                      <Hammer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <h3 className="text-xl font-bold font-heritage">Living Crafts & Guilds</h3>
                    </div>
                    <div className="space-y-4 pt-2">
                      {heritageData.crafts.slice(0, 3).map((craft: any, idx: number) => (
                        <div key={idx} className="space-y-1">
                          <h4 className="font-semibold text-stone-900">{craft.name}</h4>
                          <p className="text-sm text-stone-700 font-normal leading-relaxed">
                            {craft.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Cultural Memory Graph */}
          <section ref={sectionsRef.graph}>
            <CulturalGraph
              graphData={heritageData.culturalMemoryGraph}
              placeName={heritageData.placeName}
            />
          </section>

          {/* Map & Trails */}
          <section ref={sectionsRef.map} className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-2xl font-bold font-royal text-stone-900">
                Geospatial Map & Heritage Trails
              </h3>
            </div>
            <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
              <MapView
                destination={{
                  placeName: heritageData.placeName,
                  lat: heritageData.location.lat,
                  lon: heritageData.location.lon,
                }}
                nearbyHeritage={heritageData.nearbyHeritage}
                trailStops={heritageData.memoryTrail?.stops}
                onSelectPlace={(name) => loadPlaceData(name)}
              />
            </div>
          </section>

          {/* Safety hotlines */}
          <section ref={sectionsRef.safety} className="p-7 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300 space-y-4">
            <div className="flex items-center gap-2.5 text-red-800">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-xl font-bold font-heritage">Emergency Hotlines & Tourist Guidelines</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-stone-600 font-medium">Police & National Emergency:</span>
                <div className="font-mono font-bold text-2xl text-stone-900 mt-1">112</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-amber-900 font-medium">Ministry of Tourism (24x7):</span>
                <div className="font-mono font-bold text-2xl text-amber-900 mt-1">1363</div>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-stone-600 font-medium">Women's Safety Helpline:</span>
                <div className="font-mono font-bold text-2xl text-stone-900 mt-1">1091</div>
              </div>
            </div>
          </section>

          {/* Comments and Sources */}
          <CommentSection
            targetType="place"
            targetId={heritageData.placeName}
            placeTitle={heritageData.placeName}
          />
        </section>
      ) : (
        /* 4. CLEAN DEFAULT SHOWCASE (WHEN NO PLACE IS ACTIVELY SEARCHED) */
        <div className="space-y-16">
          {/* DAILY CULTURAL QUIZ & COMMUNITY POLL COMPONENT */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
            <DailyCulturalQuizPoll
              onExplorePlace={(placeName) => loadPlaceData(placeName)}
              onNavigateTab={onNavigateTab}
            />
          </section>

          {/* SECTION A: CURATED WONDERS OF INDIA */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Pictorial Heritage
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-royal text-stone-900">
                  {getTranslation('curatedWonders', langCode)}
                </h2>
              </div>
              <span className="text-sm text-stone-600 font-normal">
                {getTranslation('curatedSubtitle', langCode)}
              </span>
            </div>

            {/* Pictorial Grid - Large, clear cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURED_HERITAGE_PLACES.map((place) => (
                <div
                  key={place.name}
                  onClick={() => loadPlaceData(place.name)}
                  className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo Banner with Crisp Lower Brightness (Standard 16:10 Ratio) */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <img
                      src={place.image}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-[center_30%] filter brightness-80 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-2xl bg-black/80 border border-white/15 text-white shadow-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-300 font-semibold px-2 py-0.5 rounded bg-black/75 border border-amber-400/30">
                          {place.epoch}
                        </span>
                        <span className="text-xs text-stone-200 font-medium">{place.state}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-royal drop-shadow-md text-white">{place.name}</h3>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-5 flex items-center justify-between text-sm sm:text-base bg-white">
                    <span className="font-semibold text-stone-800">{place.tag}</span>
                    <div className="w-9 h-9 rounded-full bg-stone-100 group-hover:bg-stone-900 group-hover:text-white flex items-center justify-center text-stone-700 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION B: SACRED E-DARSHAN & LIVING SANCTUARIES */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  Virtual Darshan & Aarti
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-royal text-stone-900">
                  {getTranslation('eVisitTitle', langCode)}
                </h2>
              </div>
              <button type="button"
                onClick={() => onNavigateTab && onNavigateTab('evisit')}
                className="text-sm font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>View All 17 Sacred Sanctuaries & Mandirs</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'mahakaleshwar-ujjain',
                  title: 'Ujjain Mahakaleshwar',
                  subtitle: 'Shipra River Bank, Madhya Pradesh',
                  tag: 'Bhasma Aarti & Jyotirlinga',
                  badge: '🕉️ Sacred Ash & Damru',
                  image: '/images/epuja/mahakaleshwar-ujjain.jpg',
                },
                {
                  id: 'kedarnath-dham',
                  title: 'Kedarnath Dham',
                  subtitle: 'Garhwal Himalayas, Uttarakhand',
                  tag: 'Highest Jyotirlinga',
                  badge: '🍃 Bilva & Damru',
                  image: '/images/epuja/kedarnath-dham.jpg',
                },
                {
                  id: 'badrinath-dham',
                  title: 'Badrinath Dham',
                  subtitle: 'Alaknanda Valley, Uttarakhand',
                  tag: 'Maha Char Dham',
                  badge: '🌿 Kasturi Chandan & Tulsi',
                  image: '/images/epuja/badrinath-dham.jpg',
                },
                {
                  id: 'tirupati-balaji',
                  title: 'Tirupati Balaji',
                  subtitle: 'Tirumala Hills, Andhra Pradesh',
                  tag: 'Ananda Nilayam Vimana',
                  badge: '🌿 Tulsi Mala & Bell',
                  image: '/images/epuja/tirupati-balaji.jpg',
                },
                {
                  id: 'durga-puja',
                  title: 'E-Durga Puja',
                  subtitle: 'Kolkata Pandal Parikrama',
                  tag: 'UNESCO Intangible',
                  badge: '🥁 Dhaak & Aarti',
                  image: '/images/epuja/durga-puja.jpg',
                },
                {
                  id: 'ganga-aarti',
                  title: 'E-Ganga Aarti',
                  subtitle: 'Dashashwamedh Ghat, Varanasi',
                  tag: 'Sacred Dusk Ritual',
                  badge: '🪔 Floating Diya',
                  image: '/images/epuja/ganga-aarti.jpg',
                },
              ].map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onNavigateTab && onNavigateTab('evisit')}
                  className="group rounded-3xl overflow-hidden bg-white border border-stone-200 hover:border-amber-500 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-stone-900">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-80 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 text-xs font-semibold text-amber-300 border border-white/20 shadow-md">
                      {ev.tag}
                    </span>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 px-3 rounded-xl bg-black/85 border border-white/20 text-white flex items-center justify-between shadow-lg">
                      <span className="text-xs font-semibold text-amber-200 truncate">{ev.title}</span>
                      <span className="text-[11px] text-stone-300 shrink-0">{(ev.subtitle || '').split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="text-lg font-bold font-royal text-stone-900 group-hover:text-amber-800 transition-colors">
                        {ev.title}
                      </h4>
                      <p className="text-sm text-stone-600 font-normal truncate mt-0.5">{ev.subtitle}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-sm">
                      <span className="text-amber-800 font-medium">{ev.badge}</span>
                      <span className="text-stone-900 font-bold group-hover:text-amber-700 flex items-center gap-1">
                        Enter Darshan →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION C: LIVING CRAFTS & ARTISAN GUILDS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  {getTranslation('crafts', langCode)}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-royal text-stone-900">
                  {getTranslation('livingCraftsTitle', langCode)}
                </h2>
              </div>
              <button type="button"
                onClick={() => onNavigateTab && onNavigateTab('living-heritage')}
                className="text-sm font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{getTranslation('livingCraftsSubtitle', langCode)}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LIVING_CRAFTS_PICTORIAL.map((craft) => (
                <div
                  key={craft.name}
                  onClick={() => onNavigateTab && onNavigateTab('living-heritage')}
                  className="rounded-[2rem] overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 space-y-4 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-stone-100">
                      <img
                        src={craft.image}
                        alt={craft.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter brightness-85 group-hover:brightness-95 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 text-xs font-bold text-emerald-300 border border-emerald-400/30 shadow-md">
                        GI Tagged
                      </span>
                      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-black/85 border border-white/15 text-white flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-300 truncate">{craft.place}</span>
                        <span className="text-[10px] text-stone-300 font-mono shrink-0">{craft.tag}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-royal text-stone-900 group-hover:text-amber-800 transition-colors">
                        {craft.name}
                      </h4>
                      <div className="text-sm text-amber-800 font-medium mt-0.5">{craft.place}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm text-stone-600">
                    <span>{craft.tag}</span>
                    <span className="font-semibold text-stone-900">{craft.craftsman}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION D: HEIRLOOM CULINARY TRADITIONS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Gastronomy & Annapurna Lore
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-royal text-stone-900">
                  Heirloom Culinary Traditions
                </h2>
              </div>
              <span className="text-sm text-stone-600 font-normal">
                Slow-cooked heritage, holy hearths & sacred clay pot rasas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {HEIRLOOM_FOOD_PICTORIAL.map((food) => (
                <div
                  key={food.name}
                  className="rounded-[2rem] overflow-hidden bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-stone-900">
                      <img
                        src={food.image}
                        alt={food.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter brightness-85 group-hover:brightness-95 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 text-xs font-bold text-amber-300 border border-amber-400/30 shadow-md">
                        {food.place}
                      </span>
                      <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-black/85 border border-white/15 text-white flex items-center justify-between text-xs">
                        <span className="font-semibold text-amber-200 truncate">{food.season}</span>
                        <span className="text-[10px] text-stone-300 font-mono shrink-0">{food.tag}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold font-royal text-stone-900 group-hover:text-amber-800 transition-colors">
                        {food.name}
                      </h4>
                      <div className="text-sm text-amber-800 font-medium mt-0.5">{food.place}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm text-stone-600">
                    <span>Hearth Method</span>
                    <span className="font-semibold text-stone-900">{food.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Global Modals */}
      {heritageData && (
        <>
          <TalkToPastModal
            placeName={heritageData.placeName}
            context={heritageData}
            isOpen={talkToPastOpen}
            onClose={() => setTalkToPastOpen(false)}
          />

          <DownloadMemoryCardModal
            isOpen={downloadModalOpen}
            onClose={() => setDownloadModalOpen(false)}
            data={heritageData}
          />

          <SocialShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            payload={sharePayload || { title: heritageData.placeName, text: `Explore ${heritageData.placeName} on Aarambh!` }}
            badgeType="monument"
            subtitle="Broadcast this Indian heritage wonder with fellow travelers"
          />
        </>
      )}
    </div>
  );
};
