/**
 * Aarambh Heritage Experience Points (XP) & Cultural Progression Engine
 * Rewards travelers and contributors based on memories saved, heritage sites visited,
 * official passport mudra stamps collected, and monument camera scans.
 */

export interface LevelTier {
  level: number;
  title: string;
  hindiTitle: string;
  motto: string;
  minXP: number;
  maxXP: number;
  badgeIcon: string;
  themeColor: string;
  bgGradient: string;
  perks: string[];
  rankSeal: string;
}

export const XP_LEVELS: LevelTier[] = [
  {
    level: 1,
    title: 'Yatri Pratham',
    hindiTitle: 'यात्री प्रथम',
    motto: 'आरम्भः सत्यस्य (The Awakening of Curiosity)',
    minXP: 0,
    maxXP: 299,
    badgeIcon: '🪔',
    themeColor: '#d97706', // Amber-600
    bgGradient: 'from-amber-600 to-amber-800',
    perks: [
      'Digital Yatra Passport issuance',
      'Standard red & indigo mudra seals',
      'Access to 42+ UNESCO/ASI heritage logs',
    ],
    rankSeal: 'BRONZE_PILGRIM',
  },
  {
    level: 2,
    title: 'Sanskriti Pathik',
    hindiTitle: 'संस्कृति पथिक',
    motto: 'पथि प्रवृत्तः (Wandering the Sacred Trail)',
    minXP: 300,
    maxXP: 699,
    badgeIcon: '🧭',
    themeColor: '#2563eb', // Blue-600
    bgGradient: 'from-blue-600 to-indigo-800',
    perks: [
      'Emerald & Ochre ink mudra seals unlocked',
      'Fair Price Transit Guide unlocked',
      'Heritage Audio Guide fast stream',
    ],
    rankSeal: 'SILVER_VOYAGER',
  },
  {
    level: 3,
    title: 'Sanskriti Sahayak',
    hindiTitle: 'संस्कृति सहायक',
    motto: 'रक्षतु संस्कृतिम् (Guardian of Living Traditions)',
    minXP: 700,
    maxXP: 1299,
    badgeIcon: '📜',
    themeColor: '#7c3aed', // Purple-600
    bgGradient: 'from-purple-600 to-violet-800',
    perks: [
      'Royal Purple wax seal unlocked',
      'Priority community memory verification',
      'Custom explorer site stamping privileges',
    ],
    rankSeal: 'GOLD_GUARDIAN',
  },
  {
    level: 4,
    title: 'Teertha Darshak',
    hindiTitle: 'तीर्थ दर्शक',
    motto: 'तीर्थं पावनम् (Sanctuary Chronicler)',
    minXP: 1300,
    maxXP: 2199,
    badgeIcon: '🛕',
    themeColor: '#dc2626', // Red-600
    bgGradient: 'from-red-600 to-rose-900',
    perks: [
      'Ruby & Vermilion temple seals',
      'Web3 Soulbound pilgrim certificate eligibility',
      'Multimodal Darshan offline audio cache',
    ],
    rankSeal: 'RUBY_SCHOLAR',
  },
  {
    level: 5,
    title: 'Maha Archivalist',
    hindiTitle: 'महा अभिलेखक',
    motto: 'स्मृतिः अक्षया (Keeper of Imperishable Memory)',
    minXP: 2200,
    maxXP: 3499,
    badgeIcon: '🏛️',
    themeColor: '#059669', // Emerald-600
    bgGradient: 'from-emerald-600 to-teal-900',
    perks: [
      'Holographic gold foil passport badge',
      'Curator-tier oral legend verification vote',
      'National Living Memory Hall of Fame recognition',
    ],
    rankSeal: 'EMERALD_ARCHIVIST',
  },
  {
    level: 6,
    title: 'Param Parampara Ratna',
    hindiTitle: 'परम परम्परा रत्न',
    motto: 'अमृताय नमः (Immortal Custodian of Heritage)',
    minXP: 3500,
    maxXP: 999999,
    badgeIcon: '👑',
    themeColor: '#b45309', // Amber-700
    bgGradient: 'from-amber-500 via-orange-600 to-amber-900',
    perks: [
      'Supreme National Heritage Passport Crest',
      'Permanent Golden Ashoka Chakra seal',
      'Lifetime Master Custodian status in Aarambh archives',
    ],
    rankSeal: 'IMPERIAL_RATNA',
  },
];

export interface UserXPBreakdown {
  memoriesSavedCount: number;
  memoriesXP: number; // 150 XP per memory
  sitesVisitedCount: number;
  sitesVisitedXP: number; // 100 XP per site
  passportStampsCount: number;
  passportStampsXP: number; // 80 XP per stamp
  monumentsScannedCount: number;
  monumentsScannedXP: number; // 75 XP per scan
  welcomeBonusXP: number;
  totalXP: number;
  currentLevel: LevelTier;
  nextLevel: LevelTier | null;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
}

// XP Points Allocation Constants
export const XP_RATES = {
  MEMORY_SAVED: 150,
  SITE_VISITED: 100,
  PASSPORT_STAMP: 80,
  MONUMENT_SCANNED: 75,
  WELCOME_BONUS: 50,
};

