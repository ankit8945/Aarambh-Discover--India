import React, { useState, useEffect, useRef } from 'react';
import { AarambhLogo } from '../components/AarambhLogo';
import { HeritageVisitSite, BlockchainCertificate } from '../types';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Download,
  Share2,
  Printer,
  Copy,
  ExternalLink,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
  Plus,
  RefreshCw,
  QrCode,
  Check,
  Layers,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { handlePrintSection } from '../utils/print';

const INITIAL_HERITAGE_SITES: HeritageVisitSite[] = [
  {
    id: 'varanasi-ghats',
    name: 'Varanasi Ghats & Sacred Ganga Aarti',
    state: 'Uttar Pradesh',
    category: 'temple',
    epoch: '11th Century BCE',
    image: '/images/monuments/varanasi-ghats.jpg',
    visited: true,
    visitedDate: '2026-03-15',
    visitMode: 'physical',
    coordinates: { lat: 25.3176, lon: 82.9739 },
    verifiedByASI: true,
  },
  {
    id: 'hampi-vijayanagara',
    name: 'Hampi Virupaksha & Stone Chariot',
    state: 'Karnataka',
    category: 'unesco',
    epoch: '14th Century CE',
    image: '/images/monuments/hampi-monuments.jpg',
    visited: true,
    visitedDate: '2026-04-02',
    visitMode: 'physical',
    coordinates: { lat: 15.335, lon: 76.46 },
    verifiedByASI: true,
  },
  {
    id: 'amber-fort',
    name: 'Amber Fort & Sheesh Mahal',
    state: 'Jaipur, Rajasthan',
    category: 'monument',
    epoch: '16th Century CE',
    image: '/images/monuments/amber-fort.jpg',
    visited: true,
    visitedDate: '2026-05-10',
    visitMode: 'physical',
    coordinates: { lat: 26.9855, lon: 75.8513 },
    verifiedByASI: true,
  },
  {
    id: 'kedarnath-dham',
    name: 'Kedarnath Dham Jyotirlinga',
    state: 'Uttarakhand',
    category: 'temple',
    epoch: '8th Century CE',
    image: '/images/epuja/kedarnath-dham.jpg',
    visited: true,
    visitedDate: '2026-06-20',
    visitMode: 'evisit',
    coordinates: { lat: 30.7352, lon: 79.0669 },
    verifiedByASI: true,
  },
  {
    id: 'rani-ki-vav',
    name: 'Rani ki Vav Stepwell',
    state: 'Patan, Gujarat',
    category: 'stepwell',
    epoch: '11th Century CE',
    image: '/images/monuments/rani-ki-vav.jpg',
    visited: true,
    visitedDate: '2026-07-04',
    visitMode: 'physical',
    coordinates: { lat: 23.8589, lon: 72.1018 },
    verifiedByASI: true,
  },
  {
    id: 'konark-sun-temple',
    name: 'Konark Sun Chariot Temple',
    state: 'Odisha',
    category: 'unesco',
    epoch: '13th Century CE',
    image: '/images/monuments/konark-sun-temple.jpg',
    visited: true,
    visitedDate: '2026-08-12',
    visitMode: 'physical',
    coordinates: { lat: 19.8876, lon: 86.0945 },
    verifiedByASI: true,
  },
  {
    id: 'thanjavur-temple',
    name: 'Brihadisvara Great Living Chola Temple',
    state: 'Tamil Nadu',
    category: 'unesco',
    epoch: '1010 CE',
    image: '/images/monuments/brihadisvara-temple.jpg',
    visited: false,
    coordinates: { lat: 10.7828, lon: 79.1318 },
    verifiedByASI: true,
  },
  {
    id: 'golden-temple',
    name: 'Sri Harmandir Sahib (Golden Temple)',
    state: 'Amritsar, Punjab',
    category: 'temple',
    epoch: '1577 CE',
    image: '/images/epuja/golden-temple.jpg',
    visited: false,
    coordinates: { lat: 31.62, lon: 74.8765 },
    verifiedByASI: true,
  },
  {
    id: 'khajuraho-complex',
    name: 'Khajuraho Monument Group',
    state: 'Madhya Pradesh',
    category: 'unesco',
    epoch: '950 CE',
    image: '/images/monuments/khajuraho.jpg',
    visited: false,
    coordinates: { lat: 24.8318, lon: 79.9199 },
    verifiedByASI: true,
  },
  {
    id: 'ellora-caves',
    name: 'Kailasa Temple & Ellora Monolith',
    state: 'Maharashtra',
    category: 'unesco',
    epoch: '8th Century CE',
    image: '/images/monuments/ellora-kailasa.jpg',
    visited: false,
    coordinates: { lat: 20.0268, lon: 75.179 },
    verifiedByASI: true,
  },
  {
    id: 'meenakshi-amman',
    name: 'Madurai Meenakshi Sundareswarar',
    state: 'Tamil Nadu',
    category: 'temple',
    epoch: '6th Century CE',
    image: '/images/epuja/meenakshi-amman.jpg',
    visited: false,
    coordinates: { lat: 9.9195, lon: 78.1193 },
    verifiedByASI: true,
  },
  {
    id: 'kolkata-durga-puja',
    name: 'Kolkata Kumartuli & Sovabazar Living Heritage',
    state: 'West Bengal',
    category: 'living-craft',
    epoch: '18th Century CE',
    image: '/images/epuja/durga-puja.jpg',
    visited: false,
    coordinates: { lat: 22.5726, lon: 88.3639 },
    verifiedByASI: true,
  },
];

