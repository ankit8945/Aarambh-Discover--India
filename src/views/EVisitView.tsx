import React, { useState, useEffect } from 'react';
import { templeAudio } from '../utils/templeAudio';
import { useAuth } from '../context/AuthContext';
import { getTranslation } from '../utils/translations';
import { TempleChatModal } from '../components/TempleChatModal';
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Compass,
  MapPin,
  Calendar,
  Share2,
  Heart,
  Eye,
  Info,
  ChevronRight,
  Maximize2,
  Flower2,
  Sun,
  Moon,
  Clock,
  Music,
  Bell,
  Radio,
  Check,
  Search,
  Filter,
  MessageSquare,
} from 'lucide-react';

export interface EVisitExperience {
  id: string;
  title: string;
  deity: string;
  category: 'jyotirlinga' | 'festival' | 'shakti' | 'vaishnav' | 'sikh';
  categoryLabel: string;
  location: string;
  state: string;
  image: string;
  bannerImage: string;
  timeOfDay: string;
  significance: string;
  heritageTag: string;
  audioAction: 'dhaak' | 'bell' | 'shankha' | 'damru';
  rituals: {
    name: string;
    description: string;
    timing: string;
  }[];
  interactiveType: 'pushpanjali' | 'diya' | 'rope' | 'umbrella' | 'bilva' | 'tulsi' | 'chandan' | 'chunri' | 'karseva';
  interactiveLabel: string;
}

