export interface TradeRoute {
  id: string;
  name: string;
  hindiName: string;
  era: string;
  color: string;
  description: string;
  historicalGoods: string[];
  path: [number, number][]; // [lat, lon]
  keyPortsAndPosts: {
    name: string;
    lat: number;
    lon: number;
    role: string;
  }[];
}

export interface CulturalHotspot {
  id: string;
  name: string;
  hindiName: string;
  category: 'Vedic Philosophy' | 'University & Science' | 'Maritime Trade' | 'Temple Architecture' | 'Literature & Sangam';
  lat: number;
  lon: number;
  radiusKm: number;
  era: string;
  color: string;
  significance: string;
  notableFigures: string[];
  preservedArtifacts: string;
}

export interface RegionalWeatherOverlay {
  id: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  tempC: number;
  condition: string;
  weatherIcon: string;
  humidity: number;
  rainProb: number;
  heatAdvisory?: string;
  bestVisitingTime: string;
}

// 1. Pre-Independence Historic Trade Routes
export const PRE_INDEPENDENCE_TRADE_ROUTES: TradeRoute[] = [
  {
    id: 'uttarapatha-grand-trunk',
    name: 'Uttarapatha (Ancient Grand Trunk Highway)',
    hindiName: 'उत्तरापथ (प्राचीन ग्रांड ट्रंक मार्ग)',
    era: '3rd Century BCE (Mauryan) to 16th c. (Sher Shah Suri)',
    color: '#d97706', // Imperial Amber
    description:
      'The 2,500-year-old trans-subcontinental highway connecting Bengal through the Gangetic heartland to the Khyber Pass and Central Asia.',
    historicalGoods: ['Muslin silk', 'Horses', 'Lapis lazuli', 'Spices', 'Vedic manuscripts'],
    path: [
      [22.5726, 88.3639], // Kolkata
      [25.3176, 82.9739], // Varanasi
      [25.4358, 81.8463], // Prayagraj
      [27.1767, 78.0081], // Agra
      [28.6139, 77.209],  // Delhi
      [31.634, 74.8723],  // Amritsar
    ],
    keyPortsAndPosts: [
      { name: 'Tamralipta (Bengal Port)', lat: 22.298, lon: 87.925, role: 'Sea outlet for Buddhist pilgrims to Sri Lanka' },
      { name: 'Varanasi Chowk', lat: 25.3176, lon: 82.9739, role: 'Silk brocade and river barge transshipment' },
      { name: 'Agra Sarai Post', lat: 27.1767, lon: 78.0081, role: 'Imperial Mughal caravan treasury' },
      { name: 'Delhi Red Fort Environs', lat: 28.6562, lon: 77.241, role: 'Central toll and royal customs gate' },
    ],
  },
  {
    id: 'dakshinapatha-trade-axis',
    name: 'Dakshinapatha (North-South Trans-Deccan Corridor)',
    hindiName: 'दक्षिणापथ (उत्तर-दक्षिण व्यापारिक धुरी)',
    era: 'Vedic Antiquity to Satavahana & Chola Dynasties',
    color: '#7c3aed', // Royal Amethyst
    description:
      'The legendary southern highway mentioned in Kautilya’s Arthashastra, routing Gangetic iron and textiles south to Deccan diamond mines and spice harbors.',
    historicalGoods: ['Golconda diamonds', 'Black pepper', 'Cardamom', 'Cotton textiles', 'Bronze statues'],
    path: [
      [25.3176, 82.9739], // Varanasi
      [23.1765, 75.7885], // Ujjain
      [19.48, 75.38],     // Paithan (Pratishthana)
      [15.335, 76.46],    // Hampi / Bellary
      [9.9252, 78.1198],  // Madurai
    ],
    keyPortsAndPosts: [
      { name: 'Ujjain Observatory Caravanserai', lat: 23.1765, lon: 75.7885, role: 'Astronomical calculation & gemstone weighing' },
      { name: 'Paithan Weaving Guilds', lat: 19.48, lon: 75.38, role: 'Capital of Satavahanas; Paithani silk exports' },
      { name: 'Madurai Pandyan Chawk', lat: 9.9252, lon: 78.1198, role: 'Pearl fisheries & Roman amphorae exchanges' },
    ],
  },
  {
    id: 'monsoon-spice-coast',
    name: 'Malabar & Coromandel Monsoon Spice Route',
    hindiName: 'मालाबार एवं कोरोमंडल समुद्री मसाला मार्ग',
    era: '1st Century CE (Periplus of the Erythrean Sea) to 18th c.',
    color: '#059669', // Emerald Spice
    description:
      'Ancient maritime sea route governed by seasonal monsoon winds (Hippalus winds), linking Egyptian, Roman, Arab, and Southeast Asian merchant fleets.',
    historicalGoods: ['Black gold (Pepper)', 'Cinnamon', 'Teak timber', 'Ivory', 'Natural pearls'],
    path: [
      [21.7051, 72.9959], // Bharuch (Barygaza)
      [18.922, 72.8347],  // Sopara / Mumbai
      [15.4989, 73.8278], // Goa ports
      [10.158, 76.216],   // Muziris / Kodungallur
      [8.0883, 77.5385],  // Kanyakumari
      [12.6167, 80.1983], // Mahabalipuram
    ],
    keyPortsAndPosts: [
      { name: 'Barygaza (Bharuch)', lat: 21.7051, lon: 72.9959, role: 'Narmada river mouth gateway for Roman merchants' },
      { name: 'Muziris Ancient Port', lat: 10.158, lon: 76.216, role: 'Fabled Roman coin hoards & pepper fleet berths' },
      { name: 'Mamallapuram Harbor', lat: 12.6167, lon: 80.1983, role: 'Pallava naval embarkation point to Java & Bali' },
    ],
  },
];

