import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Compass,
  Search,
  Layers,
  Navigation,
  Car,
  Footprints,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Utensils,
  Hammer,
  Landmark,
  Loader2,
  PenTool,
  RotateCcw,
  Trash2,
  Save,
  CheckCircle2,
  Play,
  Pause,
  Share2,
  Calendar,
  X,
  Plus,
  Route as RouteIcon,
  ChevronRight,
  Award,
  BookOpen,
  Info,
} from 'lucide-react';
import { geocodeSearch, getRoute } from '../services/api';
import { RouteResult } from '../types';
import { executeWebShare } from '../utils/socialShare';
import {
  PRE_INDEPENDENCE_TRADE_ROUTES,
  ANCIENT_CULTURAL_HOTSPOTS,
  REGIONAL_WEATHER_OVERLAYS,
  TradeRoute,
  CulturalHotspot,
  RegionalWeatherOverlay,
} from '../data/thematicOverlaysData';

interface MapsViewProps {
  onSelectPlace: (placeName: string) => void;
  initialQuery?: string;
}

export interface MapPOI {
  id: string;
  name: string;
  hindiName?: string;
  category: 'monument' | 'craft' | 'food' | 'stepwell' | 'nature';
  lat: number;
  lon: number;
  description: string;
  state: string;
  era?: string;
  imageUrl?: string;
}

export interface HeritageTrailStop {
  id: string;
  name: string;
  hindiName?: string;
  lat: number;
  lon: number;
  city: string;
  state: string;
  era: string;
  architecturalStyle: string;
  description: string;
  significance: string;
  imageUrl?: string;
}

export interface HeritageTrail {
  id: string;
  title: string;
  hindiTitle?: string;
  hindiName?: string;
  region: string;
  dynastyEra: string;
  themeColor: string;
  description: string;
  stops: HeritageTrailStop[];
  estimatedTotalKm: number;
  estimatedHours: string;
  isCustom?: boolean;
}

