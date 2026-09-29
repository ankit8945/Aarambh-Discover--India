import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAdminMemories } from '../services/api';
import { MemoryContribution } from '../types';
import {
  Sparkles,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Upload,
  User,
  Heart,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

interface CreatorDashboardViewProps {
  onOpenSaveMemory: () => void;
}

export const CreatorDashboardView: React.FC<CreatorDashboardViewProps> = ({
  onOpenSaveMemory,
}) => {
  const { user, openAuthModal } = useAuth();
  const [myContributions, setMyContributions] = useState<MemoryContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCreatorData() {
      try {
        setLoading(true);
        const all = await fetchAdminMemories();
        // filter by this user or general creator posts
        const mine = all.filter(
          (m) => m.contributorId === user?.id || m.contributorRole === 'CULTURAL_CREATOR'
        );
        setMyContributions(mine);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCreatorData();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Guest Mode Sign-In Banner */}
      {user?.isGuest && (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-stone-900 border border-orange-500/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-amber-100 font-heritage">
                Sign in with Google to Publish as a Verified Contributor
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Link your lore, oral traditions, and craftsmanship directly to your personal Google / Gmail credentials.
              </p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('CULTURAL_CREATOR')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md shrink-0 cursor-pointer transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Sign in with Google</span>
          </button>
        </div>
      )}

      {/* Artisan Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-950 via-stone-900 to-stone-900 border border-orange-900/40 p-6 sm:p-8 text-stone-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-300 flex items-center justify-center font-heritage text-2xl font-bold shrink-0 overflow-hidden">
            {user?.avatar || user?.photoURL ? (
              <img
                src={user.avatar || user.photoURL}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : user?.name ? (
              user.name[0].toUpperCase()
            ) : (
              'C'
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3" />
              Verified Living Heritage Practitioner
              {user?.authProvider === 'google' && !user.isGuest && ' • Google Account'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heritage text-amber-100 flex items-center gap-2">
              <span>{user?.name || 'Artisan Workshop'}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300 mt-1">
              <span className="text-orange-400 font-semibold">
                {user?.culturalSpecialization || 'Traditional Craft & Performing Lore'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                {user?.associatedLocation || 'Varanasi, Uttar Pradesh'}
              </span>
              {!user?.isGuest && user?.email && (
                <>
                  <span>•</span>
                  <span className="text-stone-400 font-mono text-[11px]">
                    {user.email}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSaveMemory}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-stone-950 font-bold text-xs transition-all shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Publish New Craft or Oral Tradition</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase font-bold tracking-wider mb-2">
            <Upload className="w-4 h-4 text-orange-500" />
            Published Living Records
          </div>
          <div className="text-3xl font-bold font-heritage text-stone-900 mt-1">
            {myContributions.length}
          </div>
          <p className="text-sm text-stone-600 mt-2">Inscribed into the National Living Memory Layer</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase font-bold tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Verification Status
          </div>
          <div className="text-2xl font-bold font-heritage text-emerald-700 mt-1">
            Active Guild Member
          </div>
          <p className="text-sm text-stone-600 mt-2">Eligible for SIH Heritage Preservation grants</p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase font-bold tracking-wider mb-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            Direct Workshop Inquiries
          </div>
          <div className="text-3xl font-bold font-heritage text-orange-700 mt-1">Live</div>
          <p className="text-sm text-stone-600 mt-2">Grounded in Aarambh verified regional coordinates</p>
        </div>
      </div>

      {/* Published Works */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <h3 className="text-xl sm:text-2xl font-bold font-heritage text-stone-900">
            My Heritage Contributions & Craft Documentation
          </h3>
          <span className="text-sm text-stone-500 font-bold bg-stone-100 px-3 py-1 rounded-full">{myContributions.length} submissions</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm font-bold text-stone-400 animate-pulse">
            Loading artisan studio records...
          </div>
        ) : myContributions.length === 0 ? (
          <div className="py-20 px-6 rounded-[2.5rem] bg-stone-50 border-2 border-dashed border-stone-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">No craft traditions published yet</h4>
            <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto leading-relaxed">
              Document your generational tools, loom setup, metal alloy compositions, or folk songs
              to preserve them forever in the cultural graph.
            </p>
            <button
              onClick={onOpenSaveMemory}
              className="mt-6 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Document My First Craft Tradition
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myContributions.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-[2rem] bg-white border border-stone-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden relative"
              >
                {/* Optional Top Right Decor */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-stone-50 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] uppercase font-extrabold px-3 py-1 rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
                      {item.mediaType}
                    </span>
                    <span
                      className={`text-[10px] px-3 py-1 rounded-lg font-extrabold uppercase border ${
                        item.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.verificationStatus}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold font-heritage text-stone-900 mb-2 leading-snug">{item.title}</h4>
                  
                  <p className="text-xs text-stone-500 mb-4 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    {item.placeName}
                  </p>
                  
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-200 rounded-full" />
                    <p className="text-sm text-stone-600 pl-4 py-1 leading-relaxed line-clamp-4 italic">
                      "{item.content}"
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-medium">Inscribed {new Date(item.timestamp).toLocaleDateString()}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Recorded
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