// 2. Ancient Cultural Hotspots (Clusters of civilizational enlightenment)
export const ANCIENT_CULTURAL_HOTSPOTS: CulturalHotspot[] = [
  {
    id: 'hotspot-varanasi',
    name: 'Kashi / Varanasi Civilizational Nexus',
    hindiName: 'काशी / वाराणसी सांस्कृतिक केंद्र',
    category: 'Vedic Philosophy',
    lat: 25.3109,
    lon: 83.0107,
    radiusKm: 35,
    era: '1500 BCE – Present (Continuous)',
    color: '#ea580c',
    significance: 'Continuous epicentre of Sanskrit grammar (Panini), classical music (Benares Gharana), and spiritual transcendence.',
    notableFigures: ['Kabir Das', 'Tulsidas', 'Adi Shankara', 'Rani Ahilyabai Holkar'],
    preservedArtifacts: '84 Living Ghats, Vishwanath Jyotirlinga, Palm-leaf Vedic Shakhas.',
  },
  {
    id: 'hotspot-nalanda',
    name: 'Nalanda-Rajgir Monastic University Zone',
    hindiName: 'नालंदा-राजगीर बौद्ध ज्ञान मंडल',
    category: 'University & Science',
    lat: 25.1357,
    lon: 85.4447,
    radiusKm: 40,
    era: '5th Century BCE – 12th Century CE',
    color: '#ca8a04',
    significance: 'World’s first residential international university housing 10,000 scholars from Korea, Japan, China, Tibet, and Persia.',
    notableFigures: ['Aryabhata', 'Nagarjuna', 'Xuanzang', 'Dharmakirti'],
    preservedArtifacts: 'Dharmaganja library ruins, votive terracotta seals, bronze Avalokiteshvara.',
  },
  {
    id: 'hotspot-ujjain',
    name: 'Ujjayini (Ancient Astronomical Prime Meridian)',
    hindiName: 'उज्जयिनी (प्राचीन काल-गणना एवं ज्योतिष केंद्र)',
    category: 'University & Science',
    lat: 23.1765,
    lon: 75.7885,
    radiusKm: 30,
    era: '6th Century BCE to 18th Century CE',
    color: '#0284c7',
    significance: 'The zero meridian (Tropic of Cancer intersection) of ancient Indian astronomers; seat of King Vikramaditya’s Nine Gems (Navaratnas).',
    notableFigures: ['Kalidasa', 'Varahamihira', 'Brahmagupta', 'Bhaskara I'],
    preservedArtifacts: 'Jantar Mantar stone sun-dials, Mahakaleshwar Jyotirlinga, Sanskrit plays.',
  },
  {
    id: 'hotspot-thanjavur',
    name: 'Thanjavur & Kaveri Living Chola Basin',
    hindiName: 'तंजावुर एवं कावेरी चोल सांस्कृतिक घाटी',
    category: 'Temple Architecture',
    lat: 10.7828,
    lon: 79.1318,
    radiusKm: 45,
    era: '9th – 13th Century CE',
    color: '#d97706',
    significance: 'Cradle of Bharatanatyam, Carnatic classical trinity, lost-wax bronze casting, and towering granite temple vimanas.',
    notableFigures: ['Raja Raja Chola I', 'Karuvur Devar', 'Muthuswami Dikshitar'],
    preservedArtifacts: 'Saraswathi Mahal Library manuscripts, Nataraja bronzes, granite inscriptions.',
  },
  {
    id: 'hotspot-hampi',
    name: 'Hampi Vijayanagara Empire Core',
    hindiName: 'हम्पी विजयनगर साम्राज्य धरोहर',
    category: 'Temple Architecture',
    lat: 15.335,
    lon: 76.46,
    radiusKm: 35,
    era: '1336 – 1565 CE',
    color: '#9333ea',
    significance: 'One of the largest medieval cities in the world, with musical granite pillared halls, stone aqueducts, and international gem bazaars.',
    notableFigures: ['Krishnadevaraya', 'Tenali Rama', 'Purandara Dasa'],
    preservedArtifacts: 'Vittala Stone Chariot, Elephant Stables, Hazara Rama friezes.',
  },
  {
    id: 'hotspot-lothal',
    name: 'Lothal & Dholavira Harappan Maritime Cradle',
    hindiName: 'लोथल एवं धोलावीरा सिंधु-सरस्वती सभ्यता',
    category: 'Maritime Trade',
    lat: 22.525,
    lon: 72.249,
    radiusKm: 50,
    era: '2400 – 1900 BCE (Bronze Age)',
    color: '#0d9488',
    significance: 'World’s earliest discovered tidal dockyard engineered to handle Arabian Sea tidal ebbs; advanced bead-making and micro-weights.',
    notableFigures: ['Harappan Master Navigators & Guild Metalsmiths'],
    preservedArtifacts: 'Tidal basin sluice gates, steatite unicorn seals, copper compass tools.',
  },
];