/**
 * Calculates current User Experience Points and Level based on:
 * - memories saved in localStorage / database
 * - visited heritage sites
 * - passport stamps collected
 * - camera monument scans
 */
export function calculateUserXP(): UserXPBreakdown {
  let memoriesSavedCount = 1; // default seed memory
  let sitesVisitedCount = 3; // default initial visited sites
  let passportStampsCount = 2; // default stamps
  let monumentsScannedCount = 1; // default initial scan
  const welcomeBonusXP = XP_RATES.WELCOME_BONUS;

  try {
    // 1. Visited Sites from Blockchain/Tracker
    const savedVisited = localStorage.getItem('aarambh_visited_sites');
    if (savedVisited) {
      const parsed = JSON.parse(savedVisited);
      if (Array.isArray(parsed)) {
        const v = parsed.filter((s: any) => s.visited);
        if (v.length > 0) sitesVisitedCount = v.length;
      }
    }

    // 2. Passport Stamps
    const savedPassport = localStorage.getItem('aarambh_digital_passport');
    if (savedPassport) {
      const parsed = JSON.parse(savedPassport);
      if (parsed?.stamps && Array.isArray(parsed.stamps)) {
        passportStampsCount = parsed.stamps.length;
      }
    }

    // 3. User Saved Memories count
    const savedMemCount = localStorage.getItem('aarambh_user_saved_memories_count');
    if (savedMemCount !== null) {
      const num = parseInt(savedMemCount, 10);
      if (!isNaN(num) && num >= 0) memoriesSavedCount = num;
    } else {
      // Check if user has memories in local cache
      const storedMems = localStorage.getItem('aarambh_user_memories');
      if (storedMems) {
        const parsed = JSON.parse(storedMems);
        if (Array.isArray(parsed)) memoriesSavedCount = Math.max(1, parsed.length);
      }
    }

    // 4. Scanned Monuments count
    const scannedCount = localStorage.getItem('aarambh_scanned_monuments_count');
    if (scannedCount !== null) {
      const num = parseInt(scannedCount, 10);
      if (!isNaN(num) && num >= 0) monumentsScannedCount = num;
    }
  } catch (e) {
    console.warn('Error reading XP sources from storage:', e);
  }

  const memoriesXP = memoriesSavedCount * XP_RATES.MEMORY_SAVED;
  const sitesVisitedXP = sitesVisitedCount * XP_RATES.SITE_VISITED;
  const passportStampsXP = passportStampsCount * XP_RATES.PASSPORT_STAMP;
  const monumentsScannedXP = monumentsScannedCount * XP_RATES.MONUMENT_SCANNED;

  const totalXP = memoriesXP + sitesVisitedXP + passportStampsXP + monumentsScannedXP + welcomeBonusXP;

  // Determine Level
  let currentLevel = XP_LEVELS[0];
  let nextLevel: LevelTier | null = XP_LEVELS[1];

  for (let i = 0; i < XP_LEVELS.length; i++) {
    const tier = XP_LEVELS[i];
    if (totalXP >= tier.minXP) {
      currentLevel = tier;
      nextLevel = i + 1 < XP_LEVELS.length ? XP_LEVELS[i + 1] : null;
    }
  }

  let xpInCurrentLevel = totalXP - currentLevel.minXP;
  let xpNeededForNext = 0;
  let progressPercent = 100;

  if (nextLevel) {
    const levelSpan = nextLevel.minXP - currentLevel.minXP;
    xpNeededForNext = nextLevel.minXP - totalXP;
    progressPercent = Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / levelSpan) * 100)));
  }

  return {
    memoriesSavedCount,
    memoriesXP,
    sitesVisitedCount,
    sitesVisitedXP,
    passportStampsCount,
    passportStampsXP,
    monumentsScannedCount,
    monumentsScannedXP,
    welcomeBonusXP,
    totalXP,
    currentLevel,
    nextLevel,
    xpInCurrentLevel,
    xpNeededForNext,
    progressPercent,
  };
}

/**
 * Record an added memory to user's XP ledger
 */
export function recordMemorySavedXP() {
  try {
    const current = parseInt(localStorage.getItem('aarambh_user_saved_memories_count') || '1', 10);
    const updated = current + 1;
    localStorage.setItem('aarambh_user_saved_memories_count', updated.toString());
    window.dispatchEvent(new CustomEvent('aarambh-xp-updated', { detail: { action: 'MEMORY_SAVED', count: updated } }));
  } catch (e) {
    console.warn(e);
  }
}

/**
 * Record a new monument scanned to user's XP ledger
 */
export function recordMonumentScannedXP() {
  try {
    const current = parseInt(localStorage.getItem('aarambh_scanned_monuments_count') || '1', 10);
    const updated = current + 1;
    localStorage.setItem('aarambh_scanned_monuments_count', updated.toString());
    window.dispatchEvent(new CustomEvent('aarambh-xp-updated', { detail: { action: 'MONUMENT_SCANNED', count: updated } }));
  } catch (e) {
    console.warn(e);
  }
}

