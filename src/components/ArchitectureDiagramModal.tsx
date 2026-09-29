import React from 'react';
import {
  User,
  Layout,
  Navigation,
  Train,
  CloudSun,
  MapPin,
  Calendar,
  CheckSquare,
  BadgePercent,
  Server,
  Cpu,
  BrainCircuit,
  Database,
  Globe,
  ArrowDown,
  Layers,
  Sparkles,
  ShieldCheck,
  Compass,
  FileDown,
  Zap,
  Camera,
  Award,
  Share2,
  BookOpen,
  Volume2,
} from 'lucide-react';

interface ArchitectureDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDiagramModal: React.FC<ArchitectureDiagramModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-5xl w-full max-h-[92dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4 sm:my-8 shrink-0">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 bg-stone-50/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-900 text-amber-100 flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 font-heritage">
                Aarambh Sovereign System Architecture
              </h2>
              <p className="text-xs text-stone-500">
                End-to-End Civilizational Intelligence & Living Heritage Engine Blueprint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors text-xs font-semibold cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Scrollable Diagram Canvas */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-6 bg-stone-50/50">
          {/* USER INTERACTION LAYER */}
          <div className="flex items-center justify-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white border border-stone-300 shadow-xs flex items-center gap-2 text-xs font-semibold text-stone-800">
              <User className="w-4 h-4 text-amber-700" />
              <span>Cultural Traveler / Living Heritage Contributor (Web Browser & PWA)</span>
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-4 h-4 text-stone-400" />
          </div>

          {/* LAYER 1: CLIENT PRESENTATION (REACT 18) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/90 shadow-xs space-y-3 relative">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-amber-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Layer 1: Sovereign Client Applications (React 18 + TypeScript + Vite + Tailwind)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-mono font-medium">
                PWA • Sub-50ms Latency
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              {/* Feature 1: Heritage Scanner */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Camera className="w-3.5 h-3.5 text-amber-700" />
                  <span>AI Heritage Scanner</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Camera lens + multi-modal masonry contour analysis & proximity radar alerts.
                </p>
              </div>

              {/* Feature 2: Digital Yatra Passport */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Digital Yatra Passport</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Sovereign leatherette booklet, live rubber ink stamp physics, XP & MRZ identity code.
                </p>
              </div>

              {/* Feature 3: 3D E-Visit Sanctum */}
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>3D E-Visit Sanctum</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  360° virtual temple darshans, synthesized Vedic chants & interactive pooja rituals.
                </p>
              </div>

              {/* Feature 4: Traveler Hub & Fair Transit */}
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Traveler Hub & Fair Tariffs</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  State tariff auto/taxi fare calculator, direct 0% commission UPI artisan bazaar.
                </p>
              </div>

              {/* Feature 5: Daily Cultural Quiz & Polls */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-600" />
                  <span>Daily Quiz & Polls</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Vedic astronomy & dynasty trivia, community preservation votes, streak bonuses.
                </p>
              </div>

              {/* Feature 6: Web Share API */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Share2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Web Share API Hub</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  One-click native OS sharing for cultural ranks, monument discoveries, and quiz streaks.
                </p>
              </div>

              {/* Feature 7: Smart Itinerary & IRCTC */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Train className="w-3.5 h-3.5 text-amber-700" />
                  <span>IRCTC & Weather HUD</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Rail corridor schedules, rain probability adaptation, and packing checklists.
                </p>
              </div>

              {/* Feature 8: Localization & Voice */}
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>10+ Languages Engine</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Bilingual English/Hindi & regional scripts with text-to-speech audio guide synthesis.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-4 h-4 text-stone-400" />
          </div>

          {/* LAYER 2: API GATEWAY & CLIENT STORE */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Layer 2: API Gateway & Persistence (REST, Web Audio & Local Storage)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-mono">
                /src/services/api.ts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  REST API Client
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Dispatches asynchronous JSON calls with automatic fallback heuristics & network retry handlers.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-blue-600" />
                  Local State Cache
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Stores checklist completion state, digital passport ink stamps, and active circuit drafts.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Security Boundary
                </span>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Zero client-side secrets exposed. Server-side proxy routes for external AI inference.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-4 h-4 text-stone-400" />
          </div>

          {/* LAYER 3: BACKEND SYNTHESIS ENGINE (EXPRESS.JS SERVER) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-stone-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Layer 3: Backend Processing Engine (Express.js / Node.js • server.ts:3000)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-mono">
                Node.js Backend
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5 text-amber-700" />
                  Cultural Intelligence
                </span>
                <p className="text-[11px] text-stone-500">
                  Gemini pipeline synthesizing verified ASI/UNESCO sites, living artisans, and lore.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <Train className="w-3.5 h-3.5 text-amber-700" />
                  Rail Corridor Node
                </span>
                <p className="text-[11px] text-stone-500">
                  Station code resolver, train timetable matching (Vande Bharat, Rajdhani, Shatabdi).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-blue-600" />
                  Meteorological Sync
                </span>
                <p className="text-[11px] text-stone-500">
                  Calculates micro-climates, rain probability, and triggers midday heat advisories.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <BadgePercent className="w-3.5 h-3.5 text-emerald-700" />
                  Budget & Pacing
                </span>
                <p className="text-[11px] text-stone-500">
                  Travel buffer ratios, itemized stay/train/food cost breakdown per person.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <ArrowDown className="w-4 h-4 text-stone-400" />
          </div>

          {/* LAYER 4: EXTERNAL CLOUD PROVIDERS & APIS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-300/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-900" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Layer 4: External Providers, Planetary Networks & Sovereign DPI
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[11px] font-mono">
                Live Data Feeds & DPI
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-amber-200/90 space-y-1 shadow-2xs">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Gemini 2.5 Vision
                </span>
                <p className="text-[11px] text-stone-500">
                  Generative cultural synthesis & historical accuracy engine.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-amber-200/90 space-y-1 shadow-2xs">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  UPI & State Tariffs
                </span>
                <p className="text-[11px] text-stone-500">
                  Direct artisan payments & official RTO fare matrices.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-amber-200/90 space-y-1 shadow-2xs">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-amber-700" />
                  Indian Railways
                </span>
                <p className="text-[11px] text-stone-500">
                  IRCTC official timetable database and station registries.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-amber-200/90 space-y-1 shadow-2xs">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  OpenStreetMap / OSRM
                </span>
                <p className="text-[11px] text-stone-500">
                  Cartographic tiles, Nominatim geocoding, driving waypoints.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>Aarambh Civilizational Intelligence Architecture • 4-Tier Separation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
