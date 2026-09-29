import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { fetchLocalVendors, submitLocalVendor } from '../services/api';
import { LocalVendorItem } from '../types';

interface LocalArtisanMarketplaceProps {
  cityName?: string;
  onSelectPlace?: (place: string) => void;
}

export const LocalArtisanMarketplace: React.FC<LocalArtisanMarketplaceProps> = ({
  cityName = 'Agra',
}) => {
  const [vendors, setVendors] = useState<LocalVendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorModalOpen, setVendorModalOpen] = useState(false);

  // New Vendor Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'GI Tag Craft' | 'Heirloom Food & Sweets' | 'Textiles & Handloom' | 'Handicrafts & Art' | 'Footwear'>('GI Tag Craft');
  const [artisanName, setArtisanName] = useState('');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');
  const [priceNumber, setPriceNumber] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [giTagVerified, setGiTagVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const list = await fetchLocalVendors(cityName);
      setVendors(list);
    } catch (err) {
      console.error('Failed to load local vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [cityName]);

  const categories = ['All', 'GI Tag Craft', 'Heirloom Food & Sweets', 'Textiles & Handloom', 'Footwear'];

  const filteredVendors = vendors.filter((v) => {
    const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.artisanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shopName.trim() || !whatsAppNumber.trim()) return;

    try {
      setSubmitting(true);
      await submitLocalVendor({
        name,
        category,
        artisanName: artisanName || 'Local Master Artisan',
        shopName,
        location: location || `${cityName} Heritage Quarter`,
        city: cityName,
        priceFormatted: `₹${priceNumber || '350'}`,
        priceNumber: parseInt(priceNumber, 10) || 350,
        story: story || 'Ancestral specialty crafted using traditional techniques without middleman commissions.',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
        whatsAppNumber,
        giTagVerified,
        handloomMark: category === 'Textiles & Handloom',
      });
      setSubmitSuccess(true);
      setName('');
      setShopName('');
      setWhatsAppNumber('');
      setStory('');
      await loadVendors();
      setTimeout(() => {
        setSubmitSuccess(false);
        setVendorModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to register vendor', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = (vendor: LocalVendorItem) => {
    const cleanNumber = vendor.whatsAppNumber.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Namaste ${vendor.artisanName || vendor.shopName}! I found your authentic craft "${vendor.name}" on Aarambh (India's Living Memory Layer). I am currently visiting ${cityName} and would like to buy directly / visit your workshop.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-5 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center text-xl shadow-xs">
            🏺
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                Direct Local Artisans & Famous Specialties
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                NO TOUTS • DIRECT BUY
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Verified GI-tagged crafts, heirloom sweets & ancestral guilds in{' '}
              <span className="font-semibold text-stone-800">{cityName}</span>
            </p>
          </div>
        </div>

        {/* List Craft CTA Button */}
        <button
          onClick={() => setVendorModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>List Your Craft / Shop</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search craft, artisan or sweet..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-xs">Connecting to local artisan guild registry...</span>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="py-12 text-center text-stone-400 space-y-2">
          <ShoppingBag className="w-8 h-8 mx-auto text-stone-300" />
          <p className="text-xs">No crafts found matching your filter in {cityName}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="group rounded-2xl border border-stone-200 bg-white hover:border-amber-300 hover:shadow-lg transition-all flex flex-col overflow-hidden"
            >
              {/* Image with badges */}
              <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                <img
                  src={vendor.imageUrl}
                  alt={vendor.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to high quality craft fallback image
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-stone-800 backdrop-blur-xs border border-white/40 shadow-xs">
                    {vendor.category}
                  </span>
                  {vendor.giTagVerified && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-xs">
                      <span>🏷️</span>
                      <span>GI TAG CERTIFIED</span>
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Price & Rating */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between text-white">
                  <div>
                    <div className="text-[10px] text-stone-300 uppercase tracking-wide">Direct Artisan Price</div>
                    <div className="text-base font-extrabold text-amber-300">{vendor.priceFormatted}</div>
                  </div>
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{vendor.rating}</span>
                    <span className="text-stone-400 text-[10px]">({vendor.reviewsCount})</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {vendor.name}
                  </h4>
                  <div className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{vendor.artisanName}</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {vendor.story}
                  </p>
                </div>

                {/* Location & Direct WhatsApp CTA */}
                <div className="pt-2 border-t border-stone-100 space-y-2">
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{vendor.location}</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{vendor.distanceFromMonument}</span>
                  </div>

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => openWhatsApp(vendor)}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp</span>
                    </button>
                    {vendor.googleMapsQuery && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendor.googleMapsQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-600 hover:text-stone-900 transition-colors"
                        title="View on Google Maps"
                      >
                        <Compass className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Vendor / List Craft Modal */}
      {vendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🏺
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Register Craft / Local Shop</h3>
                  <p className="text-xs text-stone-500">Sell directly to travelers visiting {cityName}</p>
                </div>
              </div>
              <button
                onClick={() => setVendorModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
                <h4 className="font-bold text-stone-900 text-base">Your Craft is Listed!</h4>
                <p className="text-xs text-stone-500">
                  Travelers visiting {cityName} can now discover your products and message you directly on WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterVendor} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Product / Famous Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Original Angoori Petha / Handcrafted Marble Coasters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Craft Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="GI Tag Craft">GI Tag Craft 🏷️</option>
                      <option value="Heirloom Food & Sweets">Heirloom Food & Sweets 🍬</option>
                      <option value="Textiles & Handloom">Textiles & Handloom 🧵</option>
                      <option value="Handicrafts & Art">Handicrafts & Art 🏺</option>
                      <option value="Footwear">Footwear 👞</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Direct Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={priceNumber}
                      onChange={(e) => setPriceNumber(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Shop / Guild Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Panchhi Petha Noori Gate"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Artisan / Owner Name
                    </label>
                    <input
                      type="text"
                      value={artisanName}
                      onChange={(e) => setArtisanName(e.target.value)}
                      placeholder="e.g. Ustad Salim"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp Number (for direct customer chats) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsAppNumber}
                      onChange={(e) => setWhatsAppNumber(e.target.value)}
                      placeholder="e.g. 9837012345"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Shop Address / Landmark
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Near Taj East Gate, Shilpgram"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Artisan Story / Craft Heritage
                  </label>
                  <textarea
                    rows={2}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Describe how it is handcrafted, generational lineage, or ingredients..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="giCheck"
                    checked={giTagVerified}
                    onChange={(e) => setGiTagVerified(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="giCheck" className="text-xs text-stone-700 select-none">
                    This is an officially certified GI Tag / Handloom product
                  </label>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVendorModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !shopName.trim() || !whatsAppNumber.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'List My Craft Now'}
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