// 6 Curated Regional History Routes across India
const CURATED_REGIONAL_TRAILS: HeritageTrail[] = [
  {
    id: 'chola-dynasty-trail',
    title: 'Great Chola Living Chateaux & Temples',
    hindiTitle: 'महान चोल जीवित मंदिर गलियारा',
    region: 'Tamil Nadu • Kaveri Delta',
    dynastyEra: 'Medieval Chola Empire (10th–12th Century CE)',
    themeColor: '#d97706', // Golden Bronze
    description:
      'Trace the pinnacle of Dravidian granite architecture, monumental soaring vimanas, and lost-wax bronze casting across the rice bowls of the Kaveri delta.',
    estimatedTotalKm: 345,
    estimatedHours: '2-3 Days',
    stops: [
      {
        id: 'chola-1',
        name: 'Brihadisvara Temple (Thanjavur)',
        hindiName: 'तंजावुर बृहदीश्वर मंदिर',
        lat: 10.7828,
        lon: 79.1318,
        city: 'Thanjavur',
        state: 'Tamil Nadu',
        era: '1010 CE (Raja Raja Chola I)',
        architecturalStyle: 'Dravidian Monolithic Vimana',
        description: '66m granite tower built with an 80-tonne monolithic cupola crown without mortar.',
        significance: 'UNESCO World Heritage Site; supreme engineering monument of the golden Chola era.',
      },
      {
        id: 'chola-2',
        name: 'Gangaikonda Cholapuram',
        hindiName: 'गंगैकोंड चोलपुरम',
        lat: 11.2058,
        lon: 79.4526,
        city: 'Ariyalur',
        state: 'Tamil Nadu',
        era: '1035 CE (Rajendra Chola I)',
        architecturalStyle: 'Curvilinear Dravidian Temple',
        description: 'Built to commemorate Rajendra Chola’s victory over the Ganges and naval conquests.',
        significance: 'Houses a massive 4m monolithic lingam and delicate dancing Shiva bronzes.',
      },
      {
        id: 'chola-3',
        name: 'Airavatesvara Temple (Darasuram)',
        hindiName: 'ऐरावतेश्वर मंदिर (दारासुरम)',
        lat: 10.9493,
        lon: 79.3567,
        city: 'Kumbakonam',
        state: 'Tamil Nadu',
        era: '1166 CE (Rajaraja Chola II)',
        architecturalStyle: 'Miniature Filigree Dravidian Carvings',
        description: 'Conceived as a celestial stone chariot drawn by elephants, with musical stone steps.',
        significance: 'Inscribed with 63 stories of the Shaivite Nayanmar saints.',
      },
      {
        id: 'chola-4',
        name: 'Shore Temple & Pancha Rathas',
        hindiName: 'तट मंदिर एवं पंच रथ (महाबलीपुरम)',
        lat: 12.6167,
        lon: 80.1983,
        city: 'Mahabalipuram',
        state: 'Tamil Nadu',
        era: '700–728 CE (Narasimhavarman II)',
        architecturalStyle: 'Pallava Pre-Chola Coastal Rock-Cut',
        description: 'Ancient Coromandel seaport sanctuary facing the roaring waves of the Bay of Bengal.',
        significance: 'Maritime hub where Indian architectural idioms embarked toward Southeast Asia.',
      },
    ],
  },
  {
    id: 'rajput-forts-stepwells',
    title: 'Royal Rajput Fortresses & Desert Stepwells',
    hindiName: 'शाही राजपूत दुर्ग एवं जल बावड़ी परिपथ',
    region: 'Rajasthan • Thar & Aravalli Hills',
    dynastyEra: 'Rajput Era (8th–16th Century CE)',
    themeColor: '#ea580c', // Saffron Amber-Red
    description:
      'Traverse monumental hill fortresses built atop rugged crags paired with miraculous subterranean geometric stepwells designed to harvest precious monsoon waters.',
    estimatedTotalKm: 580,
    estimatedHours: '4-5 Days',
    stops: [
      {
        id: 'raj-1',
        name: 'Amer Fort & Panna Meena Kund',
        hindiName: 'आमेर दुर्ग एवं पन्ना मीना कुण्ड',
        lat: 26.9855,
        lon: 75.8513,
        city: 'Jaipur',
        state: 'Rajasthan',
        era: '1592 CE (Raja Man Singh I)',
        architecturalStyle: 'Rajput-Mughal Red Sandstone & Marble',
        description: 'Sheesh Mahal mirror mosaics overlooking Maota Lake alongside an 8-story stepwell.',
        significance: 'Impregnable defense citadel with intricate subterranean cooling corridors.',
      },
      {
        id: 'raj-2',
        name: 'Chand Baori Geometric Stepwell',
        hindiName: 'चांद बावड़ी (आभानेरी)',
        lat: 27.0071,
        lon: 76.5989,
        city: 'Abhaneri',
        state: 'Rajasthan',
        era: '800–900 CE (King Chanda / Nikumbha Dynasty)',
        architecturalStyle: 'Subterranean 3,500 Narrow Steps Geometry',
        description: '13 stories deep (30m) inverted pyramid with hypnotic fractal symmetry.',
        significance: 'One of the deepest and largest ancient rainwater harvesting reservoirs on Earth.',
      },
      {
        id: 'raj-3',
        name: 'Chittorgarh Hill Fortress',
        hindiName: 'चित्तौड़गढ़ दुर्ग एवं विजय स्तम्भ',
        lat: 24.8887,
        lon: 74.6269,
        city: 'Chittorgarh',
        state: 'Rajasthan',
        era: '7th–15th Century CE (Mewar Dynasty)',
        architecturalStyle: 'Massive Living Hill Bastion',
        description: 'Spread across 700 acres atop a 180m hill with the 9-story Victory Pillar (Vijay Stambha).',
        significance: 'Symbol of Rajput sacrifice and indomitable cultural resistance.',
      },
      {
        id: 'raj-4',
        name: 'Mehrangarh Fort',
        hindiName: 'मेहरानगढ़ दुर्ग (जोधपुर)',
        lat: 26.2978,
        lon: 73.0185,
        city: 'Jodhpur',
        state: 'Rajasthan',
        era: '1459 CE (Rao Jodha)',
        architecturalStyle: 'Perpendicular Basalt Cliff Citadel',
        description: 'Imposing fortress looming 120m over the Blue City with seven historic gates.',
        significance: 'Houses world-class armory, royal palanquins, and miniature Marwar court paintings.',
      },
      {
        id: 'raj-5',
        name: 'Jaisalmer Golden Sonar Qila',
        hindiName: 'सोनार किला (जैसलमेर)',
        lat: 26.9124,
        lon: 70.9126,
        city: 'Jaisalmer',
        state: 'Rajasthan',
        era: '1156 CE (Rawal Jaisal)',
        architecturalStyle: 'Yellow Sandstone Living Fort',
        description: 'One of the world’s few remaining living forts with 3,000 residents inside medieval walls.',
        significance: 'Silk road desert trade hub with 7 interconnected 12th-century Jain temples.',
      },
    ],
  },
  {
    id: 'vedic-ganga-pilgrimage',
    title: 'Sacred Ganga Vedic & Ghats Pilgrimage',
    hindiName: 'पवित्र गंगा वैदिक एवं घाट तीर्थ यात्रा',
    region: 'Uttarakhand & Uttar Pradesh',
    dynastyEra: 'Vedic Antiquity to Maratha Restoration',
    themeColor: '#0284c7', // Sacred River Blue
    description:
      'Follow the holy Ganga from the Himalayan foothills where mountain currents turn tranquil to the oldest continuously inhabited sacred city in human history.',
    estimatedTotalKm: 890,
    estimatedHours: '5-6 Days',
    stops: [
      {
        id: 'ganga-1',
        name: 'Har Ki Pauri Ghat & Brahma Kund',
        hindiName: 'हर की पौड़ी (हरिद्वार)',
        lat: 29.9575,
        lon: 78.1724,
        city: 'Haridwar',
        state: 'Uttarakhand',
        era: '1st Century BCE (King Vikramaditya)',
        architecturalStyle: 'Riverfront Vedic Sanctuary & Stone Steps',
        description: 'The spot where the celestial Ganga leaves the Himalayas and enters the plains of Bharat.',
        significance: 'Site of the Maha Kumbh Mela and evening synchronized brass lamp aarti.',
      },
      {
        id: 'ganga-2',
        name: 'Triveni Ghat & Swarg Ashram',
        hindiName: 'त्रिवेणी घाट (ऋषिकेश)',
        lat: 30.1086,
        lon: 78.2917,
        city: 'Rishikesh',
        state: 'Uttarakhand',
        era: 'Ancient Vedic Hermitage',
        architecturalStyle: 'Himalayan Foothill Confluence',
        description: 'Holy confluence of Ganga, Yamuna, and mythical Saraswati with Vedic chanting schools.',
        significance: 'World capital of yoga and philosophical contemplation.',
      },
      {
        id: 'ganga-3',
        name: 'Triveni Sangam & Akbar Fort',
        hindiName: 'त्रिवेणी संगम (प्रयागराज)',
        lat: 25.4299,
        lon: 81.8841,
        city: 'Prayagraj',
        state: 'Uttar Pradesh',
        era: 'Vedic Era (Mentioned in Rigveda)',
        architecturalStyle: 'Sacred River Confluence',
        description: 'Visually distinct meeting point of the pale emerald Ganga and deep indigo Yamuna.',
        significance: 'Epicenter of spiritual liberation and the world’s largest peaceful human gathering.',
      },
      {
        id: 'ganga-4',
        name: 'Kashi Vishwanath & Manikarnika Ghat',
        hindiName: 'काशी विश्वनाथ एवं मणिकर्णिका (वाराणसी)',
        lat: 25.3109,
        lon: 83.0107,
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        era: 'Ancient (Restored 1780 CE by Ahilyabai Holkar)',
        architecturalStyle: 'Gold-Spired Nagara Sanctum & 84 Ghats',
        description: 'The eternal Jyotirlinga city resting on the trident of Shiva with 24/7 eternal sacred fire.',
        significance: 'Spiritual core of Indian civilization with unbroken oral and musical traditions.',
      },
    ],
  },
  {
    id: 'hoysala-vijayanagara-symphony',
    title: 'Hoysala & Vijayanagara Stone Symphony',
    hindiName: 'होयसल एवं विजयनगर प्रस्तर संगीत',
    region: 'Karnataka • Deccan Plateau',
    dynastyEra: 'Hoysala (11th–14th c.) & Vijayanagara (14th–16th c.)',
    themeColor: '#7c3aed', // Royal Amethyst
    description:
      'Marvel at soapstone star-shaped temples micro-carved with jeweler precision, culminating at the boulder-strewn capital of the Vijayanagara Empire.',
    estimatedTotalKm: 420,
    estimatedHours: '3-4 Days',
    stops: [
      {
        id: 'hoysala-1',
        name: 'Chennakeshava Temple (Belur)',
        hindiName: 'चेन्नकेशव मंदिर (बेलूर)',
        lat: 13.1627,
        lon: 75.8604,
        city: 'Belur',
        state: 'Karnataka',
        era: '1117 CE (King Vishnuvardhana)',
        architecturalStyle: 'Stellate Chloritic Schist (Soapstone)',
        description: 'Took 103 years to build; features 42 Madanika bracket figures in dynamic dance postures.',
        significance: 'UNESCO World Heritage Site; pinnacle of medieval Indian stone filigree.',
      },
      {
        id: 'hoysala-2',
        name: 'Hoysaleswara Temple (Halebidu)',
        hindiName: 'होयसलेश्वर मंदिर (हलेबीडु)',
        lat: 13.2163,
        lon: 75.9936,
        city: 'Halebidu',
        state: 'Karnataka',
        era: '1121 CE (King Vishnuvardhana)',
        architecturalStyle: 'Dvikuta Twin-Sanctum Star Plan',
        description: '35,000 intricately carved wall sculptures depicting Ramayana, Mahabharata, and wildlife friezes.',
        significance: 'No two sculptures along the 200m relief frieze are identical.',
      },
      {
        id: 'hoysala-3',
        name: 'Shravanabelagola Gommateshwara',
        hindiName: 'श्रवणबेलगोला गोमटेश्वर बाहुबली',
        lat: 12.8575,
        lon: 76.4867,
        city: 'Hassan',
        state: 'Karnataka',
        era: '981 CE (Chavundaraya / Western Ganga)',
        architecturalStyle: '57-foot Monolithic Free-Standing Granite Colossus',
        description: 'Carved out of a single granite block atop Vindhyagiri hill without any joints.',
        significance: 'Jain beacon of peace, non-violence, and detachment.',
      },
      {
        id: 'hoysala-4',
        name: 'Virupaksha & Stone Chariot (Hampi)',
        hindiName: 'विरूपाक्ष मंदिर एवं प्रस्तर रथ (हम्पी)',
        lat: 15.335,
        lon: 76.46,
        city: 'Hampi',
        state: 'Karnataka',
        era: '1509 CE (Krishnadevaraya)',
        architecturalStyle: 'Vijayanagara Imperial Granite & Musical Columns',
        description: 'Mythical boulder valley on the Tungabhadra with musical stone pillars resonant with 7 swaras.',
        significance: 'UNESCO World Heritage Site; capital of the wealthiest empire in 16th-century Asia.',
      },
    ],
  },
  {
    id: 'solanki-stepwells-silk',
    title: 'Solanki Stepwells, Silk & Sun Route',
    hindiName: 'सोलंकी बावड़ी, रेशम एवं सूर्य परिपथ',
    region: 'Gujarat • North & Central',
    dynastyEra: 'Solanki / Chaulukya Dynasty (10th–13th Century CE)',
    themeColor: '#059669', // Emerald Jade
    description:
      'Explore the science of subterranean inverted stone temples, precision astronomical equinox alignments, and double-ikat silk guilds.',
    estimatedTotalKm: 320,
    estimatedHours: '2-3 Days',
    stops: [
      {
        id: 'solanki-1',
        name: 'Rani ki Vav Inverted Water Temple',
        hindiName: 'रानी की वाव (पाटन)',
        lat: 23.8589,
        lon: 72.1017,
        city: 'Patan',
        state: 'Gujarat',
        era: '1063 CE (Queen Udayamati)',
        architecturalStyle: 'Maru-Gurjara Subterranean Multi-Tiered',
        description: '7 levels of stairs with 500+ principal sculptures honoring water as a divine deity.',
        significance: 'UNESCO World Heritage Site; prime example of subterranean water sanctity.',
      },
      {
        id: 'solanki-2',
        name: 'Modhera Sun Temple',
        hindiName: 'मोढेरा सूर्य मंदिर',
        lat: 23.5835,
        lon: 72.1331,
        city: 'Modhera',
        state: 'Gujarat',
        era: '1026 CE (King Bhima I)',
        architecturalStyle: 'Solar Solstice Aligned Sabha Mandapa',
        description: 'Engineered so the first ray of the rising sun at equinox illuminated the sanctum jewel.',
        significance: 'Features the 108-shrine Surya Kund stepwell with stepped geometric bathing terraces.',
      },
      {
        id: 'solanki-3',
        name: 'Adalaj Stepwell (Gandhinagar)',
        hindiName: 'अडालज की वाव',
        lat: 23.1667,
        lon: 72.58,
        city: 'Gandhinagar',
        state: 'Gujarat',
        era: '1498 CE (Queen Rudabai & Mahmud Begada)',
        architecturalStyle: 'Indo-Islamic & Solanki Fusion 5-Story Octagon',
        description: 'Intricately ventilated subterranean pavilion keeping interior 6°C cooler than ambient desert.',
        significance: 'Unique harmonious fusion of Jain, Hindu, and Islamic ornamental carvings.',
      },
      {
        id: 'solanki-4',
        name: 'Champaner-Pavagadh Archaeological Park',
        hindiName: 'चांपानेर-पावागढ़ पुरातत्व पार्क',
        lat: 22.4842,
        lon: 73.5358,
        city: 'Panchmahal',
        state: 'Gujarat',
        era: '8th–16th Century CE',
        architecturalStyle: 'Pre-Mughal Islamic & Rajput Hill Settlement',
        description: 'Complete unexcavated medieval city with water structures, mosques, and Kalika Mata hilltop shrine.',
        significance: 'UNESCO World Heritage Site representing unbroken cultural layer from 8th to 16th century.',
      },
    ],
  },
  {
    id: 'buddhist-silk-nalanda',
    title: 'Buddhist Silk & Nalanda Knowledge Trail',
    hindiName: 'बौद्ध ज्ञान एवं नालंदा महाविहार मार्ग',
    region: 'Bihar & Uttar Pradesh',
    dynastyEra: 'Magadha, Maurya & Pala Dynasties (6th BCE–12th CE)',
    themeColor: '#ca8a04', // Saffron Ochre
    description:
      'Follow in the footsteps of Xuanzang and Ashoka through the world’s earliest residential university and the enlightenment tree of Shakyamuni Buddha.',
    estimatedTotalKm: 410,
    estimatedHours: '3-4 Days',
    stops: [
      {
        id: 'buddh-1',
        name: 'Nalanda Mahavihara Ancient University',
        hindiName: 'नालंदा महाविहार (विश्वविद्यालय)',
        lat: 25.1357,
        lon: 85.4447,
        city: 'Nalanda',
        state: 'Bihar',
        era: '5th Century CE (Kumargupta I / Gupta Empire)',
        architecturalStyle: 'Vihara Monastic Red Brick Architecture',
        description: 'World’s premier international residential university with 10,000 scholars and 9-story library.',
        significance: 'UNESCO World Heritage Site; pinnacle of ancient Buddhist logic, philosophy, and medicine.',
      },
      {
        id: 'buddh-2',
        name: 'Rajgir Gridhrakuta (Vulture Peak)',
        hindiName: 'राजगीर गृध्रकूट पर्वत',
        lat: 25.0131,
        lon: 85.4214,
        city: 'Rajgir',
        state: 'Bihar',
        era: '6th Century BCE (Magadha Empire)',
        architecturalStyle: 'Natural Stone Promontory & Vishwa Shanti Stupa',
        description: 'First capital of Magadha where Buddha delivered the Heart and Lotus Sutras.',
        significance: 'Sacred mountain hermitage with ancient Cyclopean dry-stone walls built in 600 BCE.',
      },
      {
        id: 'buddh-3',
        name: 'Mahabodhi Temple & Bodhi Tree',
        hindiName: 'महाबोधि मंदिर एवं बोधि वृक्ष (बोधगया)',
        lat: 24.696,
        lon: 84.9914,
        city: 'Bodh Gaya',
        state: 'Bihar',
        era: '3rd Century BCE (Emperor Ashoka) / 5th CE (Gupta)',
        architecturalStyle: '55m Pyramidal Brick Shikhara',
        description: 'Built directly adjacent to the sacred peepal tree where Gautama Buddha attained enlightenment.',
        significance: 'UNESCO World Heritage Site; foundational sacred site of world Buddhism.',
      },
      {
        id: 'buddh-4',
        name: 'Dhamek Stupa & Sarnath Deer Park',
        hindiName: 'धमेख स्तूप एवं हिरण वन (सारनाथ)',
        lat: 25.3811,
        lon: 83.0227,
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        era: '500 CE (Replaced Ashokan 249 BCE structure)',
        architecturalStyle: 'Massive Cylindrical Stupa with Floral Swags',
        description: 'The deer park where Buddha delivered his First Sermon (Dhammacakkappavattana Sutta).',
        significance: 'Site where the Four-Lion Capital of Ashoka (National Emblem of India) was unearthed.',
      },
    ],
  },
];

