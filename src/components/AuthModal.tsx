import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  X,
  ShieldCheck,
  Sparkles,
  Compass,
  CheckCircle2,
  ChevronRight,
  User,
  ArrowLeft,
  Lock,
  Mail,
  MapPin,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signIn, signInWithGoogle, preferredAuthRole } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('TRAVELER');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [useCustomGoogleInput, setUseCustomGoogleInput] = useState(false);

  // Contributor specific fields
  const [culturalSpecialization, setCulturalSpecialization] = useState('Banarasi Zari & Brocade Weaving');
  const [associatedLocation, setAssociatedLocation] = useState('Varanasi, Uttar Pradesh');

  // Manual email fallback
  const [showManualEmailForm, setShowManualEmailForm] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');

  const [loading, setLoading] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Detected active Google account (primary from metadata / session)
  const detectedGoogleEmail = 'oneandonlyarun2005@gmail.com';
  const detectedGoogleName = 'Arun';

  useEffect(() => {
    if (preferredAuthRole) {
      setSelectedRole(preferredAuthRole);
    }
  }, [preferredAuthRole, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Handle Google Sign In with selected account
  const handleProceedGoogleSignIn = async (emailToUse: string, nameToUse: string) => {
    if (!emailToUse) return;
    setLoading(true);
    setAuthSuccessMsg(null);
    setAuthErrorMsg(null);
    try {
      // Generate clean Google colorful avatar letter
      const initial = (nameToUse || emailToUse)[0].toUpperCase();
      const googleAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(nameToUse || 'User')}&background=ea4335&color=fff&rounded=true&bold=true`;

      await signInWithGoogle({
        role: selectedRole,
        email: emailToUse,
        name: nameToUse || emailToUse.split('@')[0],
        avatar: googleAvatar,
        photoURL: googleAvatar,
        culturalSpecialization: selectedRole === 'CULTURAL_CREATOR' ? culturalSpecialization : undefined,
        associatedLocation: selectedRole === 'CULTURAL_CREATOR' ? associatedLocation : undefined,
      });

      setAuthSuccessMsg(
        selectedRole === 'CULTURAL_CREATOR'
          ? `Welcome ${nameToUse || 'Contributor'}! Cultural Contributor Studio unlocked.`
          : `Welcome ${nameToUse || 'Traveler'}! Heritage Traveler Passport ready.`
      );
      setTimeout(() => {
        setAuthSuccessMsg(null);
        setShowGoogleChooser(false);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setAuthErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail) return;
    setLoading(true);
    setAuthErrorMsg(null);
    try {
      await signIn(
        selectedRole,
        manualEmail,
        manualName || undefined,
        selectedRole === 'CULTURAL_CREATOR' ? culturalSpecialization : undefined,
        selectedRole === 'CULTURAL_CREATOR' ? associatedLocation : undefined
      );
    } catch (err: any) {
      console.error(err);
      setAuthErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800/90 rounded-3xl p-6 sm:p-7 text-stone-100 shadow-2xl my-8 overflow-hidden shrink-0">
        {/* Subtle decorative heritage radial glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-stone-950 font-heritage font-bold text-sm shadow-md">
              आ
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heritage text-amber-100">
                Sign in to AARAMBH
              </h2>
              <p className="text-[11px] text-stone-400">
                India's Living Memory Layer & Heritage Passport
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast notification */}
        {authSuccessMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{authSuccessMsg}</span>
          </div>
        )}

        {/* Error toast notification */}
        {authErrorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-semibold">{authErrorMsg}</span>
          </div>
        )}

        {/* VIEW 1: GOOGLE ACCOUNT CHOOSER DIALOG */}
        {showGoogleChooser ? (
          <div className="py-4 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGoogleChooser(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
                title="Back to role selection"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {/* Official Google G Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span className="text-sm font-semibold text-stone-200">
                  Choose a Google / Gmail account
                </span>
              </div>
            </div>

            {/* Role Reminder Pill */}
            <div className="px-3.5 py-2 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400">Signing in as:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  selectedRole === 'CULTURAL_CREATOR'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : selectedRole === 'ADMIN'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {selectedRole === 'CULTURAL_CREATOR'
                  ? '🎨 Cultural Contributor'
                  : selectedRole === 'ADMIN'
                  ? '🏛️ Curator Admin'
                  : '🧭 Heritage Traveler'}
              </span>
            </div>

            {/* Detected Account Quick Tap */}
            {!useCustomGoogleInput ? (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    handleProceedGoogleSignIn(detectedGoogleEmail, detectedGoogleName)
                  }
                  className="w-full p-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800/80 border border-stone-700/80 text-left flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-emerald-600 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {detectedGoogleName[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-stone-100 group-hover:text-amber-200 transition-colors flex items-center gap-1.5">
                        <span>{detectedGoogleName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-400 font-mono">
                          Active
                        </span>
                      </div>
                      <div className="text-xs text-stone-400 font-mono">
                        {detectedGoogleEmail}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-colors" />
                </button>

                {/* Option to use another Gmail account */}
                <button
                  type="button"
                  onClick={() => setUseCustomGoogleInput(true)}
                  className="w-full p-3 rounded-xl border border-dashed border-stone-700 hover:border-stone-500 hover:bg-stone-950/40 text-stone-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Use another Google / Gmail account</span>
                </button>
              </div>
            ) : (
              /* Custom Gmail Input Form */
              <div className="space-y-3 p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
                <div className="text-xs font-semibold text-stone-300">
                  Enter your Google Account email
                </div>
                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Gmail or Google Workspace Address
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setUseCustomGoogleInput(false)}
                    className="text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Back to detected account
                  </button>

                  <button
                    type="button"
                    disabled={loading || !googleEmailInput}
                    onClick={() =>
                      handleProceedGoogleSignIn(googleEmailInput, googleNameInput)
                    }
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Authenticating...' : 'Continue'}
                  </button>
                </div>
              </div>
            )}

            {/* Contributor Profile Enrichment (Optional Customization) */}
            {selectedRole === 'CULTURAL_CREATOR' && (
              <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-900/40 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Artisan & Storyteller Profile Details</span>
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">
                    Heritage Craft or Living Lore
                  </label>
                  <input
                    type="text"
                    value={culturalSpecialization}
                    onChange={(e) => setCulturalSpecialization(e.target.value)}
                    placeholder="e.g. Madhubani Folk Art, Kathakali, Terracotta"
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 mb-1">
                    Ancestral Region / City
                  </label>
                  <input
                    type="text"
                    value={associatedLocation}
                    onChange={(e) => setAssociatedLocation(e.target.value)}
                    placeholder="e.g. Mithila, Bihar or Thanjavur, Tamil Nadu"
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Google Notice Disclaimer */}
            <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-[11px] text-stone-400 leading-relaxed flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                AARAMBH will use your Google account info to personalize your verified heritage profile, digital stamps, and community submissions.
              </span>
            </div>
          </div>
        ) : (
          /* VIEW 2: PRIMARY ROLE SELECTION & GOOGLE SIGN IN */
          <div className="py-4 space-y-5">
            {/* Step 1: Persona Track Selection */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
                1. Select your journey in AARAMBH
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Traveler Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('TRAVELER')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    selectedRole === 'TRAVELER'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-100 ring-2 ring-amber-500/50 shadow-lg shadow-amber-950/20'
                      : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <Compass className="w-5 h-5" />
                    </div>
                    {selectedRole === 'TRAVELER' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-stone-100 font-heritage">
                    Heritage Traveler
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold mb-1">
                    यात्री • Explorer
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Save personalized trails, earn Digital Passport stamps & explore 3D E-Visits.
                  </p>
                </button>

                {/* Contributor Card */}
                <button
                  type="button"
                  onClick={() => setSelectedRole('CULTURAL_CREATOR')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    selectedRole === 'CULTURAL_CREATOR'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-100 ring-2 ring-orange-500/50 shadow-lg shadow-orange-950/20'
                      : 'border-stone-800 bg-stone-950/50 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    {selectedRole === 'CULTURAL_CREATOR' && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-stone-100 font-heritage">
                    Cultural Contributor
                  </div>
                  <div className="text-[10px] text-orange-400 font-semibold mb-1">
                    योगदानकर्ता • Artisan & Lore
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Document oral memories, artisan crafts, folklore & sacred shrines into India's Living Memory Layer.
                  </p>
                </button>
              </div>
            </div>

            {/* Step 2: High-Visibility Google Sign-In Button */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                2. Instant Authentication
              </div>

              {/* Primary Google Button */}
              <button
                type="button"
                onClick={() => setShowGoogleChooser(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer group"
              >
                {/* Official Google G Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>
                  Sign in with Google as{' '}
                  {selectedRole === 'CULTURAL_CREATOR' ? 'Contributor' : 'Traveler'}
                </span>
              </button>

              <div className="text-center text-[11px] text-stone-400">
                Supports any personal <span className="text-amber-300 font-mono">@gmail.com</span> or Google Workspace account
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-end text-xs text-stone-400">
              <button
                type="button"
                onClick={() => setShowManualEmailForm(!showManualEmailForm)}
                className="text-stone-400 hover:text-stone-200 underline cursor-pointer"
              >
                {showManualEmailForm ? 'Hide email form' : 'Or use standard email'}
              </button>
            </div>

            {/* Collapsible Manual Email Form */}
            {showManualEmailForm && (
              <form onSubmit={handleManualSubmit} className="space-y-3 pt-3 border-t border-stone-800 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Meera Sen"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !manualEmail}
                  className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {loading ? 'Entering...' : 'Continue with Email'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
