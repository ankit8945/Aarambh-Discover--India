import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Compass,
  MapPin,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Ticket,
  Clock,
  Crown,
  Eye,
  Building,
  Globe,
  CheckCircle2,
  ExternalLink,
  Map,
  X,
  Share2,
} from 'lucide-react';
import { COMPREHENSIVE_MONUMENTS_DATABASE, HeritageMonument } from '../data/monumentsData';

interface HeritageViewProps {
  onSelectPlace: (placeName: string) => void;
  onOpenSaveMemory: (placeName?: string) => void;
}

const REGION_OPTIONS = ['All Regions', 'North', 'South', 'East', 'West', 'Central', 'Northeast'] as const;

const ARCHITECTURAL_STYLES = [
  'All Styles',
  'UNESCO World Heritage',
  'Nagara',
  'Dravidian',
  'Rock-Cut',
  'Mughal & Indo-Islamic',
  'Stepwell & Hydraulic',
  'Kalinga',
  'Hill Forts',
];

const CATEGORY_TABS = [
  { id: 'ALL', label: 'All Monuments' },
  { id: 'UNESCO', label: 'UNESCO World Heritage' },
  { id: 'ASI', label: 'ASI National Importance' },
  { id: 'TEMPLES', label: 'Sacred Temples' },
  { id: 'FORTS', label: 'Forts & Bastions' },
  { id: 'STEPWELLS', label: 'Stepwells & Water' },
  { id: 'CAVES', label: 'Rock-Cut & Caves' },
];