// Initial Indian POIs for Map Exploration
const INITIAL_INDIA_POIS: MapPOI[] = [
  {
    id: 'poi-1',
    name: 'Qutb Minar Complex',
    category: 'monument',
    lat: 28.5245,
    lon: 77.1855,
    description: '73m red sandstone tower with 4th-century rust-resistant iron pillar.',
    state: 'Delhi',
    era: '1192 CE',
  },
  {
    id: 'poi-2',
    name: 'Varanasi Assi to Manikarnika Ghats',
    category: 'monument',
    lat: 25.282,
    lon: 83.006,
    description: 'Continuous 84 riverfront stairways with morning Vedic chants and living rituals.',
    state: 'Uttar Pradesh',
    era: 'Antiquity',
  },
  {
    id: 'poi-3',
    name: 'Patan Double Ikat Patola Weaving Guild',
    category: 'craft',
    lat: 23.8343,
    lon: 72.1266,
    description: 'Ancient geometric silk weave where warp and weft are tie-dyed before weaving.',
    state: 'Gujarat',
    era: '12th c. CE',
  },
  {
    id: 'poi-4',
    name: 'Rani ki Vav Stepwell',
    category: 'stepwell',
    lat: 23.8589,
    lon: 72.1017,
    description: 'Subterranean 7-tiered inverted water temple with 500+ ornate stone carvings.',
    state: 'Gujarat',
    era: '1063 CE',
  },
  {
    id: 'poi-5',
    name: 'Hampi Virupaksha & Vittala Temple',
    category: 'monument',
    lat: 15.335,
    lon: 76.46,
    description: 'Musical pillared hall and granite chariot shrine on the banks of Tungabhadra.',
    state: 'Karnataka',
    era: '15th c. CE',
  },
  {
    id: 'poi-6',
    name: 'Brihadisvara Temple (Thanjavur)',
    category: 'monument',
    lat: 10.7828,
    lon: 79.1318,
    description: '66m monolithic granite vimana built in 1010 CE without mortar.',
    state: 'Tamil Nadu',
    era: '1010 CE',
  },
  {
    id: 'poi-7',
    name: 'Kondapalli Wooden Toy Artisans',
    category: 'craft',
    lat: 16.6192,
    lon: 80.5408,
    description: 'Generational soft-wood and tamarind-seed paste toy carving tradition.',
    state: 'Andhra Pradesh',
    era: '14th c. CE',
  },
  {
    id: 'poi-8',
    name: 'Kolkata College Street & Coffee House',
    category: 'food',
    lat: 22.5769,
    lon: 88.3639,
    description: 'Century-old literary adda tradition with traditional chops, cutlets, and mishti doi.',
    state: 'West Bengal',
    era: '19th c. CE',
  },
  {
    id: 'poi-9',
    name: 'Amber Fort & Panna Meena Stepwell',
    category: 'monument',
    lat: 26.9855,
    lon: 75.8513,
    description: 'Rajput-Mughal red sandstone fort and geometric stepwell.',
    state: 'Rajasthan',
    era: '1592 CE',
  },
  {
    id: 'poi-10',
    name: 'Chanderi Handloom Weaving Cluster',
    category: 'craft',
    lat: 24.7176,
    lon: 78.1364,
    description: 'Fine silk-cotton tissue weave with gold zari motifs dating to Vedic era.',
    state: 'Madhya Pradesh',
    era: '2nd c. BCE',
  },
];

