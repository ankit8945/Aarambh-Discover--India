import React, { useState } from 'react';
import { Sparkles, MapPin, Search, Filter, ShieldAlert, Heart, ExternalLink, Camera } from 'lucide-react';
import { CommentSection } from '../components/CommentSection';

interface LivingHeritageViewProps {
  onSelectPlace: (placeName: string) => void;
  onOpenSaveMemory: () => void;
}

const LIVING_HERITAGE_ARCHIVE = [
  {
    id: 'craft-1',
    title: 'Rogan Painting on Castor Oil Fabric',
    category: 'Textile Art',
    location: 'Nirona, Kutch, Gujarat',
    status: 'Critically Endangered',
    statusColor: 'text-red-700 bg-red-100 border-red-200',
    practitioner: 'Khatri Abdul Gafur Family',
    description:
      'A rare four-century-old art form where thick paste made of boiled castor oil and natural pigments is laid onto cloth using an iron stylus with bare hand guidance.',
    keyMaterial: 'Castor Seed Oil, Natural Mineral Pigments, Brass Stylus',
    urgencyNote: 'Practiced actively by only one surviving family lineage in western India.',
  },
  {
    id: 'craft-2',
    title: 'Lost-Wax Dhokra Bell Metal Casting',
    category: 'Metallurgy',
    location: 'Bastar, Chhattisgarh & Bankura, West Bengal',
    status: 'Living Continuum',
    statusColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    practitioner: 'Ghadwa & Dhokra Tribal Guilds',
    description:
      'Non-ferrous metal casting using the ancient cire-perdue method, dating continuously back over 4,000 years to the Dancing Girl of Mohenjo-daro.',
    keyMaterial: 'Beeswax, Clay from Anthills, Scrap Brass, Rice Husk Fire',
    urgencyNote: 'Facing rising scrap metal costs and furnace firewood constraints.',
  },
  {
    id: 'craft-3',
    title: 'Thathera Utensil Crafting of Jandiala Guru',
    category: 'UNESCO Intangible Heritage',
    location: 'Amritsar District, Punjab',
    status: 'Preserved Guild Tradition',
    statusColor: 'text-blue-700 bg-blue-100 border-blue-200',
    practitioner: 'Thathera Artisan Community',
    description:
      'The traditional technique of manufacturing brass and copper utensils by hammering heated metal sheets into rounded shapes with specialized pits and anvils.',
    keyMaterial: 'Brass & Copper Ingots, Acidic Tamarind Glazes',
    urgencyNote: 'India’s only UNESCO inscribed metal craft of tangible utensil utility.',
  },
  {
    id: 'craft-4',
    title: 'Kani Pashmina Shawl Weaving with Tujis',
    category: 'Weaving',
    location: 'Kanihama, Budgam, Kashmir',
    status: 'Vulnerable',
    statusColor: 'text-amber-700 bg-amber-100 border-amber-200',
    practitioner: 'Kani Loom Masters',
    description:
      'Shawls woven with coded talim patterns where small wooden bobbins (tujis) are meticulously interlocked across the warp, requiring up to 18 months per piece.',
    keyMaterial: 'Changthangi Goat Pashm, Wooden Eyeless Bobbins (Kanis)',
    urgencyNote: 'Hand-weaving threatened by industrialized powerloom copies.',
  },
  {
    id: 'craft-5',
    title: 'Pattachitra Scroll Painting & Talapatra',
    category: 'Folk Scroll Painting',
    location: 'Raghurajpur Heritage Crafts Village, Odisha',
    status: 'Living Continuum',
    statusColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    practitioner: 'Chitrakar Community',
    description:
      'Traditional cloth-based scroll painting and dried palm leaf engraving depicting Vaishnava legends, with colors derived from conch shells and lampblack.',
    keyMaterial: 'Tamarind Seed Gum, Dried Palm Fronds, Conch Powder',
    urgencyNote: 'Entire village serves as a living museum of practicing master artists.',
  },
  {
    id: 'craft-6',
    title: 'Kalaripayattu Martial Movement & Marma Lore',
    category: 'Living Martial Tradition',
    location: 'Vadakara, Malabar, Kerala',
    status: 'Living Continuum',
    statusColor: 'text-emerald-700 bg-emerald-100 border-emerald-200',
    practitioner: 'Gurukkals of Malabar Kalari Gymnasiums',
    description:
      'One of the oldest surviving battlefield arts in human history, synthesizing animal postures, medicinal oil massages, and strike point philosophy.',
    keyMaterial: 'Urumi flexible sword, Dhanurvedic herbal oils, Red earth pit',
    urgencyNote: 'Transmitted orally through guru-shishya parampara in subterranean kalaris.',
  },
];

export const LivingHeritageView: React.FC<LivingHeritageViewProps> = ({
  onSelectPlace,
  onOpenSaveMemory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCraft, setSelectedCraft] = useState<any>(null);

  const categories = ['All', 'Textile Art', 'Metallurgy', 'UNESCO Intangible Heritage', 'Weaving', 'Folk Scroll Painting', 'Living Martial Tradition'];

  const filtered = LIVING_HERITAGE_ARCHIVE.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.practitioner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-white border border-stone-200 p-6 sm:p-10 text-stone-900 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-900 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-orange-700" />
            Living Traditions & Intangible Heritage
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold font-royal text-stone-900 leading-tight">
            Preserve What <span className="font-royal italic font-normal text-orange-700">Might Disappear</span>
          </h2>

          <p className="text-sm sm:text-base text-stone-600 mt-2 font-light leading-relaxed">
            India's heritage is not merely stones and palaces; it lives in the hands of weavers,
            blacksmiths, dancers, and folk storytellers. Discover ancestral traditions before the
            generational thread is lost.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={onOpenSaveMemory}
              className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-black text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              Contribute a Dying Craft / Tradition
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search craft, artisan or region..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Craft Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl bg-white border border-stone-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  {item.category}
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 font-heritage group-hover:text-amber-800 transition-colors">
                {item.title}
              </h3>

              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                <span className="text-[10px] text-amber-800 uppercase font-bold block">
                  Practitioner Guild
                </span>
                <span className="font-semibold text-stone-900">{item.practitioner}</span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mt-3">{item.description}</p>

              <div className="mt-3 text-[11px] text-stone-500">
                <strong className="text-stone-700">Raw Elements:</strong> {item.keyMaterial}
              </div>

              <div className="mt-3 p-2 rounded-lg bg-red-50/70 border border-red-100 text-[11px] text-red-900 flex items-start gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>{item.urgencyNote}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => onSelectPlace(item.location.split(',')[0].trim())}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors"
              >
                <span>Explore Location</span>
                <MapPin className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedCraft(item)}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
              >
                Reflections
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Community Reflections on Selected Craft */}
      {selectedCraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600">
                  {selectedCraft.category}
                </span>
                <h3 className="text-lg font-bold font-heritage text-stone-900">
                  {selectedCraft.title}
                </h3>
                <p className="text-xs text-stone-500">{selectedCraft.location}</p>
              </div>
              <button
                onClick={() => setSelectedCraft(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <CommentSection
              targetType="craft"
              targetId={selectedCraft.id}
              title={`Artisan Community Reflections: ${selectedCraft.title}`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