export const EVISIT_CATALOG: EVisitExperience[] = [
  {
    id: 'durga-puja',
    title: 'Kolkata E-Durga Puja & Pandal Parikrama',
    deity: 'Maa Durga (Mahishasuramardini)',
    category: 'festival',
    categoryLabel: 'UNESCO Intangible Festival',
    location: 'Bagbazar, Kumartuli & Sovabazar',
    state: 'West Bengal',
    image: '/images/epuja/durga-puja.jpg',
    bannerImage: '/images/epuja/durga-puja.jpg',
    timeOfDay: 'Evening Sandhi Puja (Asthami-Navami)',
    significance: 'Inscribed on UNESCO Representative List of Intangible Cultural Heritage of Humanity in 2021.',
    heritageTag: 'UNESCO Inscribed',
    audioAction: 'dhaak',
    rituals: [
      { name: 'Bodhon & Chokkhu Daan', description: 'Invoking Mother Goddess and ritual of painting her third eye in Kumartuli clay studios.', timing: 'Sasthi Dawn' },
      { name: 'Sandhi Puja & 108 Lotuses', description: 'Astronomical juncture when Mahisasura is vanquished. 108 clay lamps lit to rapid Dhaak beats.', timing: 'Asthami Twilight' },
      { name: 'Dhunuchi Naach', description: 'Frenetic devotion dance balancing flaming clay burners filled with coconut husk and dhuna.', timing: 'Navami Dusk' },
      { name: 'Sindoor Khela & Visarjan', description: 'Married women smear red vermilion before ceremonial immersion into the holy Hooghly river.', timing: 'Bijoya Dashami' },
    ],
    interactiveType: 'pushpanjali',
    interactiveLabel: 'Offer Pushpanjali (Sacred Hibiscus & Lotuses) 🌺',
  },
  {
    id: 'ganga-aarti',
    title: 'Varanasi Dashashwamedh E-Ganga Aarti',
    deity: 'Mother Ganga & Lord Shiva',
    category: 'festival',
    categoryLabel: 'Ancient Living River Aarti',
    location: 'Dashashwamedh Ghat, Varanasi',
    state: 'Uttar Pradesh',
    image: '/images/epuja/ganga-aarti.jpg',
    bannerImage: '/images/epuja/ganga-aarti.jpg',
    timeOfDay: 'Dusk (Sandhya Aarti, 6:45 PM)',
    significance: 'Performed nightly by young priests who chant Rigvedic stotras holding multi-tiered 108-wick brass lamps.',
    heritageTag: 'Living Ancient Ritual',
    audioAction: 'bell',
    rituals: [
      { name: 'Shankhanaad & Conch Call', description: 'Seven priests blow resonant sea conches across the sacred river to dispel negativity.', timing: 'Dusk Commencement' },
      { name: 'Dhoop & Kapur Aarti', description: 'Fragrant natural incense and camphor flames waved in rhythm with the Ganges breeze.', timing: 'Mid Aarti' },
      { name: 'Multi-tiered Brass Deepam', description: 'Lifting heavy 40-pound brass multi-tier lamps shaped like serpents and peacocks.', timing: 'Peak Aarti' },
      { name: 'Deepdaan & Flower Offerings', description: 'Thousands of marigold-rimmed leaf lamps released into the gentle Ganga waters.', timing: 'Conclusion' },
    ],
    interactiveType: 'diya',
    interactiveLabel: 'Release Floating Diya & Make a Wish 🪔',
  },
  {
    id: 'kedarnath-dham',
    title: 'Kedarnath Dham E-Darshan & Rudrabhishek',
    deity: 'Lord Shiva (Sadashiva Jyotirlinga)',
    category: 'jyotirlinga',
    categoryLabel: 'Highest Himalayan Jyotirlinga',
    location: 'Mandakini River Valley, Garhwal',
    state: 'Uttarakhand',
    image: '/images/epuja/kedarnath-dham.jpg',
    bannerImage: '/images/epuja/kedarnath-dham.jpg',
    timeOfDay: 'Morning Maha Abhishek (6:00 AM)',
    significance: 'Standing at 3,584m altitude with snow-clad Kedardome peaks; built of massive interlocking stone slabs that survived the Ice Age and floods.',
    heritageTag: 'Char Dham Pilgrimage',
    audioAction: 'damru',
    rituals: [
      { name: 'Pratahkal Rudrabhishek', description: 'Bathing the natural conical triangular lingam with holy Ganges water, cow milk and honey.', timing: 'Brahma Muhurta (4:00 AM)' },
      { name: 'Bilva Patra & Kasturi Arpan', description: 'Offering sacred three-leafed bilva leaves and Himalayan kasturi chandan to Sadashiva.', timing: 'Morning Puja' },
      { name: 'Shiva Tandava Stotra Recitation', description: 'Raw echoing chants of Ravana-composed stotras resounding through the Himalayan valley.', timing: 'Midday' },
      { name: 'Evening Ghee Deepam', description: 'Sanctum illuminated entirely by pure cow ghee lamps inside the thick ancient stone sanctum.', timing: 'Evening Aarti' },
    ],
    interactiveType: 'bilva',
    interactiveLabel: 'Offer Sacred Bilva Patra & Gangajal 🍃',
  },
  {
    id: 'tirupati-balaji',
    title: 'Tirumala Sri Venkateswara E-Darshan',
    deity: 'Lord Venkateswara (Sri Balaji)',
    category: 'vaishnav',
    categoryLabel: 'Kali Yuga Vaikuntha',
    location: 'Seshachalam Hills, Tirumala',
    state: 'Andhra Pradesh',
    image: '/images/epuja/tirupati-balaji.jpg',
    bannerImage: '/images/epuja/tirupati-balaji.jpg',
    timeOfDay: 'Suprabhatam & Viswaroopa Darshan (3:00 AM)',
    significance: 'World’s most revered shrine where the 9-foot deity carved from divine black stone stands in the golden Ananda Nilayam vimana.',
    heritageTag: 'Dravidian Masterpiece',
    audioAction: 'bell',
    rituals: [
      { name: 'Suprabhatam Seva', description: 'Awakening the Lord with M.S. Subbulakshmi’s resonant Sanskrit verses at dawn.', timing: '3:00 AM Dawn' },
      { name: 'Tomala Seva (Flower Garlands)', description: 'Adorning Balaji with tens of thousands of fragrant jasmine, rose and sacred green Tulsi garlands.', timing: 'Early Morning' },
      { name: 'Kalyanotsavam', description: 'Celestial wedding celebration of Lord Venkateswara with Goddess Padmavathi and Lakshmi.', timing: '11:00 AM' },
      { name: 'Ekanta Seva & Lullaby', description: 'Swinging the Lord to sleep on a golden cot with sweet devotional lullabies (Annamayya Kirtanas).', timing: 'Midnight' },
    ],
    interactiveType: 'tulsi',
    interactiveLabel: 'Offer Sacred Golden Tulsi Mala & Archana 🌿',
  },
  {
    id: 'kashi-vishwanath',
    title: 'Kashi Vishwanath E-Darshan & Bhasma Aarti',
    deity: 'Lord Vishveshwara (Shiva)',
    category: 'jyotirlinga',
    categoryLabel: 'Eternal Moksha Sanctum',
    location: 'Ganga Corridor, Varanasi',
    state: 'Uttar Pradesh',
    image: '/images/epuja/kashi-vishwanath.jpg',
    bannerImage: '/images/epuja/kashi-vishwanath.jpg',
    timeOfDay: 'Mangala Aarti & Saptarshi Aarti (7:00 PM)',
    significance: 'The golden-spired holiest abode of Lord Shiva in the oldest living city on Earth, connected directly to the holy Ganga.',
    heritageTag: 'Kashi Moksha Puri',
    audioAction: 'bell',
    rituals: [
      { name: 'Mangala Aarti (Brahma Muhurta)', description: 'First sacred awakening with damru beats, shankha naad, and sacred Panchamrit snan.', timing: '3:30 AM' },
      { name: 'Saptarishi Aarti', description: 'Seven priests representing the Seven Sages perform a synchronized, intricate 1-hour ritual.', timing: '7:00 PM' },
      { name: 'Shayan Aarti & Lullaby', description: 'Sprinkling sandalwood and lotus flowers before closing the golden doors.', timing: '10:30 PM' },
    ],
    interactiveType: 'chandan',
    interactiveLabel: 'Offer Chandan & Dhatura to Vishveshwara 🕉️',
  },
  {
    id: 'golden-temple',
    title: 'Amritsar Sri Harmandir Sahib (Golden Temple)',
    deity: 'Waheguru & Guru Granth Sahib Ji',
    category: 'sikh',
    categoryLabel: 'Pool of Nectar (Amrit Sarovar)',
    location: 'Amritsar',
    state: 'Punjab',
    image: '/images/epuja/golden-temple.jpg',
    bannerImage: '/images/epuja/golden-temple.jpg',
    timeOfDay: 'Palki Sahib Procession (4:30 AM & 10:00 PM)',
    significance: 'Gold-plated gurdwara surrounded by the Amrit Sarovar; open to all humans with four entrances symbolizing universal brotherhood.',
    heritageTag: 'UNESCO Tentative List',
    audioAction: 'bell',
    rituals: [
      { name: 'Palki Sahib Ceremony', description: 'Ceremonial procession carrying the Guru Granth Sahib on a golden palanquin adorned with fresh marigolds.', timing: 'Dawn & Night' },
      { name: 'Akhand Kirtan', description: 'Continuous uninterrupted live classical Gurbani kirtan in Raag Bilawal, Asa, and Sarang.', timing: '24 Hours Continuous' },
      { name: 'Guru Ka Langar (World’s Largest Community Kitchen)', description: 'Over 100,000 pilgrims served hot, nourishing vegetarian meals side-by-side with zero discrimination.', timing: 'All Day & Night' },
      { name: 'Sarovar Ishnan', description: 'Purifying holy dip in the sacred Amrit Sarovar waters known to bring solace to body and soul.', timing: 'Anytime' },
    ],
    interactiveType: 'karseva',
    interactiveLabel: 'Offer Reverence to Amrit Sarovar & Kar Seva 🌊',
  },
  {
    id: 'somnath-temple',
    title: 'Somnath Mahadev E-Darshan & Arabian Sea Aarti',
    deity: 'Lord Somnath (First Jyotirlinga)',
    category: 'jyotirlinga',
    categoryLabel: 'Pratham Jyotirlinga',
    location: 'Prabhas Patan, Veraval',
    state: 'Gujarat',
    image: '/images/epuja/somnath-mahadev-temple.jpg',
    bannerImage: '/images/epuja/somnath-mahadev-temple.jpg',
    timeOfDay: 'Sandhya Aarti & Sound-Light Ocean Show (7:30 PM)',
    significance: 'The eternal shrine on the shores of Saurashtra where the Arabian Sea waves kiss the temple foundation; revered since Rigvedic times.',
    heritageTag: 'Maru-Gurjara Architecture',
    audioAction: 'shankha',
    rituals: [
      { name: 'Samudra Jal Snan', description: 'The lingam is bathed with sacred ocean water combined with holy waters of seven sacred rivers.', timing: 'Morning' },
      { name: 'Baan Stambha Darshan', description: 'Ancient directional arrow pillar pointing to the South Pole without any land mass in between.', timing: 'Daytime' },
      { name: 'Maha Deepam Sandhya Aarti', description: 'Massive resonant brass bells toll as priests wave blazing multi-tier deepams facing the ocean sunset.', timing: 'Sunset (7:00 PM)' },
    ],
    interactiveType: 'diya',
    interactiveLabel: 'Offer Coastal Camphor Flame & Diya 🪔',
  },
  {
    id: 'rath-yatra',
    title: 'Puri E-Rath Yatra & Chariot Darshan',
    deity: 'Lord Jagannath, Balabhadra & Subhadra',
    category: 'vaishnav',
    categoryLabel: 'World’s Oldest Chariot Festival',
    location: 'Jagannath Temple to Gundicha Temple, Puri',
    state: 'Odisha',
    image: '/images/epuja/rath-yatra.jpg',
    bannerImage: '/images/epuja/rath-yatra.jpg',
    timeOfDay: 'Midday Chariot Pulling (Shukla Dwitiya)',
    significance: 'Lord Jagannath emerges from his 12th-century sanctum onto the Grand Road to offer darshan to all living beings regardless of status.',
    heritageTag: 'Millennial Living Tradition',
    audioAction: 'shankha',
    rituals: [
      { name: 'Pahandi Bije', description: 'The rhythmic swaying ceremonial procession of the deities as they are escorted onto huge wooden chariots.', timing: 'Morning' },
      { name: 'Chhera Pahanra', description: 'The King of Puri (Gajapati) sweeps the chariot platform with a golden broom, symbolizing equality of all humans.', timing: 'Noon' },
      { name: 'Pulling of Nandighosa', description: 'Millions pull the giant thick coir ropes of Lord Jagannath’s 45-foot tall 16-wheeled chariot.', timing: 'Afternoon' },
    ],
    interactiveType: 'rope',
    interactiveLabel: 'Pull Sacred Chariot Rope (Ratha Daudi) 🚩',
  },
  {
    id: 'meenakshi-amman',
    title: 'Madurai Meenakshi Sundareswarar E-Darshan',
    deity: 'Goddess Meenakshi & Sundareswarar',
    category: 'shakti',
    categoryLabel: 'Grand Dravidian Gopuram Sanctum',
    location: 'Vaigai River Bank, Madurai',
    state: 'Tamil Nadu',
    image: '/images/epuja/meenakshi-amman.jpg',
    bannerImage: '/images/epuja/meenakshi-amman.jpg',
    timeOfDay: 'Palliyarai Seva & Night Procession (9:00 PM)',
    significance: 'Spanning 14 towering gopurams with over 33,000 vibrant stone sculptures and the Golden Lotus Sacred Tank (Porthamarai Kulam).',
    heritageTag: 'Architectural Wonder of India',
    audioAction: 'bell',
    rituals: [
      { name: 'Thiruvanandal (Early Awakening)', description: 'Priests wake Goddess Meenakshi with fragrant sweet pongal offerings and singing of Thevaram hymns.', timing: '5:00 AM' },
      { name: 'Uchikalam (Noon Aarti)', description: 'Grand aarti with traditional Nadaswaram woodwind and Thavil percussion resounding in the Stone Hall.', timing: '12:00 PM' },
      { name: 'Palliyarai Pooja (Night Chamber Procession)', description: 'Lord Sundareswarar’s silver feet are carried in a musical palanquin to the Goddess’s sanctum.', timing: '9:30 PM' },
    ],
    interactiveType: 'pushpanjali',
    interactiveLabel: 'Offer Fragrant Madurai Jasmine Garland 🌸',
  },
  {
    id: 'vaishno-devi',
    title: 'Mata Vaishno Devi Bhawan E-Darshan',
    deity: 'Maa Vaishno Devi (Trikuta Pindies)',
    category: 'shakti',
    categoryLabel: 'Holy Natural Cave Shrine',
    location: 'Trikuta Mountains, Katra',
    state: 'Jammu & Kashmir',
    image: '/images/epuja/vaishno-devi.jpg',
    bannerImage: '/images/epuja/vaishno-devi.jpg',
    timeOfDay: 'Pratah Aarti & Sandhya Aarti (6:00 AM & 7:00 PM)',
    significance: 'Situated inside the holy Himalayan cave at 5,200 ft; pilgrims trek 12 km chanting Jai Mata Di to reach the self-manifested three Pindies.',
    heritageTag: 'Siddha Peetha',
    audioAction: 'shankha',
    rituals: [
      { name: 'Pavitra Pindi Snan', description: 'The three natural rock deities (Kali, Lakshmi, Saraswati) are washed with holy cave spring water.', timing: 'Dawn Aarti' },
      { name: 'Chunri & Chhatra Arpan', description: 'Offering golden embroidered red silk chunri, dried coconut, and silver parasols to the Divine Mother.', timing: 'All Day' },
      { name: 'Bhairon Baba Darshan Completion', description: 'Pilgrims complete their sacred yatra by paying respects at the high ridge temple of Bhaironath.', timing: 'Post Bhawan' },
    ],
    interactiveType: 'chunri',
    interactiveLabel: 'Offer Red Chunri & Coconut at Darbar 🥥',
  },
  {
    id: 'thrissur-pooram',
    title: 'Kerala E-Thrissur Pooram Spectacle',
    deity: 'Vadakkumnathan (Lord Shiva)',
    category: 'festival',
    categoryLabel: 'Mother of all Temple Festivals',
    location: 'Thekkinkadu Maidan, Thrissur',
    state: 'Kerala',
    image: '/images/epuja/thrissur-pooram.jpg',
    bannerImage: '/images/epuja/thrissur-pooram.jpg',
    timeOfDay: 'Noon to Twilight (Medam Month)',
    significance: 'Established by Raja Rama Varma (Sakthan Thampuran) in 1798 as an egalitarian musical and visual festival.',
    heritageTag: 'Percussive Symphony',
    audioAction: 'dhaak',
    rituals: [
      { name: 'Ilanjithara Melam', description: '250+ percussionists led by master Chenda artistes playing the world’s largest acoustic drum symphony.', timing: '2:30 PM' },
      { name: 'Kudamattom (Umbrella Exchange)', description: 'Spectacular swift changing of brightly colored multi-tiered sequined silk parasols atop 30 caparisoned tuskers.', timing: '5:30 PM' },
      { name: 'Vedikkettu Fireworks', description: 'Synchronized earth-shattering pyrotechnics lighting up the midnight Kerala sky.', timing: 'Midnight' },
    ],
    interactiveType: 'umbrella',
    interactiveLabel: 'Trigger Kudamattom Umbrella Switch ☂️',
  },
  {
    id: 'mahakaleshwar-ujjain',
    title: 'Ujjain Sri Mahakaleshwar E-Darshan & Bhasma Aarti',
    deity: 'Lord Mahakal (Dakshinmukhi Jyotirlinga)',
    category: 'jyotirlinga',
    categoryLabel: 'Dakshinmukhi Swayambhu Jyotirlinga',
    location: 'Shipra River Bank, Ujjain',
    state: 'Madhya Pradesh',
    image: '/images/epuja/mahakaleshwar-ujjain.jpg',
    bannerImage: '/images/epuja/mahakaleshwar-ujjain.jpg',
    timeOfDay: 'Bhasma Aarti (4:00 AM Dawn)',
    significance: 'The only south-facing (Dakshinmukhi) Jyotirlinga on earth where Lord Shiva is anointed with fresh sacred ash (Bhasma) at dawn.',
    heritageTag: 'Ancient Mahakal Forest',
    audioAction: 'damru',
    rituals: [
      { name: 'Bhasma Aarti (Brahma Muhurta)', description: 'Ceremonial ash offering to the self-manifested lingam accompanied by beating drums and damru.', timing: '4:00 AM' },
      { name: 'Shipra Jal Abhishek', description: 'Bathing Mahakal with sacred holy waters brought from the holy Shipra river.', timing: 'Morning' },
      { name: 'Sandhya Shringar Aarti', description: 'Adorning the lingam with silver ornaments, bhang, and fragrant sandalwood.', timing: '7:00 PM' },
    ],
    interactiveType: 'bilva',
    interactiveLabel: 'Offer Sacred Bilva Patra & Bhasma Arpan 🍃',
  },
  {
    id: 'badrinath-dham',
    title: 'Badrinath Dham E-Darshan & Maha Abhishek',
    deity: 'Lord Badri Vishal (Narayana)',
    category: 'vaishnav',
    categoryLabel: 'Maha Char Dham Himalayan Abode',
    location: 'Alaknanda River Valley, Chamoli',
    state: 'Uttarakhand',
    image: '/images/epuja/badrinath-dham.jpg',
    bannerImage: '/images/epuja/badrinath-dham.jpg',
    timeOfDay: 'Maha Abhishek (4:30 AM Dawn)',
    significance: 'Revered black stone Shaligram deity seated in Padmasana posture under the golden canopy, nestled between Nar and Narayana mountains.',
    heritageTag: 'Char Dham Pilgrimage',
    audioAction: 'bell',
    rituals: [
      { name: 'Tapt Kund Holy Snan', description: 'Pilgrims take a rejuvenating dip in the natural thermal sulphur hot spring before entering the sanctum.', timing: 'Early Dawn' },
      { name: 'Maha Abhishek & Kesar Arpan', description: 'Anointing Badri Vishal with pure saffron, sandalwood paste, and sacred Tulsi garlands.', timing: '4:30 AM' },
      { name: 'Geeta Path & Evening Aarti', description: 'Chanting of Vedic Suktas and ringing of hundred brass bells echoing across Neelkanth peak.', timing: '7:30 PM' },
    ],
    interactiveType: 'tulsi',
    interactiveLabel: 'Offer Himalayan Kasturi Chandan & Tulsi 🌿',
  },
  {
    id: 'siddhivinayak-mumbai',
    title: 'Mumbai Sri Siddhivinayak Ganapati E-Darshan',
    deity: 'Lord Ganesha (Navasacha Ganapati)',
    category: 'festival',
    categoryLabel: 'Auspicious Wish-Fulfilling Mandir',
    location: 'Prabhadevi, Mumbai',
    state: 'Maharashtra',
    image: '/images/epuja/siddhivinayak-mumbai.jpg',
    bannerImage: '/images/epuja/siddhivinayak-mumbai.jpg',
    timeOfDay: 'Kakad Aarti (5:30 AM) & Angarki Sankashti',
    significance: 'Black stone Ganesha carved out of a single monolithic stone with trunk bent towards the right (Siddhi); dome gold-plated by devotees.',
    heritageTag: 'Siddhi Ganesha',
    audioAction: 'bell',
    rituals: [
      { name: 'Kakad Aarti', description: 'Early morning auspicious awakening prayer to awaken the elephant-headed Lord of beginnings.', timing: '5:30 AM' },
      { name: 'Panchamrita Abhishek & Modak Seva', description: 'Bathing the deity in milk, ghee, honey, yogurt, and offering 21 sacred sweet modaks.', timing: '11:00 AM' },
      { name: 'Shej Aarti', description: 'Nighttime lullaby and ritual retiring of the deity.', timing: '9:50 PM' },
    ],
    interactiveType: 'pushpanjali',
    interactiveLabel: 'Offer Sacred Durva Grass & 21 Modak 🌺',
  },
  {
    id: 'kamakhya-devi',
    title: 'Maa Kamakhya Devalaya E-Darshan',
    deity: 'Maa Kamakhya (Adi Shakti Peetha)',
    category: 'shakti',
    categoryLabel: 'Supreme Yoni Peetha of India',
    location: 'Nilachal Hills, Guwahati',
    state: 'Assam',
    image: '/images/epuja/kamakhya-devi.jpg',
    bannerImage: '/images/epuja/kamakhya-devi.jpg',
    timeOfDay: 'Snana & Nitya Puja (Dawn to Dusk)',
    significance: 'Foremost among 51 Shakti Peethas where Mother Sati’s Yoni fell; celebrated for the legendary natural underground spring inside the dark stone cave.',
    heritageTag: 'Adi Shakti Peetha',
    audioAction: 'shankha',
    rituals: [
      { name: 'Cave Sanctum Spring Darshan', description: 'Pilgrims touch the natural perennial spring waters flowing constantly over the bedrock.', timing: 'All Day' },
      { name: 'Rakta Bastra & Sindoor Offering', description: 'Offering sacred red silk cloth, vermilion, and hibiscus flowers to the Divine Mother.', timing: 'Morning' },
      { name: 'Sandhya Deepam', description: 'Hundred clay lamps lit across the Nilachal hill overlooking the mighty Brahmaputra river.', timing: 'Dusk' },
    ],
    interactiveType: 'chunri',
    interactiveLabel: 'Offer Sacred Rakta Bastra & Sindoor Arpan 🌺',
  },
  {
    id: 'rameswaram-ramanathaswamy',
    title: 'Rameswaram Sri Ramanathaswamy E-Darshan',
    deity: 'Lord Ramanatha (Shiva) & Goddess Parvathavarthini',
    category: 'jyotirlinga',
    categoryLabel: 'Southern Char Dham Jyotirlinga',
    location: 'Rameswaram Island, Pamban',
    state: 'Tamil Nadu',
    image: '/images/epuja/rameswaram-ramanathaswamy.jpg',
    bannerImage: '/images/epuja/rameswaram-ramanathaswamy.jpg',
    timeOfDay: 'Sphatika Lingam Darshan (5:00 AM)',
    significance: 'Sanctified by Lord Rama after returning from Lanka; famous for the world’s longest sculpted temple corridor with 1,212 granite pillars.',
    heritageTag: 'Southern Char Dham',
    audioAction: 'bell',
    rituals: [
      { name: '22 Holy Theertham Snan', description: 'Pilgrims bathe in the 22 sacred sweet water wells situated inside the grand temple complex.', timing: 'Early Dawn' },
      { name: 'Sphatika Lingam Aarti', description: 'Sacred morning darshan of the transparent crystal lingam installed by Adi Shankaracharya.', timing: '5:00 AM' },
      { name: 'Sayaratchai (Evening Deepam)', description: 'Resounding aarti with conch shells in the majestic thousand-pillar corridor.', timing: '6:30 PM' },
    ],
    interactiveType: 'diya',
    interactiveLabel: 'Offer Coastal Camphor Deepam & Bilva 🪔',
  },
  {
    id: 'jagannath-puri-sanctum',
    title: 'Sri Mandir Jagannath Puri E-Darshan',
    deity: 'Lord Jagannath, Balabhadra & Devi Subhadra',
    category: 'vaishnav',
    categoryLabel: 'Maha Nilachala Dham',
    location: 'Bada Danda, Puri',
    state: 'Odisha',
    image: '/images/epuja/jagannath-puri-sanctum.jpg',
    bannerImage: '/images/epuja/jagannath-puri-sanctum.jpg',
    timeOfDay: 'Mangala Alati & Chappan Bhog (5:00 AM & 1:00 PM)',
    significance: 'Sacred 12th-century sanctum of the Lord of the Universe; flag fluttering against the wind atop the 214-foot Nilachakra.',
    heritageTag: 'Eastern Char Dham',
    audioAction: 'shankha',
    rituals: [
      { name: 'Mangala Alati at Dawn', description: 'First sacred awakening ceremony opening the Singhadwara doors to morning stotras.', timing: '5:00 AM' },
      { name: 'Chappan Bhog (Mahaprasad)', description: 'Offering 56 earthen pots cooked in the world’s largest traditional temple kitchen.', timing: '1:00 PM' },
      { name: 'Bada Sringara Vesha', description: 'Deities adorned in pure Khandua silk inscribed with verses of Jayadeva’s Gita Govinda.', timing: '10:30 PM' },
    ],
    interactiveType: 'tulsi',
    interactiveLabel: 'Offer Tulsi Garland & Chappan Bhog 🪷',
  },
];