export interface HeritageVisitTrackerItem {
  id: string;
  name: string;
  state: string;
  category: string;
  visited: boolean;
  visitedDate?: string;
}

export const CANONICAL_HERITAGE_SITES: HeritageVisitTrackerItem[] = [
  { id: 'varanasi-ghats', name: 'Varanasi Ghats & Sacred Ganga Aarti', state: 'Uttar Pradesh', category: 'temple', visited: true, visitedDate: '2026-03-15' },
  { id: 'hampi-vijayanagara', name: 'Hampi Virupaksha & Stone Chariot', state: 'Karnataka', category: 'unesco', visited: true, visitedDate: '2026-04-02' },
  { id: 'amber-fort', name: 'Amber Fort & Sheesh Mahal', state: 'Jaipur, Rajasthan', category: 'monument', visited: true, visitedDate: '2026-05-10' },
  { id: 'kedarnath-dham', name: 'Kedarnath Dham Jyotirlinga', state: 'Uttarakhand', category: 'temple', visited: true, visitedDate: '2026-06-20' },
  { id: 'rani-ki-vav', name: 'Rani ki Vav Stepwell', state: 'Patan, Gujarat', category: 'stepwell', visited: true, visitedDate: '2026-07-04' },
  { id: 'konark-sun-temple', name: 'Konark Sun Chariot Temple', state: 'Odisha', category: 'unesco', visited: true, visitedDate: '2026-08-11' },
  { id: 'taj-mahal-agra', name: 'Taj Mahal & Yamuna Marble Terrace', state: 'Agra, Uttar Pradesh', category: 'unesco', visited: false },
  { id: 'khajuraho-complex', name: 'Khajuraho Monument Group', state: 'Madhya Pradesh', category: 'unesco', visited: false },
  { id: 'madurai-meenakshi-temple', name: 'Madurai Meenakshi Sundareswarar', state: 'Tamil Nadu', category: 'temple', visited: false },
  { id: 'ellora-kailasa-cave', name: 'Ellora Kailasa Rock-Cut Monolith', state: 'Maharashtra', category: 'monument', visited: false },
  { id: 'golden-temple-amritsar', name: 'Sri Harmandir Sahib (Golden Temple)', state: 'Punjab', category: 'temple', visited: false },
  { id: 'mahabodhi-temple-bodhgaya', name: 'Mahabodhi Mahavihara', state: 'Bihar', category: 'unesco', visited: false },
  { id: 'red-fort-delhi', name: 'Lal Qila (Delhi Red Fort)', state: 'Delhi NCR', category: 'monument', visited: false },
  { id: 'brihadeeswarar-thanjavur', name: 'Brihadeeswarar Big Temple', state: 'Tamil Nadu', category: 'unesco', visited: false },
];

/**
 * Reads the current list of visited sites from localStorage or canonical default
 */
export function getStoredHeritageSites(): HeritageVisitTrackerItem[] {
  try {
    const raw = localStorage.getItem('aarambh_visited_sites');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: any) => ({
          id: p.id || `site-${Math.random()}`,
          name: p.name || 'Sacred Heritage Site',
          state: p.state || 'Bharat',
          category: p.category || 'monument',
          visited: Boolean(p.visited),
          visitedDate: p.visitedDate,
        }));
      }
    }
  } catch (e) {
    console.warn('Error reading stored heritage sites:', e);
  }
  return CANONICAL_HERITAGE_SITES;
}

/**
 * Toggles a heritage site's visited status and updates XP
 */
export function toggleHeritageSiteVisit(siteId: string): { updatedSites: HeritageVisitTrackerItem[]; isNowVisited: boolean } {
  const currentSites = getStoredHeritageSites();
  let isNowVisited = false;

  const updatedSites = currentSites.map((site) => {
    if (site.id === siteId) {
      isNowVisited = !site.visited;
      return {
        ...site,
        visited: isNowVisited,
        visitedDate: isNowVisited ? new Date().toISOString().split('T')[0] : undefined,
      };
    }
    return site;
  });

  // If siteId wasn't in existing list, find in canonical or add
  if (!currentSites.some((s) => s.id === siteId)) {
    const canonical = CANONICAL_HERITAGE_SITES.find((s) => s.id === siteId);
    if (canonical) {
      isNowVisited = true;
      updatedSites.push({
        ...canonical,
        visited: true,
        visitedDate: new Date().toISOString().split('T')[0],
      });
    }
  }

  try {
    localStorage.setItem('aarambh_visited_sites', JSON.stringify(updatedSites));
    window.dispatchEvent(new CustomEvent('aarambh-xp-updated', { detail: { action: 'SITE_TOGGLED', siteId, isNowVisited } }));
  } catch (e) {
    console.warn('Error saving visited sites:', e);
  }

  return { updatedSites, isNowVisited };
}

/**
 * Record a visited site to user's XP ledger
 */
export function recordSiteVisitedXP() {
  try {
    window.dispatchEvent(new CustomEvent('aarambh-xp-updated', { detail: { action: 'SITE_VISITED' } }));
  } catch (e) {
    console.warn(e);
  }
}
