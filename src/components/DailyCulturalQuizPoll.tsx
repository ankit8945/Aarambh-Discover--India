import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  Vote,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
  ChevronRight,
  RotateCw,
  Compass,
  ArrowRight,
  TrendingUp,
  Share2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { heritageAudio } from '../utils/audioEffects';
import { SocialShareModal } from './SocialShareModal';
import { executeWebShare, isWebShareSupported, SharePayload } from '../utils/socialShare';

interface DailyCulturalQuizPollProps {
  onExplorePlace?: (placeName: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface QuizQuestion {
  id: string;
  dateStr: string;
  category: string;
  categoryIcon: string;
  placeContext: string;
  question: string;
  hindiQuestion: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  funFact: string;
  monumentLink?: string;
  xpReward: number;
}

interface HeritagePoll {
  id: string;
  topic: string;
  hindiTopic: string;
  question: string;
  options: {
    id: string;
    text: string;
    subtext: string;
    initialVotes: number;
  }[];
  totalVotes: number;
}

// 7 Curated Daily Heritage Quizzes (cycles based on day)
const DAILY_QUIZZES: QuizQuestion[] = [
  {
    id: 'quiz-kailasa-monolith',
    dateStr: 'Today’s Heritage Challenge',
    category: 'Rock-Cut Architecture',
    categoryIcon: '⛰️',
    placeContext: 'Ellora Caves, Maharashtra',
    question: 'How was the majestic monolithic Kailasa Temple (Cave 16) at Ellora carved out of the basalt cliff?',
    hindiQuestion: 'एलोरा का कैलास मन्दिर विशाल बेसाल्ट चट्टान से किस प्रकार तराशा गया था?',
    options: [
      'Carved entirely top-down from a single cliff without scaffolding or joining blocks',
      'Assembled using interlocking granite blocks imported from Deccan rivers',
      'Built inside a natural lava cavern using baked terracotta tiles',
      'Constructed with limestone mortar by Roman traveling architects',
    ],
    correctIndex: 0,
    explanation:
      'Kailasa Temple is the largest monolithic rock excavation in the world. Rashtrakuta artisans carved downwards from the cliff summit, excavating over 200,000 tonnes of rock without assembling a single joint block!',
    funFact: 'Engineers calculate that traditional quarrying today would take decades to replicate such precision top-down excavation.',
    monumentLink: 'Ellora Caves',
    xpReward: 50,
  },
  {
    id: 'quiz-konark-sundial',
    dateStr: 'Yesterday’s Highlight',
    category: 'Vedic Astronomy & Masonry',
    categoryIcon: '☸️',
    placeContext: 'Konark, Odisha',
    question: 'What ingenious astronomical function do the 24 elaborately carved chariot wheels of the Konark Sun Temple serve?',
    hindiQuestion: 'कोणार्क सूर्य मन्दिर के 24 नक्काशीदार रथ के पहिये क्या खगोलीय कार्य करते हैं?',
    options: [
      'They represent musical notes for temple dancers',
      'They act as high-precision sundials that calculate exact time to the minute by shadows',
      'They were water-wheel mechanisms to pump sacred water into the sanctum',
      'They were astronomical compasses pointing purely to the celestial North Star',
    ],
    correctIndex: 1,
    explanation:
      'The 24 wheels of Konark correspond to the 24 fortnights of the Hindu year. The spokes act as sundials: the shadow cast by the hub on the spokes calculates local solar time down to the minute!',
    funFact: 'Even on cloudy days, trained local guides can tell the time by analyzing the diffuse shadow along the spoke beads.',
    monumentLink: 'Konark Sun Temple',
    xpReward: 50,
  },
  {
    id: 'quiz-rani-ki-vav',
    dateStr: 'Vedic Subterranean Marvels',
    category: 'Water Architecture',
    categoryIcon: '🌊',
    placeContext: 'Patan, Gujarat',
    question: 'Why was Rani ki Vav designed as an "inverted temple" that descends 7 storeys underground?',
    hindiQuestion: 'रानी की वाव को 7 मंजिला "उलटे मन्दिर" के रूप में भूमिगत क्यों बनाया गया था?',
    options: [
      'To conceal temple treasures from passing trade caravans',
      'To sanctify subterranean groundwater as a sacred shrine dedicated to Lord Vishnu',
      'Because Gujarat sandstorms prevented above-ground constructions',
      'To serve exclusively as an emergency military escape tunnel to Rajasthan',
    ],
    correctIndex: 1,
    explanation:
      'Built in the 11th century by Queen Udayamati in memory of King Bhima I, Rani ki Vav elevates groundwater into a sacred sanctuary. It features more than 500 principal sculptures, predominantly celebrating Vishnu’s Dasavatara.',
    funFact: 'The stepwell remained preserved for centuries under the silts of the Saraswati River before being meticulously excavated by ASI.',
    monumentLink: 'Rani ki Vav',
    xpReward: 50,
  },
  {
    id: 'quiz-brihadeeswarar-vimana',
    dateStr: 'Chola Imperial Engineering',
    category: 'Dravidian Architecture',
    categoryIcon: '🏛️',
    placeContext: 'Thanjavur, Tamil Nadu',
    question: 'What is unique about the monolithic Kumbam (granite apex capstone) atop the Brihadeeswarar Temple vimana?',
    hindiQuestion: 'तंजावुर के बृहदीश्वर मन्दिर के शीर्ष पर स्थित अखंड ग्रेनाइट गुंबद की क्या विशेषता है?',
    options: [
      'It weighs approximately 80 tonnes and was hauled up an inclined ramp over 6 km long',
      'It was carved from floating pumice stone imported from Sri Lanka',
      'It is hollow inside and holds an eternal mercury lamp',
      'It was forged using Damascus crucible wootz steel',
    ],
    correctIndex: 0,
    explanation:
      'Constructed by Raja Raja Chola I in 1010 CE, the monolithic granite capstone weighs ~80 tonnes. Chola engineers rolled it up an earthen incline stretching several kilometers to reach the 66-meter high tower summit without cranes!',
    funFact: 'The temple is built entirely of interlocking granite, with zero granite quarries within a 50 km radius of Thanjavur.',
    monumentLink: 'Brihadeeswarar Temple',
    xpReward: 50,
  },
  {
    id: 'quiz-hampi-stone-chariot',
    dateStr: 'Vijayanagara Renaissance',
    category: 'Sacred Stone Art',
    categoryIcon: '🛕',
    placeContext: 'Hampi, Karnataka',
    question: 'What remarkable feature did the iconic Stone Chariot in the Vittala Temple complex at Hampi originally have?',
    hindiQuestion: 'हम्पी के विट्ठल मन्दिर स्थित प्रसिद्ध प्रस्तर रथ में मूलतः क्या अनूठी विशेषता थी?',
    options: [
      'Its stone wheels were completely functional and could rotate freely on stone axles',
      'It was carved out of a single meteorite fragment that fell in Tungabhadra',
      'It had an underground hydraulic lift that elevated the deity during festivals',
      'It contained a water clock that chimed every prahara',
    ],
    correctIndex: 0,
    explanation:
      'The iconic stone wheels of Hampi’s Garuda shrine chariot were carved with stone axles and could originally rotate! ASI later stabilized the wheels to prevent wear from enthusiastic pilgrims.',
    funFact: 'The nearby Ranga Mandapa has 56 musical pillars that emit the notes of the saptaswara when tapped gently.',
    monumentLink: 'Hampi',
    xpReward: 50,
  },
];

// Curated Heritage Community Polls
const COMMUNITY_POLLS: HeritagePoll[] = [
  {
    id: 'poll-ancient-marvel',
    topic: 'Engineering Marvel of Ancient Bharat',
    hindiTopic: 'प्राचीन भारत का अद्वितीय वास्तु चमत्कार',
    question: 'Which ancient Indian architectural marvel astounds you the most in its engineering ingenuity?',
    options: [
      {
        id: 'opt-kailasa',
        text: 'Kailasa Temple, Ellora',
        subtext: 'Carved 200,000 tonnes top-down from a single cliff',
        initialVotes: 948,
      },
      {
        id: 'opt-konark',
        text: 'Konark Sun Temple Wheels',
        subtext: 'Stone chariot wheels that tell time to the minute',
        initialVotes: 612,
      },
      {
        id: 'opt-thanjavur',
        text: 'Brihadeeswarar Vimana, Thanjavur',
        subtext: '80-tonne single granite capstone raised without cranes',
        initialVotes: 524,
      },
      {
        id: 'opt-stepwell',
        text: 'Rani ki Vav & Chand Baori',
        subtext: 'Inverted underground water sanctuaries with 3,500 steps',
        initialVotes: 489,
      },
    ],
    totalVotes: 2573,
  },
  {
    id: 'poll-craft-protection',
    topic: 'Endangered Living Crafts Preservation',
    hindiTopic: 'विलुप्तप्राय पारम्परिक हस्तशिल्प संरक्षण',
    question: 'Which endangered living craft should receive the highest priority for global GI preservation & artisan livelihoods?',
    options: [
      {
        id: 'opt-patola',
        text: 'Patan Patola Double Ikat',
        subtext: 'Takes 6 months to weave a single heirloom silk sari',
        initialVotes: 730,
      },
      {
        id: 'opt-bellmetal',
        text: 'Sarthebari Bell-Metal (Assam)',
        subtext: 'Hand-hammered bronze alloys with ancient acoustics',
        initialVotes: 412,
      },
      {
        id: 'opt-toda',
        text: 'Toda Nilgiri Embroidery',
        subtext: 'Geometric black-and-red needlework by hill tribes',
        initialVotes: 388,
      },
      {
        id: 'opt-bidriware',
        text: 'Bidriware Silver Inlay (Karnataka)',
        subtext: 'Zinc-copper alloy blackened with special fort soil',
        initialVotes: 510,
      },
    ],
    totalVotes: 2040,
  },
];

export const DailyCulturalQuizPoll: React.FC<DailyCulturalQuizPollProps> = ({
  onExplorePlace,
  onNavigateTab,
}) => {
  const [activeMode, setActiveMode] = useState<'quiz' | 'poll'>('quiz');

  // Quiz State
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const currentQuiz = DAILY_QUIZZES[quizIndex];
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('aarambh_quiz_streak') || '3', 10);
  });
  const [earnedXPMessage, setEarnedXPMessage] = useState<string | null>(null);

  // Social Share State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);

  const handleShareQuiz = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://aarambh.heritage.in';
    const payload: SharePayload = {
      title: `Aarambh Daily Heritage Quiz • ${streakCount}-Day Streak!`,
      text: `🪔 Today's Bharat Heritage Question: "${currentQuiz.question}"\n\nI just tested my Indian heritage knowledge on Aarambh and am on a ${streakCount}-day cultural streak! Can you answer it?`,
      url: currentUrl,
    };

    if (isWebShareSupported()) {
      try {
        const res = await executeWebShare(payload);
        if (res.success && res.method === 'native') {
          return;
        }
      } catch (e) {
        console.warn('Native share error:', e);
      }
    }
    setSharePayload(payload);
    setShowShareModal(true);
  };

  // Poll State
  const [pollIndex, setPollIndex] = useState<number>(0);
  const currentPoll = COMMUNITY_POLLS[pollIndex];
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(() => {
    return localStorage.getItem(`aarambh_poll_${currentPoll.id}_choice`);
  });
  const [pollVotes, setPollVotes] = useState<{ [optionId: string]: number }>(() => {
    const saved = localStorage.getItem(`aarambh_poll_${currentPoll.id}_votes`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const initial: { [key: string]: number } = {};
    currentPoll.options.forEach((opt) => {
      initial[opt.id] = opt.initialVotes;
    });
    return initial;
  });

  // Calculate current poll total
  const currentPollTotal = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  // Load saved quiz answer for current quiz if already answered
  useEffect(() => {
    const savedAnswer = localStorage.getItem(`aarambh_quiz_${currentQuiz.id}_answered`);
    if (savedAnswer !== null) {
      setSelectedOption(parseInt(savedAnswer, 10));
      setIsAnswered(true);
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      setEarnedXPMessage(null);
    }
  }, [quizIndex, currentQuiz.id]);

  // Handle Quiz Option Selection
  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);
    localStorage.setItem(`aarambh_quiz_${currentQuiz.id}_answered`, idx.toString());

    const isCorrect = idx === currentQuiz.correctIndex;
    if (isCorrect) {
      heritageAudio.playStampSound();
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#059669', '#d97706', '#2563eb', '#f59e0b'],
      });

      // Update streak
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem('aarambh_quiz_streak', newStreak.toString());

      // Reward XP (+50 XP)
      setEarnedXPMessage(`+${currentQuiz.xpReward} XP Earned! Added to your Digital Yatra Passport.`);
      try {
        const currentScans = parseInt(localStorage.getItem('aarambh_scanned_monuments_count') || '1', 10);
        localStorage.setItem('aarambh_scanned_monuments_count', (currentScans + 1).toString());
        window.dispatchEvent(
          new CustomEvent('aarambh-xp-updated', {
            detail: { action: 'QUIZ_SOLVED', xp: currentQuiz.xpReward },
          })
        );
      } catch (e) {
        console.warn(e);
      }
    } else {
      setEarnedXPMessage('Good attempt! Discover the ancient wisdom below.');
    }
  };

  // Handle Poll Vote
  const handleVotePoll = (optionId: string) => {
    if (selectedPollOption) return;

    setSelectedPollOption(optionId);
    localStorage.setItem(`aarambh_poll_${currentPoll.id}_choice`, optionId);

    const updatedVotes = {
      ...pollVotes,
      [optionId]: (pollVotes[optionId] || 0) + 1,
    };
    setPollVotes(updatedVotes);
    localStorage.setItem(`aarambh_poll_${currentPoll.id}_votes`, JSON.stringify(updatedVotes));

    heritageAudio.playStampSound();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#d97706', '#059669'],
    });

    // Reward +25 XP for community civic participation
    window.dispatchEvent(
      new CustomEvent('aarambh-xp-updated', {
        detail: { action: 'POLL_VOTED', xp: 25 },
      })
    );
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#FAF7F0] via-white to-[#FDF8EE] rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl shadow-md border border-amber-300/40 shrink-0">
            {activeMode === 'quiz' ? '🪔' : '🗳️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/30">
                DAILY ENGAGEMENT • दैनिक संस्कृति
              </span>
              <span className="text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>{streakCount} Day Streak</span>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-royal text-white tracking-tight mt-0.5">
              {activeMode === 'quiz'
                ? 'Bharat Heritage Daily Trivia Challenge'
                : 'Living Heritage Community Voice Poll'}
            </h3>
          </div>
        </div>

        {/* Tab Toggle: Trivia vs Poll */}
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-2xl border border-stone-800 self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('quiz')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'quiz'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Daily Quiz</span>
            <span className="text-[9px] font-mono bg-amber-900/80 text-amber-200 px-1.5 py-0.2 rounded-full">
              +50 XP
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('poll')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeMode === 'poll'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Community Poll</span>
            <span className="text-[9px] font-mono bg-amber-900/80 text-amber-200 px-1.5 py-0.2 rounded-full">
              Vote
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-7">
        {/* ================= MODE A: DAILY CULTURAL QUIZ ================= */}
        {activeMode === 'quiz' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentQuiz.categoryIcon}</span>
                <div>
                  <span className="text-xs font-bold text-amber-900 font-mono">
                    {currentQuiz.category}
                  </span>
                  <span className="text-stone-400 text-xs mx-1.5">•</span>
                  <span className="text-xs text-stone-600 font-medium">
                    {currentQuiz.placeContext}
                  </span>
                </div>
              </div>

              {/* Cycle through questions */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-stone-500">
                  Question {quizIndex + 1} of {DAILY_QUIZZES.length}
                </span>
                <button
                  type="button"
                  onClick={() => setQuizIndex((prev) => (prev + 1) % DAILY_QUIZZES.length)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                  title="Next Challenge"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-1.5">
              <h4 className="text-base sm:text-lg font-bold font-royal text-stone-900 leading-snug">
                {currentQuiz.question}
              </h4>
              <p className="text-xs sm:text-sm text-stone-500 font-serif italic">
                {currentQuiz.hindiQuestion}
              </p>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuiz.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuiz.correctIndex;

                let btnStyle = 'bg-stone-50/80 border-stone-200 hover:bg-amber-50/50 hover:border-amber-300 text-stone-800';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-300 shadow-xs';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-red-50 border-red-300 text-red-900 opacity-80';
                  } else {
                    btnStyle = 'bg-stone-50/40 border-stone-200 text-stone-400';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-start gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                        isAnswered && isCorrect
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback & Cultural Explanation Reveal */}
            {isAnswered && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 border border-amber-300 shadow-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedOption === currentQuiz.correctIndex ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Satyamev Jayate • Correct Answer!</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold font-mono flex items-center gap-1 border border-red-300">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Not quite, but here is the true lore!</span>
                      </span>
                    )}
                  </div>

                  {earnedXPMessage && (
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-400">
                      {earnedXPMessage}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal">
                  <strong className="font-bold text-stone-900">Historical Significance: </strong>
                  {currentQuiz.explanation}
                </p>

                <div className="pt-2 border-t border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-950 font-medium">
                  <div className="flex items-center gap-1.5 italic text-stone-600">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Fact: {currentQuiz.funFact}</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleShareQuiz}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 border border-amber-300 transition-colors cursor-pointer"
                      title="Share daily quiz challenge with friends"
                    >
                      <Share2 className="w-3 h-3 text-amber-800" />
                      <span>Share Challenge</span>
                    </button>

                    {currentQuiz.monumentLink && onExplorePlace && (
                      <button
                        type="button"
                        onClick={() => onExplorePlace(currentQuiz.monumentLink!)}
                        className="text-amber-800 hover:text-amber-950 font-bold underline flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>Explore {currentQuiz.monumentLink}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= MODE B: COMMUNITY CULTURAL POLL ================= */}
        {activeMode === 'poll' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-900 font-mono">
                  {currentPoll.topic}
                </span>
                <span className="text-stone-400 text-xs mx-1.5">•</span>
                <span className="text-xs text-stone-600 font-serif italic">
                  {currentPoll.hindiTopic}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-stone-500 font-bold">
                  {currentPollTotal.toLocaleString()} Travelers Voted
                </span>
                <button
                  type="button"
                  onClick={() => setPollIndex((prev) => (prev + 1) % COMMUNITY_POLLS.length)}
                  className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                  title="Next Community Poll"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Poll Question */}
            <h4 className="text-base sm:text-lg font-bold font-royal text-stone-900 leading-snug">
              {currentPoll.question}
            </h4>

            {/* Poll Voting Options / Results Bars */}
            <div className="space-y-3">
              {currentPoll.options.map((opt) => {
                const isSelected = selectedPollOption === opt.id;
                const votes = pollVotes[opt.id] || opt.initialVotes;
                const percentage = Math.round((votes / currentPollTotal) * 100) || 0;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleVotePoll(opt.id)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer select-none ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-300/40 bg-amber-50/40'
                        : 'border-stone-200 hover:border-amber-300 bg-white hover:bg-stone-50'
                    }`}
                  >
                    {/* Live Progress Bar Fill */}
                    {selectedPollOption && (
                      <div
                        className={`absolute top-0 bottom-0 left-0 transition-all duration-700 ease-out opacity-20 ${
                          isSelected ? 'bg-amber-600' : 'bg-stone-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                              isSelected
                                ? 'border-amber-600 bg-amber-600'
                                : 'border-stone-400 bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {opt.text}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 pl-6 leading-tight">
                          {opt.subtext}
                        </p>
                      </div>

                      {/* Percentage Badge */}
                      <div className="shrink-0 text-right font-mono">
                        {selectedPollOption ? (
                          <div className="text-right">
                            <span className="text-sm font-bold text-stone-900">{percentage}%</span>
                            <div className="text-[10px] text-stone-500">
                              {votes.toLocaleString()} votes
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300 hover:bg-amber-200 transition-colors">
                            Vote
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Poll Footer */}
            {selectedPollOption ? (
              <div className="pt-2 flex items-center justify-between text-xs text-stone-500 font-mono">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Vote registered into Aarambh consensus graph (+25 XP)</span>
                </span>
                <span>Next community poll updates at midnight IST</span>
              </div>
            ) : (
              <div className="text-xs text-stone-500 italic text-center">
                Click any option to cast your voice and view live community results.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Daily Quiz / Challenge Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        payload={
          sharePayload || {
            title: `Aarambh Heritage Challenge`,
            text: `Test your knowledge of Indian heritage on Aarambh!`,
          }
        }
        badgeType="memory"
        subtitle="Challenge friends to test their Indian heritage wisdom"
      />
    </div>
  );
};