// Helper: Haversine distance
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function calculateStopsDistanceKm(stops: { lat: number; lon: number }[]): number {
  if (stops.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineDistanceKm(stops[i].lat, stops[i].lon, stops[i + 1].lat, stops[i + 1].lon);
  }
  return Math.round(total);
}

export const MapsView: React.FC<MapsViewProps> = ({
  onSelectPlace,
  initialQuery = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const poiLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const trailLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const customDrawLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const thematicLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Thematic Map Overlays Layer State
  const [activeOverlays, setActiveOverlays] = useState<{
    tradeRoutes: boolean;
    culturalHotspots: boolean;
    weatherConditions: boolean;
  }>({
    tradeRoutes: true,
    culturalHotspots: false,
    weatherConditions: false,
  });

  const [selectedThematicItem, setSelectedThematicItem] = useState<{
    type: 'trade' | 'hotspot' | 'weather';
    item: any;
    post?: any;
  } | null>(null);

  // Search & POI State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(null);

  // Active Regional Trail
  const [activeTrailId, setActiveTrailId] = useState<string>('chola-dynasty-trail');
  const [selectedTrailStopIndex, setSelectedTrailStopIndex] = useState<number>(0);
  const [isSimulatingTour, setIsSimulatingTour] = useState<boolean>(false);
  const simulationIntervalRef = useRef<any>(null);

  // Custom Trail Drawing Mode
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [customStops, setCustomStops] = useState<HeritageTrailStop[]>([]);
  const [customTrailTitle, setCustomTrailTitle] = useState<string>('My Custom Heritage Circuit');
  const [customTrailColor, setCustomTrailColor] = useState<string>('#ea580c');
  const [showSaveTrailModal, setShowSaveTrailModal] = useState<boolean>(false);
  const [savedUserTrails, setSavedUserTrails] = useState<HeritageTrail[]>([]);

  // Routing State between single stops or user location
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [routeMode, setRouteMode] = useState<'driving' | 'walking'>('driving');
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load saved custom trails from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aarambh_custom_trails');
      if (stored) {
        setSavedUserTrails(JSON.parse(stored));
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // All Trails (Curated + Saved Custom Trails)
  const allAvailableTrails = [...CURATED_REGIONAL_TRAILS, ...savedUserTrails];
  const currentTrail = allAvailableTrails.find((t) => t.id === activeTrailId) || CURATED_REGIONAL_TRAILS[0];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [10.7828, 79.1318], // Center initially on Thanjavur (Chola Trail)
        zoom: 7,
        zoomControl: true,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri, HERE, Garmin, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), (c) OpenStreetMap contributors | Aarambh Living Heritage Atlas',
        maxZoom: 19,
      }).addTo(map);

      poiLayerGroupRef.current = L.layerGroup().addTo(map);
      trailLayerGroupRef.current = L.layerGroup().addTo(map);
      customDrawLayerGroupRef.current = L.layerGroup().addTo(map);
      thematicLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Map Click in Custom Drawing Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const onMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingMode) return;

      const newLat = Number(e.latlng.lat.toFixed(4));
      const newLon = Number(e.latlng.lng.toFixed(4));

      // Create new waypoint stop
      const stopNumber = customStops.length + 1;
      const newStop: HeritageTrailStop = {
        id: `custom-stop-${Date.now()}`,
        name: `Stop ${stopNumber}`,
        lat: newLat,
        lon: newLon,
        city: 'Waymarked Point',
        state: 'Custom Trail Point',
        era: 'Explorer Marked',
        architecturalStyle: 'Heritage Waypoint',
        description: `Waymarked coordinates: ${newLat}°N, ${newLon}°E.`,
        significance: 'User custom marked trail waypoint.',
      };

      setCustomStops((prev) => [...prev, newStop]);
      showToast(`Added Stop ${stopNumber} (${newLat.toFixed(2)}°N, ${newLon.toFixed(2)}°E)`);
    };

    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [isDrawingMode, customStops.length]);

  // Render POI Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = poiLayerGroupRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // If drawing mode is on or focusing on a trail, keep POIs subtle or filtered
    const filtered = INITIAL_INDIA_POIS.filter(
      (p) => activeCategory === 'all' || p.category === activeCategory
    );

    filtered.forEach((poi) => {
      const color =
        poi.category === 'monument'
          ? '#b45309'
          : poi.category === 'craft'
          ? '#c2410c'
          : poi.category === 'food'
          ? '#15803d'
          : '#0284c7';

      const icon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.15s ease;
          " title="${poi.name}">
            ${poi.category === 'monument' ? '🏛️' : poi.category === 'craft' ? '🧵' : poi.category === 'food' ? '🍛' : '💧'}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([poi.lat, poi.lon], { icon }).addTo(layer);
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedPOI(poi);

        // If in drawing mode, offer to append this POI as a trail stop
        if (isDrawingMode) {
          const stopNumber = customStops.length + 1;
          const newStop: HeritageTrailStop = {
            id: `poi-stop-${poi.id}-${Date.now()}`,
            name: poi.name,
            lat: poi.lat,
            lon: poi.lon,
            city: poi.name,
            state: poi.state,
            era: poi.era || 'Historic Era',
            architecturalStyle: poi.category.toUpperCase(),
            description: poi.description,
            significance: `POI added to custom trail: ${poi.description}`,
          };
          setCustomStops((prev) => [...prev, newStop]);
          showToast(`Added "${poi.name}" as Stop ${stopNumber} to your trail!`);
        } else {
          map.setView([poi.lat, poi.lon], 12, { animate: true });
        }
      });
    });
  }, [activeCategory, isDrawingMode, customStops.length]);

  // Render Active Regional Heritage Trail
  useEffect(() => {
    const map = mapInstanceRef.current;
    const trailGroup = trailLayerGroupRef.current;
    if (!map || !trailGroup) return;

    trailGroup.clearLayers();

    if (!currentTrail || currentTrail.stops.length === 0) return;

    const stopCoords: [number, number][] = currentTrail.stops.map((s) => [s.lat, s.lon]);

    // 1. Draw glowing background line
    L.polyline(stopCoords, {
      color: currentTrail.themeColor,
      weight: 8,
      opacity: 0.3,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(trailGroup);

    // 2. Draw thematic animated route line
    const routeLine = L.polyline(stopCoords, {
      color: currentTrail.themeColor,
      weight: 4,
      opacity: 0.95,
      dashArray: '10, 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(trailGroup);

    // 3. Render numbered stop markers (①, ②, ③, ④)
    currentTrail.stops.forEach((stop, index) => {
      const isSelected = selectedTrailStopIndex === index;
      const markerHtml = `
        <div style="
          position: relative;
          width: ${isSelected ? '36px' : '30px'};
          height: ${isSelected ? '36px' : '30px'};
          border-radius: 50%;
          background: ${isSelected ? '#1c1917' : currentTrail.themeColor};
          color: white;
          border: 3px solid ${isSelected ? currentTrail.themeColor : '#ffffff'};
          box-shadow: 0 8px 16px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-weight: 900;
          font-size: ${isSelected ? '14px' : '12px'};
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          ${index + 1}
          <div style="
            position: absolute;
            bottom: -18px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            background: rgba(28, 25, 23, 0.9);
            color: #fef3c7;
            font-size: 10px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 6px;
            border: 1px solid rgba(217, 119, 6, 0.5);
            pointer-events: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${stop.name.split('(')[0].trim().slice(0, 16)}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'trail-stop-marker',
        html: markerHtml,
        iconSize: [isSelected ? 36 : 30, isSelected ? 36 : 30],
        iconAnchor: [isSelected ? 18 : 15, isSelected ? 18 : 15],
      });

      const marker = L.marker([stop.lat, stop.lon], { icon }).addTo(trailGroup);
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedTrailStopIndex(index);
        map.setView([stop.lat, stop.lon], 13, { animate: true });
      });
    });

    // Fit bounds to show entire trail
    if (stopCoords.length > 0) {
      map.fitBounds(L.latLngBounds(stopCoords), {
        padding: [60, 60],
        maxZoom: 12,
        animate: true,
      });
    }
  }, [activeTrailId, selectedTrailStopIndex, allAvailableTrails.length]);

  // Render Custom Drawn Stops & Line
  useEffect(() => {
    const map = mapInstanceRef.current;
    const customGroup = customDrawLayerGroupRef.current;
    if (!map || !customGroup) return;

    customGroup.clearLayers();

    if (customStops.length === 0) return;

    const coords: [number, number][] = customStops.map((s) => [s.lat, s.lon]);

    // Draw custom polyline connecting user points
    if (coords.length >= 2) {
      L.polyline(coords, {
        color: customTrailColor,
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 6',
      }).addTo(customGroup);
    }

    // Numbered custom markers
    customStops.forEach((stop, idx) => {
      const icon = L.divIcon({
        className: 'custom-draw-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: ${customTrailColor};
            border: 2px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 13px;
            font-weight: bold;
            font-family: monospace;
            cursor: pointer;
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([stop.lat, stop.lon], { icon }).addTo(customGroup);
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        showToast(`Stop ${idx + 1}: ${stop.name} (${stop.lat}°N, ${stop.lon}°E)`);
      });
    });
  }, [customStops, customTrailColor]);

  // Render Thematic Overlays (Pre-Independence Trade Routes, Ancient Cultural Hotspots, Weather Conditions)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const thematicGroup = thematicLayerGroupRef.current;
    if (!map || !thematicGroup) return;

    thematicGroup.clearLayers();

    // 1. Pre-Independence Historic Trade Routes
    if (activeOverlays.tradeRoutes) {
      PRE_INDEPENDENCE_TRADE_ROUTES.forEach((route) => {
        // High-contrast background glow line
        L.polyline(route.path, {
          color: '#ffffff',
          weight: 7,
          opacity: 0.65,
        }).addTo(thematicGroup);

        // Core styled dashed polyline
        const polyline = L.polyline(route.path, {
          color: route.color,
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 6',
        }).addTo(thematicGroup);

        polyline.bindTooltip(
          `<strong>${route.name}</strong><br/><span style="font-size:10px;color:#666;">${route.era}</span>`,
          { sticky: true }
        );

        polyline.on('click', () => {
          setSelectedThematicItem({ type: 'trade', item: route });
        });

        // Key trade posts & ports
        route.keyPortsAndPosts.forEach((post) => {
          const postIcon = L.divIcon({
            className: 'trade-post-marker',
            html: `
              <div style="
                background: ${route.color};
                border: 2px solid white;
                box-shadow: 0 3px 8px rgba(0,0,0,0.35);
                border-radius: 9999px;
                padding: 2px 7px;
                color: white;
                font-size: 10px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 3px;
                white-space: nowrap;
                cursor: pointer;
              ">
                <span>📦</span>
                <span>${post.name}</span>
              </div>
            `,
            iconSize: [120, 24],
            iconAnchor: [60, 12],
          });

          const postMarker = L.marker([post.lat, post.lon], { icon: postIcon }).addTo(thematicGroup);
          postMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedThematicItem({ type: 'trade', item: route, post });
          });
        });
      });
    }

    // 2. Ancient Cultural Hotspots
    if (activeOverlays.culturalHotspots) {
      ANCIENT_CULTURAL_HOTSPOTS.forEach((hotspot) => {
        // Outer radiant circle zone
        L.circle([hotspot.lat, hotspot.lon], {
          radius: hotspot.radiusKm * 1000,
          color: hotspot.color,
          fillColor: hotspot.color,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '5, 5',
        }).addTo(thematicGroup);

        // Core glowing pulsing hotspot marker
        const hotspotIcon = L.divIcon({
          className: 'cultural-hotspot-marker',
          html: `
            <div style="
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: ${hotspot.color};
                border: 2.5px solid #ffffff;
                box-shadow: 0 0 14px ${hotspot.color}, 0 4px 8px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                color: white;
              ">
                🏛️
              </div>
              <div style="
                position: absolute;
                top: 38px;
                background: rgba(24, 24, 27, 0.92);
                color: #fef3c7;
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 9px;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                border: 1px solid rgba(251, 191, 36, 0.5);
              ">
                ${hotspot.name.split('(')[0].split('/')[0].trim()}
              </div>
            </div>
          `,
          iconSize: [40, 54],
          iconAnchor: [20, 18],
        });

        const hotspotMarker = L.marker([hotspot.lat, hotspot.lon], { icon: hotspotIcon }).addTo(thematicGroup);
        hotspotMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedThematicItem({ type: 'hotspot', item: hotspot });
        });
      });
    }

    // 3. Current Weather Conditions Overlays
    if (activeOverlays.weatherConditions) {
      REGIONAL_WEATHER_OVERLAYS.forEach((weather) => {
        const weatherIcon = L.divIcon({
          className: 'weather-zone-marker',
          html: `
            <div style="
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(4px);
              border: 1.5px solid #0284c7;
              border-radius: 12px;
              padding: 4px 8px;
              box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
              display: flex;
              align-items: center;
              gap: 6px;
              cursor: pointer;
              font-family: sans-serif;
            ">
              <span style="font-size: 16px;">${weather.weatherIcon}</span>
              <div style="text-align: left; line-height: 1.1;">
                <div style="font-size: 11px; font-weight: 800; color: #0f172a;">${weather.tempC}°C</div>
                <div style="font-size: 9px; font-weight: 600; color: #64748b; white-space: nowrap;">${weather.city}</div>
              </div>
            </div>
          `,
          iconSize: [95, 34],
          iconAnchor: [48, 17],
        });

        const weatherMarker = L.marker([weather.lat, weather.lon], { icon: weatherIcon }).addTo(thematicGroup);
        weatherMarker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedThematicItem({ type: 'weather', item: weather });
        });
      });
    }
  }, [activeOverlays]);

  // Virtual Journey Simulation: Step through trail automatically
  const toggleTourSimulation = () => {
    if (isSimulatingTour) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      setIsSimulatingTour(false);
      showToast('Simulation paused');
    } else {
      setIsSimulatingTour(true);
      showToast(`Starting virtual tour of ${currentTrail.title}...`);

      let nextIndex = (selectedTrailStopIndex + 1) % currentTrail.stops.length;
      setSelectedTrailStopIndex(nextIndex);
      if (mapInstanceRef.current) {
        const nextStop = currentTrail.stops[nextIndex];
        mapInstanceRef.current.flyTo([nextStop.lat, nextStop.lon], 13, { duration: 2 });
      }

      simulationIntervalRef.current = setInterval(() => {
        setSelectedTrailStopIndex((prev) => {
          const updated = (prev + 1) % currentTrail.stops.length;
          if (mapInstanceRef.current) {
            const st = currentTrail.stops[updated];
            mapInstanceRef.current.flyTo([st.lat, st.lon], 13, { duration: 2.5 });
          }
          return updated;
        });
      }, 4500);
    }
  };

  // Undo Last Custom Stop
  const handleUndoCustomStop = () => {
    if (customStops.length === 0) return;
    setCustomStops((prev) => prev.slice(0, -1));
    showToast('Removed last placed stop.');
  };

  // Clear Custom Trail
  const handleClearCustomTrail = () => {
    setCustomStops([]);
    showToast('Cleared custom trail.');
  };

  // Save Custom Trail to localStorage
  const handleSaveCustomTrail = () => {
    if (customStops.length < 2) {
      showToast('Place at least 2 stops on the map to save a trail.');
      return;
    }

    const totalKm = calculateStopsDistanceKm(customStops);
    const newTrail: HeritageTrail = {
      id: `custom-trail-${Date.now()}`,
      title: customTrailTitle.trim() || 'My Custom Heritage Circuit',
      region: 'User Created Route',
      dynastyEra: 'Custom Multi-Stop Trail',
      themeColor: customTrailColor,
      description: `Custom multi-stop heritage trail with ${customStops.length} stops across ${totalKm} km.`,
      stops: customStops,
      estimatedTotalKm: totalKm,
      estimatedHours: `${Math.round(totalKm / 50) + 1} Hours`,
      isCustom: true,
    };

    const updated = [newTrail, ...savedUserTrails];
    setSavedUserTrails(updated);
    localStorage.setItem('aarambh_custom_trails', JSON.stringify(updated));

    setActiveTrailId(newTrail.id);
    setSelectedTrailStopIndex(0);
    setIsDrawingMode(false);
    setCustomStops([]);
    setShowSaveTrailModal(false);
    showToast(`Saved custom trail: "${newTrail.title}"!`);
  };

  // Delete Custom Trail
  const handleDeleteCustomTrail = (trailId: string) => {
    const filtered = savedUserTrails.filter((t) => t.id !== trailId);
    setSavedUserTrails(filtered);
    localStorage.setItem('aarambh_custom_trails', JSON.stringify(filtered));
    if (activeTrailId === trailId) {
      setActiveTrailId(CURATED_REGIONAL_TRAILS[0].id);
    }
    showToast('Deleted custom trail.');
  };

  // Share Trail via Web Share API
  const handleShareTrail = async (trail: HeritageTrail) => {
    const stopsList = trail.stops.map((s, i) => `${i + 1}. ${s.name}`).join('\n');
    await executeWebShare({
      title: `AARAMBH Heritage Trail: ${trail.title}`,
      text: `Explore the "${trail.title}" on Aarambh Living Heritage Atlas!\n\nRegion: ${trail.region}\nDynasty: ${trail.dynastyEra}\nDistance: ${trail.estimatedTotalKm} km\n\nStops:\n${stopsList}\n\nTrace living memory routes across India:`,
      url: window.location.href,
    });
  };

  // Handle Search any Indian location
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await geocodeSearch(searchQuery);
      if (results && results.length > 0 && mapInstanceRef.current) {
        const geo = results[0];
        mapInstanceRef.current.setView([geo.lat, geo.lon], 13, { animate: true });

        const newPOI: MapPOI = {
          id: `custom-${Date.now()}`,
          name: geo.placeName,
          category: 'monument',
          lat: geo.lat,
          lon: geo.lon,
          description: geo.formattedAddress,
          state: geo.state || 'India',
        };
        setSelectedPOI(newPOI);

        if (poiLayerGroupRef.current) {
          const searchIcon = L.divIcon({
            className: 'searched-marker',
            html: `
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: #ea580c;
                border: 3px solid white;
                box-shadow: 0 6px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                cursor: pointer;
              ">📍</div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          L.marker([geo.lat, geo.lon], { icon: searchIcon }).addTo(poiLayerGroupRef.current);
        }
      }
    } catch (err) {
      console.error('Maps view search error', err);
    } finally {
      setSearching(false);
    }
  };

  const selectedStop = currentTrail.stops[selectedTrailStopIndex] || currentTrail.stops[0];

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 selection:bg-amber-100 selection:text-amber-950">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-amber-300 px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl border border-amber-500/40 backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER: ATLAS TITLE, SEARCH & CUSTOM DRAWING LAUNCHER */}
      <section className="bg-stone-900 text-stone-100 py-5 px-4 sm:px-6 border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heritage text-lg sm:text-xl font-bold text-amber-100 tracking-wide flex items-center gap-2">
                <span>🗺️</span>
                <span>DYNAMIC CULTURAL ATLAS & HERITAGE TRAILS</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 font-mono">
                Interactive Multi-Stop Routes
              </span>
            </div>
            <p className="text-xs text-stone-400 font-light mt-0.5">
              Toggle between regional history corridors across India or draw custom multi-stop circuits with live distance & waypoint tracking.
            </p>
          </div>

          {/* Right Action Bar: Custom Trail Draw Toggle & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Custom Trail Draw Mode Toggle */}
            <button
              onClick={() => {
                const nextMode = !isDrawingMode;
                setIsDrawingMode(nextMode);
                if (nextMode) {
                  showToast('Trail Drawing Mode ACTIVE! Click anywhere on map to drop stops.');
                } else {
                  showToast('Exited Trail Drawing Mode.');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                isDrawingMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 ring-2 ring-amber-300 shadow-amber-900/30'
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isDrawingMode ? 'Drawing Mode: ACTIVE' : '✏️ Draw Custom Trail'}</span>
            </button>

            {/* Geocode Search */}
            <form onSubmit={handleSearch} className="flex-1 lg:w-72">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search temple, ghat or fort..."
                  className="w-full pl-9 pr-16 py-2 rounded-xl bg-stone-800/90 border border-stone-700 text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-[11px] cursor-pointer"
                >
                  {searching ? '...' : 'Go'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* REGIONAL TRAIL SELECTOR BAR */}
        <div className="max-w-7xl mx-auto pt-4 border-t border-stone-800/80 mt-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400/90 tracking-wider flex items-center gap-1.5">
              <RouteIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Regional History Route:</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">
              {allAvailableTrails.length} Routes Available
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allAvailableTrails.map((trail) => {
              const isActive = activeTrailId === trail.id;
              return (
                <button
                  key={trail.id}
                  onClick={() => {
                    setActiveTrailId(trail.id);
                    setSelectedTrailStopIndex(0);
                    if (isSimulatingTour && simulationIntervalRef.current) {
                      clearInterval(simulationIntervalRef.current);
                      setIsSimulatingTour(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-black shadow-md ring-2 ring-amber-400/50'
                      : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300 border border-stone-700/60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: trail.themeColor }}
                  />
                  <span>{trail.title}</span>
                  {trail.isCustom && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-stone-900 text-amber-300">
                      User
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ACTIVE DRAWING HUD BAR (Visible when Drawing Mode is active) */}
      {isDrawingMode && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <PenTool className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="font-bold text-stone-900 flex items-center gap-2">
                  <span>Custom Trail Drawing Mode Active</span>
                  <span className="px-2 py-0.2 rounded bg-amber-200 text-amber-950 font-mono text-[10px] font-bold">
                    {customStops.length} Stops Placed
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Click anywhere on the map to add sequential waypoints. Total trail distance: <strong>{calculateStopsDistanceKm(customStops)} km</strong>.
                </p>
              </div>
            </div>

            {/* Drawing Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUndoCustomStop}
                disabled={customStops.length === 0}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                title="Undo last placed stop"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>

              <button
                type="button"
                onClick={handleClearCustomTrail}
                disabled={customStops.length === 0}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-red-700 hover:bg-red-50 disabled:opacity-40 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                title="Clear all points"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSaveTrailModal(true)}
                disabled={customStops.length < 2}
                className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Trail</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDrawingMode(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-200 cursor-pointer"
                title="Close Drawing HUD"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SAVE CUSTOM TRAIL MODAL */}
      {showSaveTrailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
                  <Save className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-heritage">
                    Save Custom Heritage Trail
                  </h3>
                  <p className="text-[10px] text-stone-500">
                    {customStops.length} stops • {calculateStopsDistanceKm(customStops)} km total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSaveTrailModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Trail Name / Circuit Title:
                </label>
                <input
                  type="text"
                  value={customTrailTitle}
                  onChange={(e) => setCustomTrailTitle(e.target.value)}
                  placeholder="e.g. Malwa Sultanate Forts, Konkan Coastline..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Trail Color Accent:
                </label>
                <div className="flex items-center gap-2">
                  {['#d97706', '#ea580c', '#0284c7', '#7c3aed', '#059669', '#ca8a04', '#e11d48'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCustomTrailColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        customTrailColor === c ? 'scale-125 ring-2 ring-stone-900' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Stops Preview List */}
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] font-bold font-mono text-stone-500 uppercase">
                  Waypoints sequence:
                </span>
                {customStops.map((st, i) => (
                  <div key={st.id} className="text-[11px] text-stone-700 flex items-center justify-between">
                    <span className="font-semibold">{i + 1}. {st.name}</span>
                    <span className="text-stone-400 font-mono text-[9px]">{st.lat}°N, {st.lon}°E</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowSaveTrailModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomTrail}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 cursor-pointer shadow-md"
              >
                Save & View Circuit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN MAP CONTAINER WITH SIDE/BOTTOM DRAWER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl border border-stone-300 shadow-xl overflow-hidden bg-stone-100 min-h-[640px] flex flex-col lg:flex-row">
          
          {/* LEFT/SIDEBAR: ACTIVE HERITAGE TRAIL DOSSIER & STOP TIMELINE */}
          <div className="w-full lg:w-96 p-4 sm:p-5 bg-white border-b lg:border-b-0 lg:border-r border-stone-200 z-10 flex flex-col justify-between space-y-4 shrink-0 shadow-lg lg:max-h-[640px] overflow-y-auto">
            <div className="space-y-4">
              
              {/* Active Trail Header Card */}
              <div
                className="p-3.5 rounded-2xl border space-y-2 relative overflow-hidden"
                style={{
                  backgroundColor: `${currentTrail.themeColor}12`,
                  borderColor: `${currentTrail.themeColor}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-md text-white shadow-2xs"
                    style={{ backgroundColor: currentTrail.themeColor }}
                  >
                    {currentTrail.isCustom ? 'Custom Trail' : 'Regional History Corridor'}
                  </span>
                  <span className="text-[11px] font-bold text-stone-700 font-mono">
                    {currentTrail.estimatedTotalKm} km • {currentTrail.estimatedHours}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold font-heritage text-stone-900 leading-snug">
                    {currentTrail.title}
                  </h3>
                  {currentTrail.hindiTitle && (
                    <p className="text-xs text-stone-600 font-serif italic">
                      {currentTrail.hindiTitle}
                    </p>
                  )}
                  <p className="text-[11px] text-amber-900 font-semibold font-mono mt-0.5">
                    {currentTrail.region} • {currentTrail.dynastyEra}
                  </p>
                </div>

                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  {currentTrail.description}
                </p>

                {/* Tour Simulation & Share Controls */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-200/80">
                  <button
                    type="button"
                    onClick={toggleTourSimulation}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSimulatingTour
                        ? 'bg-amber-600 text-stone-950 animate-pulse'
                        : 'bg-stone-900 hover:bg-black text-amber-300'
                    }`}
                  >
                    {isSimulatingTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isSimulatingTour ? 'Pause Tour' : 'Simulate Tour'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareTrail(currentTrail)}
                    className="p-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                    title="Share Trail"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  {currentTrail.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomTrail(currentTrail.id)}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                      title="Delete Custom Trail"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Waypoints Sequence Timeline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span>Trail Stops ({currentTrail.stops.length})</span>
                  <span className="text-[10px] text-stone-400 font-normal">Click stop to inspect</span>
                </div>

                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {currentTrail.stops.map((stop, index) => {
                    const isSelected = selectedTrailStopIndex === index;
                    return (
                      <div
                        key={stop.id}
                        onClick={() => {
                          setSelectedTrailStopIndex(index);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.setView([stop.lat, stop.lon], 13, {
                              animate: true,
                            });
                          }
                        }}
                        className={`p-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-100/90 border border-amber-300 font-bold text-stone-950 shadow-2xs'
                            : 'hover:bg-stone-50 border border-transparent text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] text-white shrink-0 font-bold"
                            style={{ backgroundColor: currentTrail.themeColor }}
                          >
                            {index + 1}
                          </span>
                          <div className="truncate">
                            <div className="truncate">{stop.name}</div>
                            <div className="text-[9px] text-stone-500 font-mono truncate">
                              {stop.city}, {stop.state}
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stop Deep Dive Card */}
              {selectedStop && (
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Stop {selectedTrailStopIndex + 1} of {currentTrail.stops.length}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">{selectedStop.era}</span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm">
                    {selectedStop.name}
                  </h4>

                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    {selectedStop.description}
                  </p>

                  <div className="p-2 rounded-xl bg-white border border-stone-200 text-[10px] text-stone-700">
                    <strong>Architectural Note:</strong> {selectedStop.architecturalStyle}. {selectedStop.significance}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPlace(selectedStop.name.split('(')[0].trim())}
                    className="w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Explore Living Lore & Artifacts</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT / MAIN LEAFLET MAP CANVAS */}
          <div className="flex-1 w-full relative min-h-[500px] lg:min-h-[640px]">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Thematic Map Overlays & Layer Toggle Control */}
            <div className="absolute top-3 right-3 z-10 max-w-[280px] sm:max-w-xs flex flex-col gap-2">
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-stone-200 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Thematic Map Overlays</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                    LAYER TOGGLE
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* 1. Pre-Independence Trade Routes Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveOverlays((prev) => ({
                        ...prev,
                        tradeRoutes: !prev.tradeRoutes,
                      }))
                    }
                    className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeOverlays.tradeRoutes
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs ring-1 ring-amber-400'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">📜</span>
                      <div className="truncate">
                        <div className="leading-tight font-bold">Trade Routes</div>
                        <div className="text-[9px] opacity-80 font-normal truncate">Pre-Independence Highways</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5 ${
                        activeOverlays.tradeRoutes ? 'bg-stone-950 text-amber-300' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {activeOverlays.tradeRoutes ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* 2. Ancient Cultural Hotspots Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveOverlays((prev) => ({
                        ...prev,
                        culturalHotspots: !prev.culturalHotspots,
                      }))
                    }
                    className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeOverlays.culturalHotspots
                        ? 'bg-purple-600 text-white font-bold shadow-xs ring-1 ring-purple-400'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">🏛️</span>
                      <div className="truncate">
                        <div className="leading-tight font-bold">Cultural Hotspots</div>
                        <div className="text-[9px] opacity-80 font-normal truncate">Ancient Universities & Shrines</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5 ${
                        activeOverlays.culturalHotspots ? 'bg-white text-purple-900' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {activeOverlays.culturalHotspots ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* 3. Current Weather Conditions Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveOverlays((prev) => ({
                        ...prev,
                        weatherConditions: !prev.weatherConditions,
                      }))
                    }
                    className={`w-full p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      activeOverlays.weatherConditions
                        ? 'bg-sky-600 text-white font-bold shadow-xs ring-1 ring-sky-400'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">⛅</span>
                      <div className="truncate">
                        <div className="leading-tight font-bold">Weather Conditions</div>
                        <div className="text-[9px] opacity-80 font-normal truncate">Current Pilgrimage Weather</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ml-1.5 ${
                        activeOverlays.weatherConditions ? 'bg-white text-sky-900' : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {activeOverlays.weatherConditions ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>

                {/* Quick Actions: Enable All / Clear All */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px]">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveOverlays({
                        tradeRoutes: true,
                        culturalHotspots: true,
                        weatherConditions: true,
                      })
                    }
                    className="text-amber-800 hover:underline font-semibold cursor-pointer"
                  >
                    Enable All Overlays
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveOverlays({
                        tradeRoutes: false,
                        culturalHotspots: false,
                        weatherConditions: false,
                      })
                    }
                    className="text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Collapsible POI category filter */}
              <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-stone-200 shadow-md flex items-center gap-1 overflow-x-auto text-[10px]">
                <span className="font-bold text-stone-500 pl-1 shrink-0">POIs:</span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'monument', label: '🏛️ Monuments' },
                  { id: 'craft', label: '🧵 Crafts' },
                  { id: 'stepwell', label: '💧 Stepwells' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCategory(c.id)}
                    className={`px-2 py-0.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                      activeCategory === c.id
                        ? 'bg-stone-900 text-white font-bold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal / Card for Selected Thematic Item */}
            {selectedThematicItem && (
              <div className="absolute bottom-4 right-4 z-20 max-w-sm w-[90%] sm:w-full bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-stone-200 shadow-2xl animate-fade-in text-xs space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono bg-amber-100 text-amber-900">
                      {selectedThematicItem.type === 'trade'
                        ? 'Pre-Independence Trade Route'
                        : selectedThematicItem.type === 'hotspot'
                        ? 'Ancient Cultural Hotspot'
                        : 'Current Weather Conditions'}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1">
                      {selectedThematicItem.post?.name || selectedThematicItem.item.name || selectedThematicItem.item.city}
                    </h4>
                    {selectedThematicItem.item.hindiName && (
                      <div className="text-[11px] text-amber-900 font-devanagari font-semibold">
                        {selectedThematicItem.item.hindiName}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedThematicItem(null)}
                    className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedThematicItem.type === 'trade' && (
                  <div className="space-y-1.5 text-stone-600">
                    {selectedThematicItem.post ? (
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200">
                        <div className="font-bold text-stone-900 text-[11px]">Trade Role & Customs:</div>
                        <div className="text-[10px] text-stone-600 mt-0.5">{selectedThematicItem.post.role}</div>
                      </div>
                    ) : (
                      <p className="text-[11px] leading-relaxed">{selectedThematicItem.item.description}</p>
                    )}
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] space-y-1">
                      <div className="font-bold text-amber-950">Historical Commodities:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedThematicItem.item.historicalGoods?.map((g: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white border border-amber-200 text-stone-700 font-medium">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedThematicItem.type === 'hotspot' && (
                  <div className="space-y-1.5 text-stone-600">
                    <p className="text-[11px] leading-relaxed">{selectedThematicItem.item.significance}</p>
                    <div className="text-[10px]">
                      <strong>Notable Scholars:</strong> {selectedThematicItem.item.notableFigures?.join(', ')}
                    </div>
                    <div className="text-[10px]">
                      <strong>Preserved Artifacts:</strong> {selectedThematicItem.item.preservedArtifacts}
                    </div>
                  </div>
                )}

                {selectedThematicItem.type === 'weather' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                      <span className="text-3xl">{selectedThematicItem.item.weatherIcon}</span>
                      <div>
                        <div className="text-base font-bold text-stone-900">{selectedThematicItem.item.tempC}°C</div>
                        <div className="text-[11px] text-sky-900 font-medium">{selectedThematicItem.item.condition}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-stone-600">
                      <strong>Best Visiting Window:</strong> {selectedThematicItem.item.bestVisitingTime}
                    </div>
                    {selectedThematicItem.item.heatAdvisory && (
                      <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
                        ⚠️ {selectedThematicItem.item.heatAdvisory}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const place =
                        selectedThematicItem.post?.name ||
                        selectedThematicItem.item.name ||
                        selectedThematicItem.item.city;
                      onSelectPlace(place.split('(')[0].trim());
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                  >
                    <span>Explore in Aarambh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Drawing Mode Prompt Overlay in bottom corner */}
            {isDrawingMode && (
              <div className="absolute bottom-4 left-4 z-10 bg-stone-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-amber-500/50 shadow-xl max-w-xs text-xs animate-fade-in">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Click to Place Stops</span>
                </div>
                <p className="text-[11px] text-stone-300 leading-snug">
                  Click any point or monument on the map. They will automatically be connected in sequential order with live distance calculation.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