export const EVisitView: React.FC = () => {
  const { language } = useAuth();
  const langCode = (language || 'EN').substring(0, 2).toUpperCase();

  const [selectedExperience, setSelectedExperience] = useState<EVisitExperience>(EVISIT_CATALOG[0]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [ambientAudioOn, setAmbientAudioOn] = useState(false);
  const [activeInteractiveCount, setActiveInteractiveCount] = useState(0);
  const [userWish, setUserWish] = useState('');
  
  const [showLiveGuide, setShowLiveGuide] = useState(false);
  
  // 3D Parallax State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate tilt angles (max 8 degrees for dramatic 3D effect)
    const tiltX = ((y - centerY) / centerY) * -8;
    const tiltY = ((x - centerX) / centerX) * 8;

    setTilt({ x: tiltX, y: tiltY });
  };

  const [wishesList, setWishesList] = useState<string[]>([
    'Peace, health and good fortune for all living beings.',
    'Shubho Bijoya! May Maa Durga bless our family with wisdom and courage.',
    'Har Har Mahadev! Salutations from holy Kedarnath and Kashi.',
    'Om Namo Venkatesaya! Blessings for prosperity and inner light.',
    'Sarbat Da Bhala! Blessings of peace and togetherness for everyone.',
  ]);
  const [floatingItems, setFloatingItems] = useState<{ id: number; left: number; type: string; text?: string }[]>([]);

  // Sound triggering based on temple tradition
  const triggerExperienceSound = () => {
    if (selectedExperience.audioAction === 'dhaak') {
      templeAudio.playDhaakBeat();
    } else if (selectedExperience.audioAction === 'bell') {
      templeAudio.playTempleBell();
    } else if (selectedExperience.audioAction === 'shankha') {
      templeAudio.playShankha();
    } else if (selectedExperience.audioAction === 'damru') {
      templeAudio.playDamruBeat();
    }
  };

  const toggleAmbientDrone = () => {
    const nextState = !ambientAudioOn;
    setAmbientAudioOn(nextState);
    templeAudio.toggleTanpura(nextState);
  };

  // Perform ritual offering
  const handlePerformRitual = () => {
    triggerExperienceSound();
    setActiveInteractiveCount((prev) => prev + 1);

    const newItem = {
      id: Date.now() + Math.random(),
      left: Math.floor(Math.random() * 80) + 10,
      type: selectedExperience.interactiveType,
      text: userWish ? userWish : undefined,
    };

    setFloatingItems((prev) => [...prev.slice(-14), newItem]);

    if (userWish.trim()) {
      setWishesList((prev) => [userWish.trim(), ...prev.slice(0, 12)]);
      setUserWish('');
    }
  };

  // Filter catalog
  const filteredCatalog = EVISIT_CATALOG.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      (activeCategory === 'jyotirlinga' && item.category === 'jyotirlinga') ||
      (activeCategory === 'shakti' && item.category === 'shakti') ||
      (activeCategory === 'vaishnav' && item.category === 'vaishnav') ||
      (activeCategory === 'festival' && item.category === 'festival') ||
      (activeCategory === 'sikh' && item.category === 'sikh');

    const matchesSearch =
      !searchFilter ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.state.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.deity.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.location.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-stone-50 text-stone-900 min-h-screen pb-24 font-sans">
      {/* 1. CLEAN REFINED HEADER & SANCTUM NAVIGATION */}
      <section className="relative w-full bg-[#121110] text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-6">
          
          {/* Header Top Bar: Eyebrow + Ambient Audio Controller */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-[#E2B16B]">
                {getTranslation('eVisitTag', langCode)}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-xs sm:text-sm font-devanagari text-amber-300">
                दर्शनम् एवं आरती
              </span>
            </div>

            {/* Ambient Sound Drone Toggle */}
            <button
              onClick={toggleAmbientDrone}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                ambientAudioOn
                  ? 'bg-amber-500 text-stone-950 font-bold ring-2 ring-amber-400/40'
                  : 'bg-stone-800/90 text-stone-200 hover:bg-stone-700 border border-stone-700'
              }`}
            >
              {ambientAudioOn ? <Volume2 className="w-4 h-4 text-stone-950" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
              <span>{ambientAudioOn ? getTranslation('droneActive', langCode) : getTranslation('ambientDrone', langCode)}</span>
            </button>
          </div>

          {/* Title & Description */}
          <div className="max-w-3xl space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-royal tracking-tight text-white leading-tight">
              E-Visit & Sacred Sanctums
            </h1>
            <p className="text-sm sm:text-base text-stone-300 font-light leading-relaxed">
              Step into ancient sanctums, participate in sacred evening river aartis, and offer sacred prayers with authentic acoustic vibrations and Agamic rituals.
            </p>
          </div>

          {/* Search and Category Filters */}
          <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {[
                { id: 'all', label: `All (${EVISIT_CATALOG.length})` },
                { id: 'jyotirlinga', label: '🕉️ Jyotirlingas' },
                { id: 'shakti', label: '🌸 Shakti Peethas' },
                { id: 'vaishnav', label: '🪷 Sri Vishnu' },
                { id: 'sikh', label: 'ੴ Harmandir Sahib' },
                { id: 'festival', label: '🥁 Grand Festivals' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-700/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search mandir, deity, state..."
                className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-stone-900 border border-stone-700/80 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Quick Horizontal Carousel of Available Temples */}
          <div className="pt-1 flex items-center gap-2.5 overflow-x-auto scrollbar-none pb-2">
            {filteredCatalog.map((exp) => (
              <button
                key={exp.id}
                onClick={() => {
                  setSelectedExperience(exp);
                  setFloatingItems([]);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                  selectedExperience.id === exp.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md ring-2 ring-amber-400/50'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                <span>{(exp.title || '').split(' ')[0]} {(exp.title || '').split(' ')[1] || ''}</span>
                <span className="text-[11px] opacity-75 font-normal">({exp.state})</span>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. THE MAIN SACRED DARSHAN SANCTUARY STAGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        
        {/* Unified Clean Sanctum Player with Balanced Aspect Ratio */}
        <div className="rounded-3xl bg-white border border-stone-200 shadow-md overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 lg:h-[460px]">
            
            {/* Left Stage Visualizer - Proportional, Cinema Aspect Ratio (Never stretched or bloated) */}
            <div 
              className="lg:col-span-8 relative h-64 sm:h-80 md:h-96 lg:h-full bg-stone-950 overflow-hidden select-none cursor-crosshair"
              style={{ perspective: '1200px' }}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0 }); }}
            >
              {/* 3D Transform Layer */}
              <div 
                className="w-full h-full transition-transform duration-200 ease-out relative"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.08 : 1})`,
                  transformStyle: 'preserve-3d'
                }}
              >
                <img
                  src={selectedExperience.image}
                  alt={selectedExperience.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/epuja/ganga-aarti.jpg';
                  }}
                  className="w-full h-full object-cover object-[center_20%] filter brightness-75 transition-all duration-700"
                />
                
                {/* 3D Depth Particles/Glare Effect */}
                <div 
                  className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 - tilt.x * 2}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
                    transform: 'translateZ(50px)',
                    opacity: isHovered ? 1 : 0
                  }}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-stone-950/40 pointer-events-none" />

              {/* 3D Indicator Badge */}
              <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
                <span className={`px-3 py-1.5 rounded-full bg-black/60 border border-white/20 text-[10px] font-bold tracking-wider text-amber-400 uppercase transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-40'}`}>
                  3D Interactive Space
                </span>
              </div>

              {/* Top Overlays: Live Status & Authentic Sound Trigger */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs text-white z-20">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/80 border border-white/20 font-semibold flex items-center gap-1.5 shadow-md">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span>{getTranslation('virtualActive', langCode)}</span>
                  </span>
                  
                  <button
                    onClick={() => setShowLiveGuide(true)}
                    className="px-3.5 py-1.5 rounded-full bg-amber-500/90 hover:bg-amber-400 text-stone-950 font-semibold flex items-center gap-1.5 shadow-md border border-amber-400/50 transition-all cursor-pointer group"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>AI Guide</span>
                  </button>
                </div>

                <button
                  onClick={triggerExperienceSound}
                  className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
                >
                  <Bell className="w-4 h-4 text-stone-950" />
                  <span>
                    {selectedExperience.audioAction === 'dhaak'
                      ? 'Play Dhaak Beat 🥁'
                      : selectedExperience.audioAction === 'damru'
                      ? 'Play Damru Beat 🕉️'
                      : selectedExperience.audioAction === 'bell'
                      ? 'Ring Brass Bell 🔔'
                      : 'Blow Holy Conch 🐚'}
                  </span>
                </button>
              </div>

              {/* Animated Floating Sacred Offerings */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {floatingItems.map((item) => (
                  <div
                    key={item.id}
                    style={{ left: `${item.left}%` }}
                    className="absolute bottom-16 animate-float-up flex flex-col items-center transition-all"
                  >
                    {item.type === 'pushpanjali' && <span className="text-3xl filter drop-shadow-md">🌺</span>}
                    {item.type === 'diya' && (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]">🪔</span>
                        {item.text && (
                          <span className="text-[10px] font-medium bg-black/90 text-amber-200 px-2 py-0.5 rounded-full mt-1 max-w-[140px] truncate border border-amber-500/30">
                            {item.text}
                          </span>
                        )}
                      </div>
                    )}
                    {item.type === 'bilva' && <span className="text-3xl filter drop-shadow-md">🍃</span>}
                    {item.type === 'tulsi' && <span className="text-3xl filter drop-shadow-md">🌿</span>}
                    {item.type === 'chandan' && <span className="text-3xl filter drop-shadow-md">🕉️</span>}
                    {item.type === 'chunri' && <span className="text-3xl filter drop-shadow-md">🥥</span>}
                    {item.type === 'karseva' && <span className="text-3xl filter drop-shadow-md">🌊</span>}
                    {item.type === 'rope' && <span className="text-3xl filter drop-shadow-md">🚩</span>}
                    {item.type === 'umbrella' && <span className="text-3xl filter drop-shadow-md">☂️</span>}
                  </div>
                ))}
              </div>

              {/* Bottom Interactive Bar */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 sm:p-4 rounded-2xl bg-black/85 border border-white/20 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div>
                  <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{selectedExperience.title}</span>
                  </div>
                  <div className="text-xs text-stone-300 font-light mt-0.5">
                    {selectedExperience.deity} • {selectedExperience.location}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePerformRitual}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Flower2 className="w-4 h-4 text-stone-950" />
                    <span>{selectedExperience.interactiveLabel}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Action & Prayer Sanctuary */}
            <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between bg-stone-50/90 border-t lg:border-t-0 lg:border-l border-stone-200 space-y-4 lg:overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                    {selectedExperience.categoryLabel}
                  </span>
                  <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    {(selectedExperience.timeOfDay || '').split('(')[0]}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-royal text-stone-900 leading-snug">
                    {selectedExperience.title}
                  </h3>
                  <div className="text-xs text-amber-800 font-semibold mt-1">
                    Presiding Deity: {selectedExperience.deity}
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {selectedExperience.significance}
                </p>

                {/* Wish / Sankalpa Input */}
                <div className="space-y-2 pt-2 border-t border-stone-200">
                  <label className="block text-xs font-bold text-stone-800">
                    Write your Sacred Sankalpa / Prayer:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userWish}
                      onChange={(e) => setUserWish(e.target.value)}
                      placeholder="e.g. Health, peace & family welfare..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600"
                      maxLength={90}
                    />
                    <button
                      onClick={handlePerformRitual}
                      className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold cursor-pointer transition-colors shrink-0"
                    >
                      Offer Diya
                    </button>
                  </div>
                </div>
              </div>

              {/* Community Reverence Stream */}
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <span>Live Pilgrim Reverence Stream</span>
                  <span className="text-amber-700 font-mono text-[10px]">{activeInteractiveCount} offerings</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {wishesList.map((wish, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white border border-stone-200 text-[11px] text-stone-700 shadow-2xs flex items-start gap-2"
                    >
                      <span className="text-amber-600 font-bold shrink-0">🪔</span>
                      <span className="leading-snug">{wish}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. STEP-BY-STEP SACRED RITUAL TIMELINE */}
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                LIVING HERITAGE CHRONICLE
              </span>
              <h3 className="text-2xl font-bold font-royal text-stone-900 mt-0.5">
                Sacred Ritual Sequences & Significance
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-light hidden sm:inline">
              Documented according to Agamic, Vedic & Regional traditions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {selectedExperience.rituals.map((ritual, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-700 font-bold flex items-center justify-center font-mono text-xs">
                      {idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 font-mono text-[10px] font-semibold border border-amber-200">
                      {ritual.timing}
                    </span>
                  </div>
                  <h4 className="text-base font-bold font-royal text-stone-900 leading-snug">
                    {ritual.name}
                  </h4>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {ritual.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-100 text-[10px] text-amber-800 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Living Tradition</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ALL SHRINES & PILGRIMAGE DIRECTORY - Sharp Images, Lower Brightness, No Blur */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                ALL SACRED MANDIRS & CELEBRATIONS
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-royal text-stone-900 mt-1">
                Explore All {EVISIT_CATALOG.length} Virtual Mandirs & Sacred Darshans
              </h3>
            </div>
            <div className="text-sm text-stone-500 font-medium">
              Interactive 360° virtual sanctuaries with authentic soundscapes
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((exp) => (
              <div
                key={exp.id}
                onClick={() => {
                  setSelectedExperience(exp);
                  setFloatingItems([]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group rounded-3xl overflow-hidden bg-white border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedExperience.id === exp.id
                    ? 'border-amber-500 ring-2 ring-amber-400/30 shadow-lg'
                    : 'border-stone-200 hover:border-amber-400 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Image Banner - Sharp, Lower Brightness, Fixed 16:10 Ratio */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/epuja/ganga-aarti.jpg';
                    }}
                    className="w-full h-full object-cover object-[center_20%] filter brightness-80 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 text-xs font-semibold text-amber-300 border border-white/20 shadow-md">
                    {exp.categoryLabel}
                  </span>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 px-3 rounded-xl bg-black/85 border border-white/20 text-white flex items-center justify-between shadow-lg">
                    <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{exp.location}, {exp.state}</span>
                    </div>
                    <span className="text-[10px] text-stone-300 font-mono shrink-0">
                      {(exp.timeOfDay || '').split('(')[0]}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h4 className="text-lg font-bold font-royal text-stone-900 group-hover:text-amber-800 transition-colors">
                    {exp.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 font-normal leading-relaxed">
                    {exp.significance}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-sm">
                    <span className="text-stone-500 font-mono text-xs">{(exp.timeOfDay || '').split('(')[0]}</span>
                    <span className="text-stone-900 font-bold group-hover:text-amber-700 flex items-center gap-1">
                      Enter Darshan →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Temple Chat Modal */}
      <TempleChatModal
        isOpen={showLiveGuide}
        onClose={() => setShowLiveGuide(false)}
        experienceTitle={selectedExperience.title}
      />
    </div>
  );
};
