import React, { useState, useEffect } from 'react';
import {
  Camera,
  Music,
  BookOpen,
  Utensils,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Volume2,
  Heart,
  MessageSquare,
  Share2,
  ChevronRight,
  User,
  Plus,
} from 'lucide-react';
import { fetchMemories } from '../services/api';
import { MemoryContribution } from '../types';

interface MemoryViewProps {
  onOpenSaveMemory: (placeName?: string) => void;
  onSelectPlace: (placeName: string) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  onOpenSaveMemory,
  onSelectPlace,
}) => {
  const [memories, setMemories] = useState<MemoryContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await fetchMemories();
        setMemories(list);
      } catch (err) {
        console.error('Failed to load community memories', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.placeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.detectedLanguage && m.detectedLanguage.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = activeType === 'all' || m.mediaType === activeType;
    return matchesSearch && matchesType;
  });

  const categories = [
    { id: 'all', label: 'All Living Memories', icon: Sparkles },
    { id: 'story', label: 'Oral Lore & Legends', icon: BookOpen },
    { id: 'song', label: 'Folk Songs & Chants', icon: Music },
    { id: 'recipe', label: 'Heirloom Recipes', icon: Utensils },
    { id: 'craft', label: 'Artisan Techniques', icon: Sparkles },
    { id: 'photo', label: 'Historic Sites & Photos', icon: Camera },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 py-12 px-4 sm:px-6 text-stone-100 border-b border-stone-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-4xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Participatory Living Archive • Preserving What Might Disappear
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold font-heritage tracking-tight text-amber-100">
            COMMUNITY MEMORY LAYER
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
            Unwritten oral histories, grandmother's forgotten harvest recipes, village bards' chants,
            and generational crafts documented directly by citizens, creators, and curators across India.
          </p>

          {/* Primary CTA button */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => onOpenSaveMemory()}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Record & Save a Memory</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeType === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveType(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lore, places, recipes..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Memories Masonry / Grid */}
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs">
            Loading verified community memory records...
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-stone-200 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="text-base font-bold font-heritage text-stone-800">
              No memories found matching your filter
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Be the first to record a disappearing craft, song, or oral story for this category.
            </p>
            <button
              onClick={() => onOpenSaveMemory()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              + Contribute First Memory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMemories.map((mem) => {
              const isLiked = !!likedIds[mem.id];
              return (
                <div
                  key={mem.id}
                  className="rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Photo or Rich Media Header */}
                  {mem.mediaUrl ? (
                    <div className="relative h-44 w-full bg-stone-900 overflow-hidden">
                      <img
                        src={mem.mediaUrl}
                        alt={mem.title}
                        className="w-full h-full object-cover filter brightness-85"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/40 pointer-events-none" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-950/90 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/40 shadow-md">
                        {mem.mediaType}
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-r from-amber-50 via-orange-50/50 to-stone-50 border-b border-stone-100 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                        {mem.mediaType}
                      </span>
                      {mem.detectedLanguage && (
                        <span className="text-[10px] font-mono text-stone-500">
                          {mem.detectedLanguage}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectPlace(mem.placeName)}
                          className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline truncate"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span className="truncate">{mem.placeName}</span>
                        </button>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            mem.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {mem.verificationStatus === 'VERIFIED' ? '✓ Verified' : 'Under Review'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-heritage text-stone-900 leading-snug">
                        {mem.title}
                      </h3>

                      <p className="text-xs text-stone-600 leading-relaxed font-light line-clamp-4">
                        {mem.content}
                      </p>

                      {/* Audio Transcript snippet if exists */}
                      {mem.audioTranscript && (
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span className="italic line-clamp-2">"{mem.audioTranscript}"</span>
                        </div>
                      )}

                      {/* Extracted Entities Chips */}
                      {mem.extractedEntities && mem.extractedEntities.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {mem.extractedEntities.slice(0, 3).map((ent, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px]"
                            >
                              #{ent}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contributor & Verification Footer */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>{mem.contributorName}</span>
                        <span className="text-[10px] text-stone-400">
                          ({mem.contributorRole === 'CULTURAL_CREATOR' ? 'Artisan' : 'Citizen'})
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLike(mem.id)}
                          className={`flex items-center gap-1 text-xs cursor-pointer transition-colors ${
                            isLiked ? 'text-red-600 font-bold' : 'text-stone-400 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600' : ''}`} />
                          <span className="text-[11px]">{isLiked ? 1 : 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