// 3. Current Weather Conditions Overlays across Indian Heritage Regions
export const REGIONAL_WEATHER_OVERLAYS: RegionalWeatherOverlay[] = [
  {
    id: 'weather-delhi',
    city: 'New Delhi & NCR',
    state: 'Delhi',
    lat: 28.6139,
    lon: 77.209,
    tempC: 31,
    condition: 'Sunny & Pleasant',
    weatherIcon: '☀️',
    humidity: 42,
    rainProb: 0,
    bestVisitingTime: 'Early Morning (6:30 AM - 10:00 AM)',
  },
  {
    id: 'weather-varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lon: 82.9739,
    tempC: 30,
    condition: 'Clear & Calm River Breeze',
    weatherIcon: '🌤️',
    humidity: 48,
    rainProb: 5,
    bestVisitingTime: 'Subah-e-Banaras Ghats (5:30 AM - 8:30 AM)',
  },
  {
    id: 'weather-jaipur',
    city: 'Jaipur & Thar',
    state: 'Rajasthan',
    lat: 26.9124,
    lon: 75.7873,
    tempC: 34,
    condition: 'Dry & Sunny',
    weatherIcon: '☀️',
    humidity: 28,
    rainProb: 0,
    heatAdvisory: 'Midday sun intense; visit forts before 11:30 AM or at sunset',
    bestVisitingTime: 'Late Afternoon Sunset at Nahargarh',
  },
  {
    id: 'weather-hampi',
    city: 'Hampi & Bellary',
    state: 'Karnataka',
    lat: 15.335,
    lon: 76.46,
    tempC: 32,
    condition: 'Partly Cloudy with Tungabhadra Breeze',
    weatherIcon: '⛅',
    humidity: 50,
    rainProb: 10,
    bestVisitingTime: 'Sunrise at Matanga Hill',
  },
  {
    id: 'weather-thanjavur',
    city: 'Thanjavur & Kaveri Basin',
    state: 'Tamil Nadu',
    lat: 10.7828,
    lon: 79.1318,
    tempC: 31,
    condition: 'Warm Tropical Coastal Atmosphere',
    weatherIcon: '🌤️',
    humidity: 62,
    rainProb: 15,
    bestVisitingTime: 'Evening Temple Illumination (5:00 PM - 8:30 PM)',
  },
  {
    id: 'weather-mumbai',
    city: 'Mumbai & Konkan Coast',
    state: 'Maharashtra',
    lat: 18.922,
    lon: 72.8347,
    tempC: 29,
    condition: 'Humid Sea Breeze',
    weatherIcon: '🌊',
    humidity: 74,
    rainProb: 20,
    bestVisitingTime: 'Sunset at Marine Drive / Gateway of India',
  },
  {
    id: 'weather-kolkata',
    city: 'Kolkata & Sundarbans',
    state: 'West Bengal',
    lat: 22.5726,
    lon: 88.3639,
    tempC: 30,
    condition: 'Tropical Humid & Gentle Winds',
    weatherIcon: '⛅',
    humidity: 68,
    rainProb: 25,
    bestVisitingTime: 'Morning Heritage Walk in North Kolkata',
  },
  {
    id: 'weather-rishikesh',
    city: 'Rishikesh & Haridwar',
    state: 'Uttarakhand',
    lat: 30.0869,
    lon: 78.2676,
    tempC: 24,
    condition: 'Crisp Himalayan River Atmosphere',
    weatherIcon: '🏔️',
    humidity: 45,
    rainProb: 5,
    bestVisitingTime: 'Evening Ganga Aarti at Parmarth Niketan',
  },
];