export const HeritageView: React.FC<HeritageViewProps> = ({
  onSelectPlace,
  onOpenSaveMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedStyle, setSelectedStyle] = useState<string>('All Styles');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedMonumentModal, setSelectedMonumentModal] = useState<HeritageMonument | null>(null);

  // Derive available unique states sorted
  const availableStates = useMemo(() => {
    const states = Array.from(new Set(COMPREHENSIVE_MONUMENTS_DATABASE.map((m) => m.state)));
    return ['All States', ...states.sort()];
  }, []);

  // Filtered monument dataset
  const filteredSites = useMemo(() => {
    return COMPREHENSIVE_MONUMENTS_DATABASE.filter((site) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        site.name.toLowerCase().includes(q) ||
        (site.hindiName && site.hindiName.toLowerCase().includes(q)) ||
        site.state.toLowerCase().includes(q) ||
        site.architectureStyle.toLowerCase().includes(q) ||
        site.significance.toLowerCase().includes(q) ||
        site.tags.some((t) => t.toLowerCase().includes(q)) ||
        (site.associatedDynasty && site.associatedDynasty.toLowerCase().includes(q));

      // 2. Region Filter
      const matchesRegion =
        selectedRegion === 'All Regions' || site.region === selectedRegion;

      // 3. State Filter
      const matchesState =
        selectedState === 'All States' || site.state === selectedState;

      // 4. Style Filter
      let matchesStyle = true;
      if (selectedStyle !== 'All Styles') {
        if (selectedStyle === 'UNESCO World Heritage') {
          matchesStyle = site.category === 'UNESCO World Heritage';
        } else {
          matchesStyle =
            site.architectureStyle.toLowerCase().includes(selectedStyle.toLowerCase()) ||
            site.tags.some((t) => t.toLowerCase().includes(selectedStyle.toLowerCase()));
        }
      }

      // 5. Category Tab Filter
      let matchesCat = true;
      if (selectedCategoryTab === 'UNESCO') {
        matchesCat = site.category === 'UNESCO World Heritage';
      } else if (selectedCategoryTab === 'ASI') {
        matchesCat = site.category === 'ASI Monument of National Importance' || site.category === 'UNESCO World Heritage';
      } else if (selectedCategoryTab === 'TEMPLES') {
        matchesCat = site.category === 'Sacred Temple Complex' || site.tags.some(t => t.toLowerCase().includes('temple') || t.toLowerCase().includes('mandir'));
      } else if (selectedCategoryTab === 'FORTS') {
        matchesCat = site.category === 'Ancient Fortification' || site.tags.some(t => t.toLowerCase().includes('fort'));
      } else if (selectedCategoryTab === 'STEPWELLS') {
        matchesCat = site.category === 'Stepwell & Water Architecture' || site.tags.some(t => t.toLowerCase().includes('stepwell'));
      } else if (selectedCategoryTab === 'CAVES') {
        matchesCat = site.category === 'Cave Complex & Rock Cut' || site.tags.some(t => t.toLowerCase().includes('cave') || t.toLowerCase().includes('rock cut'));
      }

      return matchesSearch && matchesRegion && matchesState && matchesStyle && matchesCat;
    });
  }, [searchQuery, selectedRegion, selectedState, selectedStyle, selectedCategoryTab]);

  const totalUnescoCount = useMemo(() => {
    return COMPREHENSIVE_MONUMENTS_DATABASE.filter((m) => m.category === 'UNESCO World Heritage').length;
  }, []);

  const totalStatesCovered = useMemo(() => {
    return new Set(COMPREHENSIVE_MONUMENTS_DATABASE.map((m) => m.state)).size;
  }, []);

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-stone-100 via-amber-50/40 to-stone-50 border-b border-stone-200 py-12 px-4 sm:px-6 text-stone-900">
        <div className="max-w-5xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold">
            <Landmark className="w-3.5 h-3.5 text-amber-700" />
            <span>Pan-India Archaeological & Architectural Heritage Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-royal tracking-tight text-stone-900">
            India’s Monumental <span className="font-royal italic font-normal text-amber-800">Heritage</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-3xl mx-auto font-light leading-relaxed">
            A comprehensive, verified compendium of <strong>{COMPREHENSIVE_MONUMENTS_DATABASE.length}+ landmark monuments</strong> spanning all Indian zones — from Mauryan & Gupta stupas and rock-cut Kailasa monoliths to Dravidian high vimanas, Rajput hill citadels, subterranean stepwells, and ancient universities.
          </p>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-stone-600 font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-2xs">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <strong>{totalUnescoCount}</strong> UNESCO World Heritage Sites
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <strong>{totalStatesCovered} States & UTs</strong> Covered
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ASI & UNESCO Grounded
            </span>
          </div>

          {/* Universal Monument Search Bar */}
          <div className="pt-3 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any monument, city, state, dynasty (e.g. Chola, Mughal, Rashtrakuta), or style..."
                className="w-full pl-11 pr-20 py-3.5 rounded-2xl bg-white border border-stone-300 text-stone-900 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Architectural Filter Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            {ARCHITECTURAL_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1 rounded-full border text-xs transition-colors cursor-pointer ${
                  selectedStyle === style
                    ? 'bg-stone-900 text-amber-300 font-bold border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-amber-500 hover:text-amber-900 shadow-2xs'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Controls Bar: Category Tabs, Regions, and State Dropdowns */}
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200 text-xs">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategoryTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryTab === tab.id
                    ? 'bg-stone-900 text-white font-bold shadow-xs'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Region & State Selectors Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
            {/* Region Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
              <span className="text-stone-500 font-semibold shrink-0 mr-1 text-[11px] uppercase tracking-wider">
                Zone:
              </span>
              {REGION_OPTIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                    selectedRegion === region
                      ? 'bg-amber-800 text-white font-bold shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* State Dropdown & Result Count */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label htmlFor="state-filter" className="text-stone-500 text-xs font-semibold shrink-0">
                State:
              </label>
              <select
                id="state-filter"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-600 cursor-pointer"
              >
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <h2 className="text-xl font-bold font-heritage text-stone-900">
              Documented Civilizational Monuments
            </h2>
            <p className="text-xs text-stone-500">
              Showing <strong>{filteredSites.length}</strong> of {COMPREHENSIVE_MONUMENTS_DATABASE.length} monumental complexes across India
            </p>
          </div>

          {(searchQuery || selectedRegion !== 'All Regions' || selectedState !== 'All States' || selectedStyle !== 'All Styles' || selectedCategoryTab !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('All Regions');
                setSelectedState('All States');
                setSelectedStyle('All Styles');
                setSelectedCategoryTab('ALL');
              }}
              className="text-xs text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-4 cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredSites.length === 0 && (
          <div className="p-12 text-center bg-stone-50 rounded-3xl border border-stone-200 space-y-4">
            <Building className="w-12 h-12 text-stone-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-stone-800">No monuments matched your filters</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Try clearing search terms or selecting "All Regions" and "All Styles" to browse the full pan-India catalog.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('All Regions');
                setSelectedState('All States');
                setSelectedStyle('All Styles');
                setSelectedCategoryTab('ALL');
              }}
              className="px-4 py-2 bg-stone-900 text-amber-300 rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Show All Monuments
            </button>
          </div>
        )}

        {/* Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md hover:border-amber-400/60 transition-all flex flex-col overflow-hidden group"
            >
              {/* Photo Banner with Real Image */}
              <div className="relative h-52 w-full bg-stone-900 overflow-hidden">
                <img
                  src={site.image}
                  alt={site.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/monuments/taj-mahal.jpg';
                  }}
                  className="w-full h-full object-cover filter brightness-80 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/30 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                    site.category === 'UNESCO World Heritage'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                      : 'bg-stone-900/90 text-stone-200 border-stone-600/40'
                  }`}>
                    {site.category === 'UNESCO World Heritage' ? '★ UNESCO World Heritage' : site.category}
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-stone-950/85 text-[10px] font-medium text-stone-200 border border-white/10 shadow-sm">
                    {site.region} India
                  </span>
                </div>

                {/* Bottom Overlay Info - Crisp Pod with No Blur */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 px-3 rounded-2xl bg-black/85 border border-white/20 flex items-center justify-between text-white text-xs shadow-lg">
                  <span className="flex items-center gap-1.5 font-semibold text-white drop-shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[170px]">{site.state}</span>
                  </span>
                  <span className="font-mono text-[10px] bg-stone-900/90 px-2 py-0.5 rounded-md text-amber-300 border border-amber-400/25 shrink-0">
                    {site.epoch}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div>
                    <h3 className="text-lg font-bold font-heritage text-stone-900 group-hover:text-amber-800 transition-colors leading-snug">
                      {site.name}
                    </h3>
                    {site.hindiName && (
                      <p className="text-xs font-serif text-amber-900/80 font-medium">
                        {site.hindiName}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3 font-light">
                    {site.significance}
                  </p>

                  {/* Architecture & Dynasty Grid */}
                  <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Style</span>
                      <span className="text-stone-800 font-medium line-clamp-1">{site.architectureStyle}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Dynasty / Era</span>
                      <span className="text-stone-800 font-medium line-clamp-1">{site.associatedDynasty || 'Recorded Antiquity'}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {site.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectPlace((site.name || '').split('(')[0].trim())}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-600 cursor-pointer"
                  >
                    <span>Deep Explore Memory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMonumentModal(site)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                      title="Quick Specs & Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenSaveMemory(site.name)}
                      className="text-[11px] text-stone-500 hover:text-stone-900 font-medium cursor-pointer"
                    >
                      + Memory
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote on ASI & Open Data Grounding */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              All monument chronologies, epigraphic records, and preservation bounds are cross-referenced with
              the Archaeological Survey of India (ASI), National Mission on Monuments and Antiquities (NMMA), and UNESCO World Heritage registers.
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-800 shrink-0">
            Grounding: ASI • UNESCO • SIH-2026
          </span>
        </div>
      </section>

      {/* Quick Monument Details Modal */}
      {selectedMonumentModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            {/* Modal Image Header */}
            <div className="relative h-64 w-full bg-stone-900">
              <img
                src={selectedMonumentModal.image}
                alt={selectedMonumentModal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none" />

              <button
                onClick={() => setSelectedMonumentModal(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-stone-950/90 border border-white/20 text-white hover:bg-stone-900 cursor-pointer transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 p-4 sm:p-5 rounded-2xl bg-black/85 border border-white/20 text-white space-y-1.5 shadow-2xl">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider inline-block shadow-sm">
                  {selectedMonumentModal.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-royal drop-shadow-md text-white">
                  {selectedMonumentModal.name}
                </h2>
                {selectedMonumentModal.hindiName && (
                  <p className="text-sm font-serif text-amber-300">
                    {selectedMonumentModal.hindiName}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider">Historical Significance</h4>
                <p className="text-sm text-stone-700 font-light leading-relaxed mt-1">
                  {selectedMonumentModal.significance}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Location</span>
                  <span className="font-semibold text-stone-800">{selectedMonumentModal.state} ({selectedMonumentModal.region} India)</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Epoch / Period</span>
                  <span className="font-semibold text-stone-800">{selectedMonumentModal.epoch}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Architectural Style</span>
                  <span className="font-semibold text-stone-800">{selectedMonumentModal.architectureStyle}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Materials Used</span>
                  <span className="font-semibold text-stone-800">{selectedMonumentModal.materials}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Associated Dynasty</span>
                  <span className="font-semibold text-stone-800">{selectedMonumentModal.associatedDynasty || 'Ancient Kings'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Visiting Window</span>
                  <span className="font-semibold text-stone-800">{selectedMonumentModal.bestVisitingTime || 'Year-round'}</span>
                </div>
              </div>

              {selectedMonumentModal.ticketInfo && (
                <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <Ticket className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{selectedMonumentModal.ticketInfo}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedMonumentModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const place = (selectedMonumentModal.name || '').split('(')[0].trim();
                    setSelectedMonumentModal(null);
                    onSelectPlace(place);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-800 text-white hover:bg-amber-900 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <span>Explore Cultural Memory Graph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
