export type UserRole = 'TRAVELER' | 'CULTURAL_CREATOR' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  role: UserRole;
  avatar?: string;
  photoURL?: string;
  authProvider?: 'google' | 'email';
  isGuest?: boolean;
  culturalSpecialization?: string;
  associatedLocation?: string;
  bio?: string;
  joinedDate: string;
  contributionsCount: number;
  approvedCount: number;
  pendingCount: number;
}

export interface LocationMetadata {
  placeName: string;
  formattedAddress: string;
  city?: string;
  district?: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
  boundingBox?: [string, string, string, string];
  osmId?: string | number;
  type?: string;
}

export interface WeatherDayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  condition: string;
}

export interface WeatherContext {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: WeatherDayForecast[];
  alerts?: string[];
  source: string;
  timestamp: string;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface RouteResult {
  available: boolean;
  distanceKm: number;
  durationMinutes: number;
  mode: 'driving' | 'walking';
  coordinates: [number, number][]; // [lat, lon]
  from?: string;
  to?: string;
  steps?: RouteStep[];
  source: string;
  message?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'PLACE' | 'PERSON' | 'STORY' | 'TRADITION' | 'CRAFT' | 'TOOL' | 'LANGUAGE' | 'FOOD' | 'FESTIVAL' | 'EVENT' | 'NEARBY';
  description?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string;
}

export interface CulturalMemoryGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface MemoryTrailStop {
  order: number;
  name: string;
  lat: number;
  lon: number;
  highlight: string;
  type?: string;
  distKmFromPrev?: number;
  walkTimeFromPrevMin?: number;
  estimatedTimeMinutes?: number;
}

export interface MemoryTrail {
  id: string;
  title: string;
  theme: string;
  placeName: string;
  totalDistanceKm: number;
  estimatedMinutes: number;
  stops: MemoryTrailStop[];
}

export type MemoryTrailData = MemoryTrail;

export interface SavedItineraryItem {
  id: string;
  title: string;
  location: string;
  day: number;
  addedAt: string;
}

export interface TrainOption {
  trainNumber: string;
  trainName: string;
  originStation: string;
  originStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  classes: string[];
  indicativeFareRange?: string;
  availabilityNote: string;
  bookingUrl: string;
  distanceKm?: number;
  frequency?: string;
}

export interface ConnectedStation {
  name: string;
  code: string;
  lat: number;
  lon: number;
  distanceFromLocationKm: number;
  driveMinutes: number;
}

export interface ConnectedRouteLeg {
  id: string;
  title: string;
  from: string;
  to: string;
  mode: 'driving' | 'train' | 'walking' | 'rickshaw';
  distanceKm: number;
  durationMinutes: number;
  coordinates?: [number, number][];
  description: string;
}

export interface WeatherPoint {
  locationName: string;
  type: 'departure' | 'transit' | 'destination';
  temperature: number;
  apparentTemperature: number;
  condition: string;
  weatherCode: number;
  precipitationProb?: number;
  windSpeed: number;
  advisory?: string;
}

export interface WeatherImpactAlert {
  activityTitle: string;
  dayNumber: number;
  time: string;
  impactType: 'rain' | 'extreme_heat' | 'fog_delay' | 'ideal';
  warningText: string;
  recommendedWindow: string;
  suggestedAlternative: {
    title: string;
    category: string;
    description: string;
    indoor: boolean;
  };
}

export interface ConnectedItineraryActivity {
  id: string;
  time: string;
  placeTitle: string;
  durationMinutes: number;
  description: string;
  culturalCategory: string;
  indoor: boolean;
  lat: number;
  lon: number;
  transitFromPrevMin?: number;
  weatherWarning?: string;
  weatherAlternative?: {
    title: string;
    description: string;
  };
  source: string;
}

export interface ConnectedItineraryDay {
  dayNumber: number;
  date: string;
  theme: string;
  weatherSummary: {
    maxTemp: number;
    minTemp: number;
    condition: string;
    weatherCode: number;
    advisory?: string;
    bestWindow?: string;
  };
  transitSummary: string;
  activities: ConnectedItineraryActivity[];
  memoryTrail?: {
    title: string;
    stopsCount: number;
    distanceKm: number;
    indoorAvailable: boolean;
    warning?: string;
  };
}

export interface BudgetBreakdown {
  currency: string;
  tier: string;
  trainCost: number;
  localTransitCost: number;
  stayCost: number;
  activitiesAndEntry: number;
  foodAndDining: number;
  totalEstimated: number;
  calculationBasis: string;
  isEstimate: boolean;
}

export interface TravelSafetyContext {
  emergencyHelplines: { name: string; number: string }[];
  weatherAdvisory: string;
  travelTransitAdvisory: string;
  localCustomsNote: string;
  nearestMedical: string;
}

export interface ConnectedTripPlan {
  id: string;
  title: string;
  fromLocation: LocationMetadata;
  toLocation: LocationMetadata;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelersCount: number;
  budgetTier: string;
  interests: string[];
  nearestOriginStation: ConnectedStation;
  nearestDestStation: ConnectedStation;
  selectedTrain: TrainOption | null;
  availableTrains: TrainOption[];
  multiLegRoute: ConnectedRouteLeg[];
  weatherPoints: WeatherPoint[];
  weatherImpacts: WeatherImpactAlert[];
  days: ConnectedItineraryDay[];
  budgetBreakdown: BudgetBreakdown;
  safety: TravelSafetyContext;
  culturalMemoryGraph: {
    nodes: { id: string; label: string; type: string }[];
    links: { source: string; target: string; relationship: string }[];
  };
  createdAt: string;
}

export interface ItineraryPlanActivity {
  time: string;
  placeTitle: string;
  durationMinutes: number;
  description: string;
  culturalCategory: string;
}

export interface ItineraryPlanDay {
  dayNumber: number;
  theme: string;
  transitNotes: string;
  activities: ItineraryPlanActivity[];
}

export interface ItineraryPlan {
  title: string;
  totalDistanceKm: number;
  days: ItineraryPlanDay[];
}

export interface TripPlanRequest {
  origin: string;
  destinations: string[];
  days: number;
  style: 'Heritage' | 'Artisan & Craft' | 'Spiritual' | 'Culinary' | 'Offbeat';
  pace: 'Relaxed' | 'Balanced' | 'Intensive';
  mode: 'car' | 'train' | 'mixed';
}


export interface LivingHeritageItem {
  title: string;
  description: string;
  practitionerType: string;
  status: 'vibrant' | 'endangered' | 'rare' | 'protected';
  locationNote?: string;
}

export interface CraftItem {
  name: string;
  description: string;
  materials: string;
  tools: string[];
  isLiving: boolean;
  practitionersFound?: boolean;
}

export interface FoodItem {
  name: string;
  description: string;
  culturalSignificance: string;
  seasonal?: string;
}

export interface LocalStoryItem {
  title: string;
  narrative: string;
  sourceClassification: 'VERIFIED FACT' | 'COMMUNITY MEMORY' | 'AI INTERPRETATION';
  period?: string;
}

export interface NearbyHeritageItem {
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  note: string;
  category?: string;
}

export interface InformationSource {
  name: string;
  type: 'VERIFIED_API' | 'OPEN_DATA' | 'COMMUNITY' | 'AI_SYNTHESIS';
  link?: string;
  timestamp: string;
  note: string;
}

export interface HeritageData {
  placeName: string;
  location: LocationMetadata;
  tagline: string;
  overview: string;
  history: string;
  whyItMatters: string;
  architecture: string;
  livingHeritage: LivingHeritageItem[];
  crafts: CraftItem[];
  traditionalFood: FoodItem[];
  language: {
    primary: string;
    dialect: string;
    samplePhrase?: string;
    meaning?: string;
    culturalNote: string;
  };
  festivals: {
    name: string;
    timing: string;
    significance: string;
    community: string;
  }[];
  localStories: LocalStoryItem[];
  nearbyHeritage: NearbyHeritageItem[];
  hiddenGems: {
    name: string;
    description: string;
    tip: string;
  }[];
  culturalMemoryGraph: CulturalMemoryGraphData;
  memoryTrail: MemoryTrailData;
  weather?: WeatherContext;
  safety: {
    emergencyContacts: { service: string; number: string }[];
    nearestAssistance: { type: string; name: string; distance?: string }[];
    contextualNotes: string[];
    source: string;
  };
  sources: InformationSource[];
  isLimitedInfo: boolean;
  imageUrls?: string[];
  epoch?: string;
  retrievedAt: string;
}

export interface MemoryContribution {
  id: string;
  placeName: string;
  location: {
    lat: number;
    lon: number;
    formattedAddress: string;
    state?: string;
  };
  title: string;
  mediaType: 'photo' | 'audio' | 'video' | 'text' | 'story' | 'recipe' | 'song' | 'dialect' | 'craft' | 'ritual';
  mediaUrl?: string;
  content: string;
  contributorName: string;
  contributorRole: UserRole;
  contributorId: string;
  dateSubmitted: string;
  timestamp?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationNote?: string;
  detectedLanguage?: string;
  extractedEntities?: string[];
  traditionClassification?: string;
  preservationUrgency?: 'HIGH' | 'MEDIUM' | 'DOCUMENTED';
  audioTranscript?: string;
}

export interface CommentItem {
  id: string;
  targetType: 'place' | 'memory' | 'craft' | 'story';
  targetId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
  reported: boolean;
  reportReason?: string;
}

export interface ItineraryItem {
  id: string;
  day: number;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  title: string;
  placeName: string;
  lat: number;
  lon: number;
  description: string;
  category: string;
  routeInfo?: {
    travelTimeMin: number;
    distanceKm: number;
    mode: string;
  };
  weatherContext?: string;
  source: string;
  completed?: boolean;
}

export interface SavedItinerary {
  id: string;
  userId: string;
  title: string;
  startingPoint: string;
  destination: string;
  destinations?: string[];
  days?: number;
  startDate: string;
  durationDays: number;
  travelersCount: number;
  budgetTier: string;
  interests: string[];
  items: ItineraryItem[];
  createdAt: string;
}

export interface HeritageVisitSite {
  id: string;
  name: string;
  state: string;
  category: 'monument' | 'temple' | 'stepwell' | 'unesco' | 'living-craft';
  epoch: string;
  image: string;
  visited: boolean;
  visitedDate?: string;
  visitMode?: 'physical' | 'evisit';
  coordinates: {
    lat: number;
    lon: number;
  };
  verifiedByASI?: boolean;
}

export interface BlockchainCertificate {
  certificateId: string;
  recipientName: string;
  issueDate: string;
  visitedSites: HeritageVisitSite[];
  totalSitesCount: number;
  statesCount: number;
  txHash: string;
  contractAddress: string;
  blockNumber: number;
  network: string;
  tokenStandard: string;
  merkleRoot: string;
  isMintedOnChain: boolean;
}

export type StampInkColor = 'crimson' | 'indigo' | 'emerald' | 'ochre' | 'purple' | 'sepia';
export type StampShape = 'round' | 'octagon' | 'shield' | 'oval' | 'rect';

export interface PassportStamp {
  id: string;
  name: string;
  hindiName?: string;
  city: string;
  state: string;
  date: string;
  inkColor: StampInkColor;
  shape: StampShape;
  motto: string;
  iconSymbol: string;
  verified: boolean;
  rotation: number;
  stampCategory: string;
  coordinates?: { lat: number; lon: number };
  epoch?: string;
}

export interface DigitalYatraPassport {
  passportNumber: string;
  holderName: string;
  avatarUrl?: string;
  originCity: string;
  destinationCity: string;
  tripStartDate: string;
  circuitName: string;
  issueDate: string;
  stamps: PassportStamp[];
  stampedCount: number;
  totalTripsCompleted: number;
  citizenshipTier: 'Sanskriti Sahayak' | 'Yatra Pathik' | 'Dharohar Rakshak' | 'Maha Yatri';
}

export interface MokshaSquare {
  number: number;
  name: string;
  hindiName: string;
  type: 'normal' | 'ladder' | 'snake' | 'moksha';
  target?: number;
  meaning: string;
  philosophicalNote: string;
}

export interface TraditionalPigment {
  id: string;
  name: string;
  hindiName: string;
  hex: string;
  description: string;
}

// -------------------------------------------------------------
// Crowdsourcing, Live Radar, Community Chat, Fair Fares & Bazaar
// -------------------------------------------------------------

export interface NearbyTraveler {
  id: string;
  name: string;
  avatar: string;
  role: 'Solo Explorer' | 'Family Traveler' | 'Heritage Photographer' | 'Verified Local Guide' | 'Pilgrim' | 'Artisan Custodian';
  monument: string;
  locationName: string;
  statusMessage: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  checkedInAgo: string;
  verifiedTourist?: boolean;
  likes?: number;
}

export interface CrowdsourceData {
  place: string;
  monument: string;
  totalNearbyCount: number;
  crowdLevel: 'Low' | 'Moderate' | 'High';
  bestGateTip: string;
  weatherAdvisory?: string;
  activeTravelers: NearbyTraveler[];
}

export interface CommunityChatMessage {
  id: string;
  userName: string;
  userRole: 'Traveler' | 'Verified Guide' | 'Local Artisan' | 'Resident' | 'Local Vendor';
  avatar?: string;
  locationTag: string;
  text: string;
  timestamp: string;
  likes: number;
  badge?: string;
  isImportantAlert?: boolean;
}

export interface LocalVendorItem {
  id: string;
  name: string;
  itemType?: 'product' | 'service';
  category: 'GI Tag Craft' | 'Heirloom Food & Sweets' | 'Textiles & Handloom' | 'Handicrafts & Art' | 'Footwear' | 'Heritage Tour & Guide' | 'Local Experience & Workshop' | string;
  artisanName: string;
  shopName: string;
  location: string;
  city: string;
  distanceFromMonument: string;
  distanceMeters?: number;
  lat?: number;
  lon?: number;
  priceFormatted: string;
  priceNumber: number;
  rating: number;
  reviewsCount: number;
  giTagVerified: boolean;
  handloomMark: boolean;
  story: string;
  imageUrl: string;
  whatsAppNumber: string;
  phone?: string;
  googleMapsQuery?: string;
  verifiedLocalSeller: boolean;
  timing?: string;
  serviceDuration?: string;
  fairPriceGuaranteed?: boolean;
}

export interface TransitFareRoute {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  autoRickshawFare: string; // e.g. "₹100 - ₹120"
  eRickshawFare: string; // e.g. "₹20 (Shared) / ₹80 (Private)"
  prepaidTaxiFare: string; // e.g. "₹220 - ₹260"
  appTaxiFare: string; // e.g. "₹180 - ₹240"
  travelTimeMinutes: number;
  practicalTips: string;
  localHindiPhrase: string;
}

export interface TransitScamAlert {
  id: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM';
  description: string;
  howToAvoid: string;
}

export interface TransitFareGuide {
  city: string;
  routes: TransitFareRoute[];
  scamAlerts: TransitScamAlert[];
  recentReports: {
    id: string;
    route: string;
    mode: string;
    paid: number;
    note: string;
    reportedAgo: string;
  }[];
}

export interface MonumentCommunityMemory {
  id?: string;
  author: string;
  role?: string;
  avatar?: string;
  story: string;
  date?: string;
  likes?: number;
  tags?: string[];
  audioTranscript?: string;
  verified?: boolean;
}

export interface NearbyMonumentProximity {
  id: string;
  name: string;
  city: string;
  state: string;
  distanceKm: number;
  thumbnail: string;
  era: string;
  type: string;
  lat: number;
  lon: number;
}

export interface HeritageScannerResult {
  identified: boolean;
  monumentName: string;
  hindiName?: string;
  alternativeNames?: string[];
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  era: string;
  builderDynasty: string;
  architecturalStyle: string;
  significance: string;
  keyHighlights: string[];
  folkloreAndLegends?: string;
  unescoStatus?: string;
  asiProtected?: boolean;
  visitingTips?: {
    bestTime?: string;
    entryFee?: string;
    audioGuideAvailable?: boolean;
    dressCode?: string;
    photographyRules?: string;
  };
  confidenceScore: number;
  capturedImageUrl?: string;
  communityMemories: MonumentCommunityMemory[];
  nearbyMonuments?: NearbyMonumentProximity[];
  detectionTimestamp: string;
}