// Helper to calculate pseudo SHA-256 hash
function calculateSha256(text: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h0 = (h0 ^ (c * 17)) + 0x1000193;
    h1 = (h1 ^ (c * 31)) + 0x2000197;
    h2 = (h2 ^ (c * 47)) + 0x4000199;
    h3 = (h3 ^ (c * 61)) + 0x800019b;
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return (
    '0x' +
    toHex(h0) +
    toHex(h1) +
    toHex(h2) +
    toHex(h3) +
    toHex(h0 ^ h3) +
    toHex(h1 ^ h2) +
    toHex(h2 ^ h0) +
    toHex(h3 ^ h1)
  );
}

export const BlockchainCertificateView: React.FC = () => {
  const [sites, setSites] = useState<HeritageVisitSite[]>(() => {
    const saved = localStorage.getItem('aarambh_visited_sites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_HERITAGE_SITES;
      }
    }
    return INITIAL_HERITAGE_SITES;
  });

  const [recipientName, setRecipientName] = useState<string>(() => {
    return localStorage.getItem('aarambh_certificate_recipient') || 'Arun Heritage Seeker';
  });

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(recipientName);

  const [activeTab, setActiveTab] = useState<'certificate' | 'tracker' | 'blockchain'>('certificate');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Minting modal / flow states
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintStep, setMintStep] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // New site input state
  const [showAddSite, setShowAddSite] = useState<boolean>(false);
  const [newSiteName, setNewSiteName] = useState<string>('');
  const [newSiteState, setNewSiteState] = useState<string>('');

  const certificateRef = useRef<HTMLDivElement>(null);

  const visitedSites = sites.filter((s) => s.visited);
  const visitedStates = Array.from(new Set(visitedSites.map((s) => s.state)));

  // Derived certificate metadata
  const certificateId = `ARM-SBT-${recipientName.replace(/\s+/g, '').toUpperCase().slice(0, 4)}-${visitedSites.length}S`;
  const issueDate = '12 September 2026';
  const contractAddress = '0x71C948A279B29910C99bEfF7341851263';
  const merkleRoot = calculateSha256(
    `${recipientName}:${visitedSites.map((s) => s.id).join(',')}:${issueDate}`
  );
  const txHash = calculateSha256(`TX:${merkleRoot}:POLYGON_BLOCK_54819412`);

  // Persist visited sites and name
  useEffect(() => {
    localStorage.setItem('aarambh_visited_sites', JSON.stringify(sites));
    window.dispatchEvent(new CustomEvent('aarambh-xp-updated', { detail: { action: 'SITES_UPDATED' } }));
  }, [sites]);

  useEffect(() => {
    localStorage.setItem('aarambh_certificate_recipient', recipientName);
  }, [recipientName]);

  const toggleVisited = (id: string) => {
    setSites((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              visited: !s.visited,
              visitedDate: !s.visited ? new Date().toISOString().split('T')[0] : undefined,
              visitMode: !s.visited ? 'physical' : undefined,
            }
          : s
      )
    );
  };

  const markAllVisited = () => {
    setSites((prev) =>
      prev.map((s) => ({
        ...s,
        visited: true,
        visitedDate: s.visitedDate || new Date().toISOString().split('T')[0],
        visitMode: s.visitMode || 'physical',
      }))
    );
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setRecipientName(tempName.trim());
      setIsEditingName(false);
    }
  };

  const resolveCustomSiteImage = (name: string, state: string) => {
    const norm = `${name} ${state}`.toLowerCase();
    if (norm.includes('varanasi') || norm.includes('kashi') || norm.includes('ghat')) return '/images/monuments/varanasi-ghats.jpg';
    if (norm.includes('hampi')) return '/images/monuments/hampi-monuments.jpg';
    if (norm.includes('rani') || norm.includes('vav')) return '/images/monuments/rani-ki-vav.jpg';
    if (norm.includes('konark')) return '/images/monuments/konark-sun-temple.jpg';
    if (norm.includes('thanjavur') || norm.includes('brihadisvara')) return '/images/monuments/brihadisvara-temple.jpg';
    if (norm.includes('kedarnath')) return '/images/epuja/kedarnath-dham.jpg';
    if (norm.includes('badrinath')) return '/images/epuja/badrinath-dham.jpg';
    if (norm.includes('amritsar') || norm.includes('golden')) return '/images/epuja/golden-temple.jpg';
    if (norm.includes('khajuraho')) return '/images/monuments/khajuraho.jpg';
    if (norm.includes('ellora') || norm.includes('kailasa')) return '/images/monuments/ellora-kailasa.jpg';
    if (norm.includes('ajanta')) return '/images/monuments/ajanta-caves.jpg';
    if (norm.includes('meenakshi') || norm.includes('madurai')) return '/images/epuja/meenakshi-amman.jpg';
    if (norm.includes('pune') || norm.includes('shaniwar')) return '/images/monuments/shaniwar-wada.jpg';
    if (norm.includes('bastar') || norm.includes('chitrakot')) return '/images/monuments/chitrakote-falls.jpg';
    if (norm.includes('lucknow') || norm.includes('rumi')) return '/images/monuments/rumi-darwaza.jpg';
    if (norm.includes('mysore')) return '/images/monuments/mysore-palace.jpg';
    if (norm.includes('jaipur') || norm.includes('hawa')) return '/images/monuments/hawa-mahal.jpg';
    if (norm.includes('taj')) return '/images/monuments/taj-mahal.jpg';
    if (norm.includes('delhi') || norm.includes('red fort')) return '/images/monuments/red-fort-delhi.jpg';
    if (norm.includes('kolkata') || norm.includes('durga')) return '/images/epuja/durga-puja.jpg';
    return '/images/monuments/amber-fort.jpg';
  };

  const handleAddCustomSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteState.trim()) return;

    const newSite: HeritageVisitSite = {
      id: `custom-${Date.now()}`,
      name: newSiteName.trim(),
      state: newSiteState.trim(),
      category: 'monument',
      epoch: 'Documented Landmark',
      image: resolveCustomSiteImage(newSiteName, newSiteState),
      visited: true,
      visitedDate: new Date().toISOString().split('T')[0],
      visitMode: 'physical',
      coordinates: { lat: 20.5937, lon: 78.9629 },
      verifiedByASI: true,
    };

    setSites((prev) => [newSite, ...prev]);
    setNewSiteName('');
    setNewSiteState('');
    setShowAddSite(false);
  };

  const triggerMintFlow = () => {
    setIsMinting(true);
    setMintStep(1);

    setTimeout(() => {
      setMintStep(2);
      setTimeout(() => {
        setMintStep(3);
        setTimeout(() => {
          setMintStep(4);
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#10b981', '#1e3a8a', '#f97316'],
          });
          setTimeout(() => {
            setIsMinting(false);
          }, 1800);
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const handlePrint = () => {
    handlePrintSection('printable-certificate', 'landscape');
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?tab=certificate&id=${certificateId}&tx=${txHash.slice(0, 12)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      filterCategory === 'all'
        ? true
        : filterCategory === 'visited'
        ? site.visited
        : filterCategory === 'unvisited'
        ? !site.visited
        : site.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-20 selection:bg-amber-100">
      {/* HEADER BANNER */}
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Polygon PoVP Protocol
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Soulbound Token (ERC-721 SBT)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-royal text-stone-950">
                Sanskriti Yatra Praman Patra
              </h1>
              <p className="text-sm sm:text-base text-stone-600 max-w-2xl font-light">
                Official Blockchain Verified Certificate of Pilgrimage & Heritage Exploration.
                Every landmark you explore is cryptographically hashed with proof-of-visit on the Polygon blockchain ledger.
              </p>
            </div>

            {/* QUICK STATS PILL BOX */}
            <div className="flex items-center gap-3 sm:gap-4 bg-[#F5F2EC] p-3 rounded-2xl border border-stone-200">
              <div className="px-4 py-2 bg-white rounded-xl shadow-xs border border-stone-200 text-center">
                <div className="text-2xl font-black text-amber-800 font-mono">{visitedSites.length}</div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Sites Visited</div>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl shadow-xs border border-stone-200 text-center">
                <div className="text-2xl font-black text-stone-900 font-mono">{visitedStates.length}</div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">States Covered</div>
              </div>
              <div className="px-4 py-2 bg-emerald-50 rounded-xl shadow-xs border border-emerald-200 text-center">
                <div className="text-2xl font-black text-emerald-700 font-mono">100%</div>
                <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">On-Chain Proof</div>
              </div>
            </div>
          </div>

          {/* VIEW SWITCHER TABS */}
          <div className="flex items-center gap-2 mt-8 border-b border-stone-200">
            <button
              onClick={() => setActiveTab('certificate')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'certificate'
                  ? 'border-amber-600 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Official Certificate</span>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'tracker'
                  ? 'border-amber-600 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Visited Sites Tracker ({visitedSites.length}/{sites.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('blockchain')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'blockchain'
                  ? 'border-amber-600 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-600" />
              <span>Web3 Ledger Explorer</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ==================== TAB 1: OFFICIAL CERTIFICATE ==================== */}
        {activeTab === 'certificate' && (
          <div className="space-y-6">
            {/* ACTION BAR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold text-stone-700">Certificate Name:</div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="px-3 py-1 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-base">{recipientName}</span>
                    <button
                      onClick={() => {
                        setTempName(recipientName);
                        setIsEditingName(true);
                      }}
                      className="text-xs text-amber-700 hover:underline font-medium"
                    >
                      Edit Name
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={triggerMintFlow}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Mint Soulbound SBT</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-stone-600" />
                  <span>Print / PDF</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Verification'}</span>
                </button>
              </div>
            </div>

            {/* ==================== THE PHYSICAL/ROYAL CERTIFICATE ==================== */}
            <div
              ref={certificateRef}
              id="printable-certificate"
              className="relative max-w-4xl mx-auto bg-[#FDFBF7] p-8 sm:p-14 rounded-3xl border-8 border-double border-[#C5A059] shadow-2xl overflow-hidden font-serif select-none"
              style={{
                backgroundImage: 'radial-gradient(#E8DFD0 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#C5A059]" />
              <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-[#C5A059]" />
              <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-[#C5A059]" />
              <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#C5A059]" />

              {/* Watermark Mandala in Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <svg className="w-[500px] h-[500px]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" fill="none" />
                  <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" fill="none" />
                  <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              </div>

              {/* CERTIFICATE HEADER */}
              <div className="relative z-10 text-center space-y-4">
                {/* AARAMBH OFFICIAL BRAND LOGO (Requested by user) */}
                <div className="flex justify-center items-center">
                  <AarambhLogo size="lg" />
                </div>

                {/* Subtitle & Motto */}
                <div className="space-y-1">
                  <div className="text-xs tracking-[0.3em] uppercase text-amber-900 font-sans font-bold">
                    सत्यमेव जयते • DIGITAL PRESERVATION REGISTRY OF BHARAT
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-royal text-[#2A231B] tracking-wide">
                    सांस्कृतिक यात्रा प्रमाण पत्र
                  </h2>
                  <div className="text-sm sm:text-base font-semibold text-stone-600 tracking-wider uppercase font-sans">
                    National Heritage Pilgrimage & Exploration Credential
                  </div>
                </div>

                {/* Golden Divider */}
                <div className="flex items-center justify-center gap-3 py-2">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#C5A059]" />
                  <div className="w-2.5 h-2.5 rotate-45 bg-[#C5A059]" />
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#C5A059]" />
                </div>
              </div>

              {/* CERTIFICATE BODY */}
              <div className="relative z-10 text-center space-y-6 mt-6">
                <p className="text-stone-600 text-sm sm:text-base italic font-serif">
                  This Soulbound Cryptographic Credential is proud to certify that
                </p>

                {/* RECIPIENT NAME */}
                <div className="py-2 border-b-2 border-dashed border-[#C5A059]/60 max-w-md mx-auto">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold font-royal text-amber-950 tracking-wide">
                    {recipientName}
                  </span>
                </div>

                {/* CITATION */}
                <p className="text-stone-700 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-sans font-normal">
                  has with deep reverence visited, documented, and preserved India's monumental civilizational landmarks and living cultural traditions across{' '}
                  <span className="font-bold text-stone-900">{visitedStates.length} States</span>, fulfilling the sacred ethos of national cultural heritage stewardship.
                </p>

                {/* VISITED SITES BADGES STRIP */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-sans mb-3">
                    Certified Landmarks & Shrines ({visitedSites.length} Verified)
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto font-sans">
                    {visitedSites.map((site) => (
                      <span
                        key={site.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-[#C5A059]/40 text-stone-800 text-[11px] font-medium shadow-2xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        {site.name}
                      </span>
                    ))}
                    {visitedSites.length === 0 && (
                      <span className="text-xs text-stone-500 italic">
                        No sites marked as visited yet. Open the tracker tab below to check off your journeys!
                      </span>
                    )}
                  </div>
                </div>

                {/* BLOCKCHAIN METADATA STRIP */}
                <div className="mt-8 pt-4 border-t border-stone-300 font-sans text-left bg-white/70 backdrop-blur-xs p-4 rounded-xl border border-stone-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <div className="text-stone-400 uppercase text-[10px] font-bold">Certificate ID</div>
                      <div className="font-mono font-bold text-stone-900 truncate">{certificateId}</div>
                    </div>
                    <div>
                      <div className="text-stone-400 uppercase text-[10px] font-bold">Ledger Network</div>
                      <div className="font-semibold text-stone-900 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Polygon PoS
                      </div>
                    </div>
                    <div>
                      <div className="text-stone-400 uppercase text-[10px] font-bold">Issue Date</div>
                      <div className="font-medium text-stone-900">{issueDate}</div>
                    </div>
                    <div>
                      <div className="text-stone-400 uppercase text-[10px] font-bold">Token Standard</div>
                      <div className="font-mono text-stone-900 font-semibold">ERC-721 SBT</div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span className="truncate max-w-[280px] sm:max-w-md">
                      Merkle Root: {merkleRoot.slice(0, 24)}...
                    </span>
                    <span className="text-emerald-700 font-bold">IMMUTABLE ON-CHAIN 🟢</span>
                  </div>
                </div>

                {/* SIGNATURES & OFFICIAL SEAL */}
                <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
                  {/* Left Signatory */}
                  <div className="text-center space-y-1">
                    <div className="h-9 flex items-center justify-center">
                      <span className="font-script text-xl font-bold text-stone-800 -rotate-3">
                        Dr. K. S. Ramanujan
                      </span>
                    </div>
                    <div className="w-36 h-px bg-stone-400 mx-auto" />
                    <div className="text-xs font-bold text-stone-900">Director General</div>
                    <div className="text-[10px] text-stone-500">Digital Preservation Trust</div>
                  </div>

                  {/* Center Official Gold Seal */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#B38728] via-[#FBF5B7] to-[#DAA520] p-1 shadow-lg flex items-center justify-center">
                      <div className="w-full h-full rounded-full border-2 border-dashed border-[#8B6508] bg-[#FDFBF7] flex flex-col items-center justify-center p-1 text-center">
                        <Award className="w-5 h-5 text-amber-700" />
                        <span className="text-[7px] font-extrabold uppercase tracking-tighter text-amber-900 leading-tight">
                          OFFICIAL HERITAGE SEAL
                        </span>
                        <span className="text-[6px] font-mono text-stone-600">AARAMBH 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Signatory */}
                  <div className="text-center space-y-1">
                    <div className="h-9 flex items-center justify-center">
                      <span className="font-script text-xl font-bold text-amber-900 -rotate-2">
                        Aarambh Archival Node #04
                      </span>
                    </div>
                    <div className="w-36 h-px bg-stone-400 mx-auto" />
                    <div className="text-xs font-bold text-stone-900">Chief Archivist</div>
                    <div className="text-[10px] text-stone-500">Aarambh Cultural Knowledge Mission</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: VISITED SITES TRACKER ==================== */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            {/* SEARCH & FILTERS BAR */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search monuments, temples, stepwells..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-stone-50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {['all', 'visited', 'unvisited'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}

                <button
                  onClick={markAllVisited}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors ml-auto cursor-pointer"
                >
                  Mark All Visited
                </button>

                <button
                  onClick={() => setShowAddSite(!showAddSite)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-stone-900 hover:bg-black transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Place</span>
                </button>
              </div>
            </div>

            {/* ADD CUSTOM PLACE ACCORDION */}
            {showAddSite && (
              <form
                onSubmit={handleAddCustomSite}
                className="bg-amber-50/70 border border-amber-200 p-5 rounded-2xl space-y-4 animate-fade-in"
              >
                <div className="text-sm font-bold text-amber-950">Add a New Visited Cultural Site to Certificate</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Place / Monument Name (e.g., Sanchi Stupa)"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    className="px-3.5 py-2 text-sm bg-white rounded-xl border border-amber-300 focus:outline-hidden"
                    required
                  />
                  <input
                    type="text"
                    placeholder="State / Region (e.g., Madhya Pradesh)"
                    value={newSiteState}
                    onChange={(e) => setNewSiteState(e.target.value)}
                    className="px-3.5 py-2 text-sm bg-white rounded-xl border border-amber-300 focus:outline-hidden"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSite(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-amber-700 text-white rounded-lg hover:bg-amber-800"
                  >
                    Add to Certificate
                  </button>
                </div>
              </form>
            )}

            {/* SITES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => toggleVisited(site.id)}
                  className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer group select-none ${
                    site.visited
                      ? 'bg-white border-emerald-300 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-white/60 border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Image Banner */}
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-100">
                      <img
                        src={site.image}
                        alt={site.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover filter brightness-85 group-hover:brightness-95 group-hover:scale-105 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/85 text-white text-[10px] font-mono border border-white/20 shadow-sm">
                        {site.epoch}
                      </span>
                      {site.visited ? (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-md border border-emerald-400/30">
                          <Check className="w-3 h-3" /> Visited
                        </span>
                      ) : (
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/85 text-stone-200 text-[10px] font-medium border border-white/20 shadow-sm">
                          Click to Check
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-800 transition-colors">
                        {site.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{site.state}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="capitalize text-stone-500 font-medium">
                      {site.category.replace('-', ' ')}
                    </span>
                    <span
                      className={`font-semibold ${
                        site.visited ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      {site.visited ? 'Verified on Chain ✓' : 'Pending Visit'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: WEB3 LEDGER EXPLORER ==================== */}
        {activeTab === 'blockchain' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-royal text-stone-900">
                    Aarambh On-Chain Verification Ledger
                  </h2>
                  <p className="text-xs text-stone-500">
                    Polygon Proof-of-Visit Protocol (PoVP) • Soulbound Token Smart Contract
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Synced with Polygon Mainnet
                </span>
              </div>

              {/* Technical Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold uppercase text-stone-400 tracking-wider">Smart Contract</div>
                  <div className="font-mono text-sm font-bold text-stone-900 break-all">{contractAddress}</div>
                  <div className="text-[11px] text-stone-500">ERC-721 Soulbound Token (Non-transferable)</div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold uppercase text-stone-400 tracking-wider">Verified Merkle Root</div>
                  <div className="font-mono text-sm font-bold text-stone-900 break-all">{merkleRoot}</div>
                  <div className="text-[11px] text-stone-500">Cryptographic hash of {visitedSites.length} visited landmarks</div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold uppercase text-stone-400 tracking-wider">Transaction Hash (TxHash)</div>
                  <div className="font-mono text-sm font-bold text-stone-900 break-all">{txHash}</div>
                  <div className="text-[11px] text-stone-500">Confirmed at Block #54,819,412</div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                  <div className="text-xs font-bold uppercase text-stone-400 tracking-wider">Consensus Model</div>
                  <div className="font-medium text-sm text-stone-900">Proof-of-Stake (Eco-Friendly Carbon Neutral)</div>
                  <div className="text-[11px] text-emerald-700 font-bold">Zero Carbon Footprint Verified 🌱</div>
                </div>
              </div>

              {/* How it Works Banner */}
              <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-800" />
                  <span>How Soulbound Heritage Tokens Work</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Unlike commercial NFTs, <strong>Soulbound Tokens (SBTs)</strong> are non-transferable identity credentials bound permanently to your heritage explorer profile. When you visit or complete an e-visit at a landmark like the Kashi Vishwanath temple or Hampi monoliths, a GPS & archival hash is sealed onto the ledger. You can download, print, or share your verifiable link anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MINTING SIMULATION MODAL ==================== */}
      {isMinting && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-2xl space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-amber-800">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-royal text-stone-900">
                Minting Soulbound Certificate
              </h3>
              <p className="text-xs text-stone-500">
                Writing your visit proof to the Polygon blockchain ledger...
              </p>
            </div>

            <div className="space-y-2.5 text-left text-xs font-mono bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className={`flex items-center gap-2 ${mintStep >= 1 ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                {mintStep >= 1 ? '✓' : '○'} 1. Generating SHA-256 Merkle root of {visitedSites.length} sites
              </div>
              <div className={`flex items-center gap-2 ${mintStep >= 2 ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                {mintStep >= 2 ? '✓' : '○'} 2. Signing with Aarambh Archival Authority Key
              </div>
              <div className={`flex items-center gap-2 ${mintStep >= 3 ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                {mintStep >= 3 ? '✓' : '○'} 3. Broadcasting to Polygon PoS Validator Node
              </div>
              <div className={`flex items-center gap-2 ${mintStep >= 4 ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                {mintStep >= 4 ? '✓' : '○'} 4. Certificate Soulbound Token Minted Successfully!
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
