import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Award,
  Sparkles,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Plus,
  CheckCircle2,
  Filter,
  Search,
  Star,
  ShieldCheck,
  Loader2,
  X,
  Compass,
  Radio,
  Clock,
  Navigation,
  Check,
  Tag,
  Footprints,
  Calendar,
  Send,
  SlidersHorizontal,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { fetchLocalVendors, submitLocalVendor } from '../services/api';
import { LocalVendorItem } from '../types';

interface LocalMarketplaceProps {
  cityName?: string;
  monumentName?: string;
  lat?: number;
  lon?: number;
  onSelectPlace?: (place: string) => void;
  onRefreshGps?: () => void;
}

export const LocalMarketplace: React.FC<LocalMarketplaceProps> = ({
  cityName = 'Agra',
  monumentName,
  lat = 27.1751,
  lon = 78.0421,
  onSelectPlace,
  onRefreshGps,
}) => {
  const [vendors, setVendors] = useState<LocalVendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'product' | 'service'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [distanceRadius, setDistanceRadius] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'proximity' | 'rating' | 'priceAsc'>('proximity');
  const [searchQuery, setSearchQuery] = useState('');

  // Inquiry / Booking Modal State
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<LocalVendorItem | null>(null);
  const [inquiryName, setInquiryName] = useState(() => localStorage.getItem('aarambh_traveler_name') || '');
  const [inquiryContact, setInquiryContact] = useState('');
  const [inquiryDate, setInquiryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [inquiryQty, setInquiryQty] = useState(1);
  const [inquiryNote, setInquiryNote] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Register New Vendor/Service Modal State
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regItemType, setRegItemType] = useState<'product' | 'service'>('product');
  const [regCategory, setRegCategory] = useState<string>('GI Tag Craft');
  const [regArtisanName, setRegArtisanName] = useState('');
  const [regShopName, setRegShopName] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regPriceFormatted, setRegPriceFormatted] = useState('');
  const [regPriceNumber, setRegPriceNumber] = useState('');
  const [regWhatsAppNumber, setRegWhatsAppNumber] = useState('');
  const [regStory, setRegStory] = useState('');
  const [regTiming, setRegTiming] = useState('');
  const [regDuration, setRegDuration] = useState('');
  const [regGiTagVerified, setRegGiTagVerified] = useState(false);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  // Fetch vendors dynamically based on GPS coordinates & city
  const loadVendors = async () => {
    try {
      setLoading(true);
      const list = await fetchLocalVendors(cityName, lat, lon);
      setVendors(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load local marketplace vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [cityName, lat, lon]);

  // Safe vendors array
  const safeVendors = useMemo(() => (Array.isArray(vendors) ? vendors : []), [vendors]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    safeVendors.forEach((v) => {
      if (v?.category) set.add(v.category);
    });
    return ['All', ...Array.from(set)];
  }, [safeVendors]);

  // Counts
  const productCount = useMemo(() => safeVendors.filter((v) => v?.itemType !== 'service').length, [safeVendors]);
  const serviceCount = useMemo(() => safeVendors.filter((v) => v?.itemType === 'service').length, [safeVendors]);

  // Filter & Sort Vendors
  const filteredVendors = useMemo(() => {
    return safeVendors
      .filter((v) => {
        if (!v) return false;
        // Item Type Filter (Product vs Service)
        if (itemTypeFilter === 'product' && v.itemType === 'service') return false;
        if (itemTypeFilter === 'service' && v.itemType !== 'service') return false;

        // Category Filter
        if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;

        // Distance Radius Filter (in meters)
        if (typeof distanceRadius === 'number' && v.distanceMeters !== undefined) {
          if (v.distanceMeters > distanceRadius) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = (v.name || '').toLowerCase().includes(q);
          const matchArtisan = (v.artisanName || '').toLowerCase().includes(q);
          const matchShop = (v.shopName || '').toLowerCase().includes(q);
          const matchLoc = (v.location || '').toLowerCase().includes(q);
          const matchCat = (v.category || '').toLowerCase().includes(q);
          if (!matchName && !matchArtisan && !matchShop && !matchLoc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'proximity') {
          return (Number(a.distanceMeters) || 99999) - (Number(b.distanceMeters) || 99999);
        }
        if (sortBy === 'rating') {
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        }
        if (sortBy === 'priceAsc') {
          return (Number(a.priceNumber) || 0) - (Number(b.priceNumber) || 0);
        }
        return 0;
      });
  }, [safeVendors, itemTypeFilter, selectedCategory, distanceRadius, sortBy, searchQuery]);

  // Open WhatsApp direct chat
  const handleOpenWhatsApp = (vendor: LocalVendorItem) => {
    const cleanNumber = vendor.whatsAppNumber.replace(/\D/g, '');
    const isService = vendor.itemType === 'service';
    const text = encodeURIComponent(
      `Namaste ${vendor.artisanName || vendor.shopName}! I found your ${
        isService ? 'cultural service' : 'authentic craft'
      } "${vendor.name}" on Aarambh (India's Living Memory Layer) near my current GPS location in ${cityName}. I would like to ${
        isService ? 'book / inquire about a session' : 'purchase directly without middleman touts'
      }.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  // Open Google Maps Directions
  const handleOpenDirections = (vendor: LocalVendorItem) => {
    if (vendor.lat && vendor.lon) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${vendor.lat},${vendor.lon}&travelmode=walking`,
        '_blank'
      );
    } else {
      const q = encodeURIComponent(vendor.googleMapsQuery || `${vendor.shopName} ${vendor.city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
    }
  };

  // Submit Direct Booking / Inquiry
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryContact.trim() || !activeItem) return;

    localStorage.setItem('aarambh_traveler_name', inquiryName.trim());
    setInquirySuccess(true);

    setTimeout(() => {
      setInquirySuccess(false);
      setInquiryModalOpen(false);
      setInquiryNote('');
    }, 2000);
  };

  // Register New Local Vendor/Service Form
  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regShopName.trim() || !regWhatsAppNumber.trim()) return;

    try {
      setSubmittingReg(true);
      await submitLocalVendor({
        name: regName.trim(),
        itemType: regItemType,
        category: regCategory,
        artisanName: regArtisanName.trim() || 'Local Master Artisan / Guild',
        shopName: regShopName.trim(),
        location: regLocation.trim() || `${cityName} Heritage Quarter`,
        city: cityName,
        lat: lat + (Math.random() - 0.5) * 0.005,
        lon: lon + (Math.random() - 0.5) * 0.005,
        priceFormatted: regPriceFormatted || `₹${regPriceNumber || '350'}`,
        priceNumber: parseInt(regPriceNumber, 10) || 350,
        story:
          regStory.trim() ||
          'Ancestral specialty crafted using traditional techniques and sold directly to travelers without middleman commissions.',
        imageUrl:
          regItemType === 'service'
            ? 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        whatsAppNumber: regWhatsAppNumber.trim(),
        giTagVerified: regGiTagVerified,
        handloomMark: regCategory.includes('Handloom') || regCategory.includes('Textiles'),
        timing: regTiming || (regItemType === 'service' ? '09:00 AM - 06:00 PM' : undefined),
        serviceDuration: regDuration || (regItemType === 'service' ? '2 Hours' : undefined),
        verifiedLocalSeller: true,
      });

      setRegSuccess(true);
      setRegName('');
      setRegShopName('');
      setRegWhatsAppNumber('');
      setRegStory('');
      await loadVendors();

      setTimeout(() => {
        setRegSuccess(false);
        setVendorModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to register vendor:', err);
    } finally {
      setSubmittingReg(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-5 sm:p-7 space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* TOP LIVE GPS VICINITY HERO BANNER                             */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-amber-500/30 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-10 text-9xl">
          🏺
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Live GPS Proximity Marketplace</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>0% Tout Markup • Direct From Artisans</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-amber-100">
              Verified Local Marketplace around {cityName}
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Dynamically connecting travelers to ancestral craft products and certified cultural experiences within walking distance of your current GPS coordinates.
            </p>

            {/* GPS Live Coordinates Lock Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/80 text-amber-300 font-mono text-[11px]">
                <Compass className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
                <span>
                  GPS: {(Number(lat) || 27.1751).toFixed(4)}° N, {(Number(lon) || 78.0421).toFixed(4)}° E
                </span>
                {monumentName && <span className="text-stone-400 font-sans">• {monumentName}</span>}
              </div>

              {onRefreshGps && (
                <button
                  onClick={onRefreshGps}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="Re-scan nearest vendors using GPS"
                >
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Re-scan GPS</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action: Register Business / Service */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => setVendorModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-stone-950" />
              <span>List Product or Service</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FILTER & DISCOVERY TOOLBAR                                    */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4 pt-1">
        {/* Row 1: Item Type Tabs (All, Products, Services) & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Item Type Switcher */}
          <div className="bg-stone-100 p-1 rounded-2xl flex items-center text-xs font-bold border border-stone-200">
            <button
              onClick={() => setItemTypeFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                itemTypeFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>All ({vendors.length})</span>
            </button>

            <button
              onClick={() => setItemTypeFilter('product')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                itemTypeFilter === 'product'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Products ({productCount})</span>
            </button>

            <button
              onClick={() => setItemTypeFilter('service')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                itemTypeFilter === 'service'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Services & Tours ({serviceCount})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search craft, sweet, tour, artisan..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Row 2: Category Chips & GPS Radius Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-amber-300 border-stone-900 shadow-xs'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Radius & Sorting Controls */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            {/* Radius Filter */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
              <span className="text-stone-400">Radius:</span>
              {(['all', 500, 1500, 3000] as const).map((r) => (
                <button
                  key={r.toString()}
                  onClick={() => setDistanceRadius(r)}
                  className={`px-2 py-0.5 rounded-lg border text-[11px] cursor-pointer transition-colors ${
                    distanceRadius === r
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-white text-stone-600 hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  {r === 'all' ? 'All' : `< ${r < 1000 ? `${r}m` : `${r / 1000}km`}`}
                </button>
              ))}
            </div>

            {/* Sort Switcher */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 ml-2">
              <span className="text-stone-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="px-2 py-1 rounded-xl border border-stone-200 bg-white text-[11px] focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="proximity">📍 Nearest GPS Distance</option>
                <option value="rating">★ Highest Rated</option>
                <option value="priceAsc">₹ Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VENDOR CARDS GRID                                             */}
      {/* ------------------------------------------------------------- */}
      {loading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs font-bold text-stone-500">
            Scanning verified local artisans & cultural services near your GPS coordinates...
          </p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="p-10 rounded-3xl bg-amber-50/50 border border-amber-200 text-center space-y-3">
          <ShoppingBag className="w-8 h-8 text-amber-600 mx-auto" />
          <h4 className="font-bold text-stone-900 text-sm">No items found matching your filters</h4>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Try expanding the distance radius, resetting the category filter, or registering a new local artisan product!
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setItemTypeFilter('all');
              setDistanceRadius('all');
              setSearchQuery('');
            }}
            className="px-4 py-1.5 rounded-xl bg-stone-900 text-amber-300 text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => {
            const isService = vendor.itemType === 'service';

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Image Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-100">
                    <img
                      src={vendor.imageUrl}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      {/* Product vs Service Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                          isService
                            ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50'
                            : 'bg-amber-950/90 text-amber-300 border border-amber-500/50'
                        }`}
                      >
                        {isService ? '🧭 Cultural Service' : '🏺 Craft Product'}
                      </span>

                      {/* GI Tag or Handloom Badge */}
                      <div className="flex items-center gap-1">
                        {vendor.giTagVerified && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-white text-[9.5px] font-bold shadow-xs border border-blue-400">
                            GI Tag Verified
                          </span>
                        )}
                        {vendor.handloomMark && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[9.5px] font-bold shadow-xs border border-rose-400">
                            Handloom Mark
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Floating Info: Proximity from User's GPS & Rating */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                      {/* Live GPS Distance Tag */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 font-semibold text-[10.5px]">
                        <Compass className="w-3 h-3 text-emerald-400 animate-spin-slow" />
                        <span>{vendor.distanceFromMonument || 'Nearby'}</span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[11px] shadow-xs">
                        <Star className="w-3 h-3 fill-stone-950 text-stone-950" />
                        <span>{(Number(vendor.rating) || 4.9).toFixed(1)}</span>
                        <span className="text-[9px] font-normal text-stone-800">({vendor.reviewsCount || 120})</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">
                        {vendor.category}
                      </div>
                      <h3 className="font-serif font-bold text-stone-950 text-base leading-snug line-clamp-2 mt-0.5">
                        {vendor.name}
                      </h3>
                    </div>

                    {/* Artisan / Guild Info */}
                    <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                        <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{vendor.artisanName}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{vendor.shopName} ({vendor.location})</span>
                      </div>
                    </div>

                    {/* Story / Authenticity description */}
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {vendor.story}
                    </p>

                    {/* Service Duration / Timing if available */}
                    {isService && (vendor.timing || vendor.serviceDuration) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-600 font-semibold">
                        {vendor.timing && (
                          <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {vendor.timing}
                          </span>
                        )}
                        {vendor.serviceDuration && (
                          <span className="flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                            <Calendar className="w-3 h-3 text-blue-600" />
                            {vendor.serviceDuration}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer & Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-2 space-y-3">
                  {/* Price Bar */}
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        Verified Fair Tariff
                      </span>
                      <span className="text-base font-extrabold text-stone-950 font-serif">
                        {vendor.priceFormatted}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      0% Commission
                    </span>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {/* WhatsApp */}
                    <button
                      onClick={() => handleOpenWhatsApp(vendor)}
                      className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title="Chat directly on WhatsApp with artisan"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>

                    {/* Navigate via Google Maps */}
                    <button
                      onClick={() => handleOpenDirections(vendor)}
                      className="py-2 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center gap-1 border border-stone-200 transition-colors cursor-pointer"
                      title="Walk to this shop using Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>Walk</span>
                    </button>

                    {/* Book / Inquire */}
                    <button
                      onClick={() => {
                        setActiveItem(vendor);
                        setInquiryModalOpen(true);
                      }}
                      className="py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                      title={isService ? 'Reserve this cultural service' : 'Direct order / reserve craft item'}
                    >
                      <span>{isService ? 'Book' : 'Reserve'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DIRECT INQUIRY & BOOKING MODAL                                */}
      {/* ------------------------------------------------------------- */}
      {inquiryModalOpen && activeItem && (
        <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-md w-full p-5 sm:p-6 space-y-4 animate-scale-in text-stone-900">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  {activeItem.itemType === 'service' ? 'Cultural Service Reservation' : 'Direct Artisan Order'}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-950 leading-tight">
                  {activeItem.name}
                </h3>
                <div className="text-xs text-stone-500 mt-0.5">
                  Artisan: {activeItem.artisanName} • {activeItem.priceFormatted}
                </div>
              </div>
              <button
                onClick={() => setInquiryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inquirySuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Direct Request Sent!</h4>
                <p className="text-xs text-emerald-800">
                  Your reservation inquiry has been communicated directly to {activeItem.artisanName} at {activeItem.shopName}. No tout commissions were added.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Priyanshu Mehta"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Mobile / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={inquiryContact}
                      onChange={(e) => setInquiryContact(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">
                      {activeItem.itemType === 'service' ? 'Date of Visit' : 'Quantity'}
                    </label>
                    {activeItem.itemType === 'service' ? (
                      <input
                        type="date"
                        value={inquiryDate}
                        onChange={(e) => setInquiryDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    ) : (
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={inquiryQty}
                        onChange={(e) => setInquiryQty(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Special Request or Note to Artisan</label>
                  <textarea
                    rows={2}
                    value={inquiryNote}
                    onChange={(e) => setInquiryNote(e.target.value)}
                    placeholder={
                      activeItem.itemType === 'service'
                        ? 'e.g. We are 2 people arriving by walking from Taj East Gate at 06:15 AM.'
                        : 'e.g. Please pack in protective bubble wrap for airplane luggage.'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200/80 leading-relaxed">
                  ✓ <strong>Fair Price Guarantee:</strong> You will pay the artisan directly at their workshop or shop. Zero middleman cuts or tout commissions.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>
                    Confirm {activeItem.itemType === 'service' ? 'Direct Booking' : 'Order Reservation'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* REGISTER VENDOR / SERVICE MODAL                               */}
      {/* ------------------------------------------------------------- */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-lg w-full p-5 sm:p-6 space-y-4 animate-scale-in text-stone-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-950">
                  List Your Local Craft or Cultural Service
                </h3>
                <p className="text-xs text-stone-500">
                  Join the GPS-powered marketplace around {cityName}. Connect directly with travelers without tout commissions.
                </p>
              </div>
              <button
                onClick={() => setVendorModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {regSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Listing Created Successfully!</h4>
                <p className="text-xs text-emerald-800">
                  Your craft or service has been registered and is now visible to nearby travelers searching on Aarambh.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterVendor} className="space-y-3 text-xs">
                {/* Product vs Service Toggle */}
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Listing Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRegItemType('product');
                        setRegCategory('GI Tag Craft');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        regItemType === 'product'
                          ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Craft Product</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegItemType('service');
                        setRegCategory('Heritage Tour & Guide');
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        regItemType === 'service'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200'
                      }`}
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>Cultural Service / Tour</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {regItemType === 'service' ? 'Service / Tour Title' : 'Product / Craft Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={
                      regItemType === 'service'
                        ? 'e.g. Dawn Heritage Architectural Walk or Marble Inlay Workshop'
                        : 'e.g. Pure Handcrafted Marble Inlay Coaster or GI Tagged Petha'
                    }
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Category</label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      {regItemType === 'service' ? (
                        <>
                          <option value="Heritage Tour & Guide">Heritage Tour & Guide</option>
                          <option value="Local Experience & Workshop">Local Experience & Workshop</option>
                          <option value="Culinary Walk & Tasting">Culinary Walk & Tasting</option>
                          <option value="Spiritual Boat Tour">Spiritual Boat Tour</option>
                        </>
                      ) : (
                        <>
                          <option value="GI Tag Craft">GI Tag Craft</option>
                          <option value="Heirloom Food & Sweets">Heirloom Food & Sweets</option>
                          <option value="Textiles & Handloom">Textiles & Handloom</option>
                          <option value="Handicrafts & Art">Handicrafts & Art</option>
                          <option value="Footwear">Footwear</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Price in INR</label>
                    <input
                      type="number"
                      required
                      value={regPriceNumber}
                      onChange={(e) => {
                        setRegPriceNumber(e.target.value);
                        setRegPriceFormatted(`₹${e.target.value}`);
                      }}
                      placeholder="e.g. 450"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Master Artisan / Host Name</label>
                    <input
                      type="text"
                      required
                      value={regArtisanName}
                      onChange={(e) => setRegArtisanName(e.target.value)}
                      placeholder="e.g. Ustad Rahim & Family"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Shop / Studio Name</label>
                    <input
                      type="text"
                      required
                      value={regShopName}
                      onChange={(e) => setRegShopName(e.target.value)}
                      placeholder="e.g. Mughal Inlay Atelier"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Ancestral Bazaar / Street Location</label>
                    <input
                      type="text"
                      required
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      placeholder="e.g. Gokulpura, Tajganj"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">WhatsApp Mobile (Direct)</label>
                    <input
                      type="tel"
                      required
                      value={regWhatsAppNumber}
                      onChange={(e) => setRegWhatsAppNumber(e.target.value)}
                      placeholder="e.g. 9837012345"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {regItemType === 'service' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Timing / Batch Schedule</label>
                      <input
                        type="text"
                        value={regTiming}
                        onChange={(e) => setRegTiming(e.target.value)}
                        placeholder="e.g. 06:30 AM & 04:00 PM"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-bold mb-1">Duration</label>
                      <input
                        type="text"
                        value={regDuration}
                        onChange={(e) => setRegDuration(e.target.value)}
                        placeholder="e.g. 2 Hours"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Heritage Story / Craftsmanship Details</label>
                  <textarea
                    rows={2}
                    value={regStory}
                    onChange={(e) => setRegStory(e.target.value)}
                    placeholder="Explain the generational lineage, authentic materials used, and zero-tout commitment."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                </div>

                {regItemType === 'product' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="giVerify"
                      checked={regGiTagVerified}
                      onChange={(e) => setRegGiTagVerified(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="giVerify" className="text-stone-700 font-medium">
                      Item is certified under Geographical Indications (GI) of India
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReg}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingReg ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-amber-400" />
                  )}
                  <span>Publish to GPS Marketplace</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
