import React, { useState, useRef, useEffect } from 'react';
import { heritageAudio } from '../utils/audioEffects';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Dice5,
  RotateCcw,
  Volume2,
  VolumeX,
  Palette,
  Download,
  Eraser,
  Trash2,
  Undo2,
  CheckCircle2,
  Layers,
  HelpCircle,
  Award,
  BookOpen,
  Eye,
} from 'lucide-react';

// ==========================================
// MOKSHA PATAM BOARD CONFIGURATION (64 SQUARES)
// ==========================================
interface MokshaSquareInfo {
  num: number;
  name: string;
  hindi: string;
  type: 'normal' | 'ladder' | 'snake' | 'moksha';
  target?: number;
  virtueVice?: string;
  meaning: string;
}

const MOKSHA_BOARD: MokshaSquareInfo[] = [
  // Row 8 (Top)
  { num: 64, name: 'Moksha / Nirvana', hindi: 'मोक्ष (परम मुक्ति)', type: 'moksha', meaning: 'Liberation from the cycle of rebirth, ultimate spiritual realization.' },
  { num: 63, name: 'Tamas', hindi: 'तमस', type: 'snake', target: 2, virtueVice: 'Vice', meaning: 'Inertia & spiritual lethargy drops you back to Maya.' },
  { num: 62, name: 'Sattva', hindi: 'सत्त्व', type: 'normal', meaning: 'Purity, light and harmony.' },
  { num: 61, name: 'Rajas', hindi: 'रजस', type: 'normal', meaning: 'Dynamic worldly passion.' },
  { num: 60, name: 'Dambha (Pride)', hindi: 'दम्भ / पाखण्ड', type: 'snake', target: 36, virtueVice: 'Vice', meaning: 'Pretension and hypocritical ego.' },
  { num: 59, name: 'Viveka', hindi: 'विवेक', type: 'normal', meaning: 'Spiritual discrimination.' },
  { num: 58, name: 'Vairagya', hindi: 'वैराग्य', type: 'ladder', target: 64, virtueVice: 'Virtue', meaning: 'True dispassion leads directly to Moksha!' },
  { num: 57, name: 'Ananda', hindi: 'आनन्द', type: 'normal', meaning: 'Spiritual bliss.' },

  // Row 7
  { num: 49, name: 'Shanti', hindi: 'शान्ति', type: 'normal', meaning: 'Inner tranquility.' },
  { num: 50, name: 'Bhakti', hindi: 'भक्ति', type: 'ladder', target: 62, virtueVice: 'Virtue', meaning: 'Pure devotion elevates consciousness.' },
  { num: 51, name: 'Krodha (Wrath)', hindi: 'क्रोध', type: 'snake', target: 20, virtueVice: 'Vice', meaning: 'Anger clouds judgment and pulls the mind down.' },
  { num: 52, name: 'Dana', hindi: 'दान', type: 'ladder', target: 58, virtueVice: 'Virtue', meaning: 'Selfless charity brings divine merit.' },
  { num: 53, name: 'Upasana', hindi: 'उपासना', type: 'normal', meaning: 'Contemplation and prayer.' },
  { num: 54, name: 'Lobha (Greed)', hindi: 'लोभ', type: 'snake', target: 12, virtueVice: 'Vice', meaning: 'Insatiable craving creates bondage.' },
  { num: 55, name: 'Dharma', hindi: 'धर्म', type: 'ladder', target: 61, virtueVice: 'Virtue', meaning: 'Righteous conduct elevates one to highest realms.' },
  { num: 56, name: 'Maya', hindi: 'माया', type: 'normal', meaning: 'Illusion of separation.' },

  // Row 6
  { num: 48, name: 'Satya (Truth)', hindi: 'सत्य', type: 'ladder', target: 59, virtueVice: 'Virtue', meaning: 'Truthfulness aligns the soul with cosmic law.' },
  { num: 47, name: 'Ahimsa', hindi: 'अहिंसा', type: 'ladder', target: 57, virtueVice: 'Virtue', meaning: 'Non-violence and reverence for all living beings.' },
  { num: 46, name: 'Moha (Delusion)', hindi: 'मोह', type: 'snake', target: 28, virtueVice: 'Vice', meaning: 'Excessive worldly attachment brings sorrow.' },
  { num: 45, name: 'Kshama (Forgiveness)', hindi: 'क्षमा', type: 'ladder', target: 56, virtueVice: 'Virtue', meaning: 'Forgiveness frees the spirit from bitterness.' },
  { num: 44, name: 'Irshya (Envy)', hindi: 'ईर्ष्या', type: 'snake', target: 14, virtueVice: 'Vice', meaning: 'Envy corrodes inner peace.' },
  { num: 43, name: 'Seva', hindi: 'सेवा', type: 'ladder', target: 53, virtueVice: 'Virtue', meaning: 'Humble service to humanity.' },
  { num: 42, name: 'Alasya (Sloth)', hindi: 'आलस्य', type: 'snake', target: 22, virtueVice: 'Vice', meaning: 'Lethargy delays spiritual growth.' },
  { num: 41, name: 'Satsang', hindi: 'सत्संग', type: 'ladder', target: 49, virtueVice: 'Virtue', meaning: 'Noble company uplifts thoughts.' },

  // Row 5
  { num: 33, name: 'Dhyana', hindi: 'ध्यान', type: 'ladder', target: 47, virtueVice: 'Virtue', meaning: 'Single-pointed meditation.' },
  { num: 34, name: 'Samsara', hindi: 'संसार', type: 'normal', meaning: 'The flowing stream of worldly life.' },
  { num: 35, name: 'Tapasya', hindi: 'तपस्या', type: 'ladder', target: 50, virtueVice: 'Virtue', meaning: 'Austerity and focused discipline.' },
  { num: 36, name: 'Ahankara (Ego)', hindi: 'अहंकार', type: 'snake', target: 11, virtueVice: 'Vice', meaning: 'Ego causes a precipitous fall.' },
  { num: 37, name: 'Daya (Compassion)', hindi: 'दया', type: 'ladder', target: 48, virtueVice: 'Virtue', meaning: 'Kindness towards every soul.' },
  { num: 38, name: 'Kama (Lust)', hindi: 'काम', type: 'snake', target: 18, virtueVice: 'Vice', meaning: 'Uncontrolled sensory cravings.' },
  { num: 39, name: 'Shraddha', hindi: 'श्रद्धा', type: 'ladder', target: 52, virtueVice: 'Virtue', meaning: 'Unwavering spiritual faith.' },
  { num: 40, name: 'Avidya', hindi: 'अविद्या', type: 'snake', target: 6, virtueVice: 'Vice', meaning: 'Spiritual ignorance of one’s true nature.' },

  // Row 4
  { num: 32, name: 'Chitta Shuddhi', hindi: 'चित्त शुद्धि', type: 'ladder', target: 43, virtueVice: 'Virtue', meaning: 'Purification of mental impressions.' },
  { num: 31, name: 'Karma Bhumi', hindi: 'कर्म भूमि', type: 'normal', meaning: 'Field of action.' },
  { num: 30, name: 'Anrite (Falsehood)', hindi: 'असत्य', type: 'snake', target: 10, virtueVice: 'Vice', meaning: 'Deceit breaks spiritual foundation.' },
  { num: 29, name: 'Santosh (Contentment)', hindi: 'सन्तोष', type: 'ladder', target: 45, virtueVice: 'Virtue', meaning: 'Gratitude for what is given.' },
  { num: 28, name: 'Asatya Sang', hindi: 'कुसंग', type: 'normal', meaning: 'Distracting worldly associations.' },
  { num: 27, name: 'Swadhyaya', hindi: 'स्वाध्याय', type: 'ladder', target: 39, virtueVice: 'Virtue', meaning: 'Self-study of sacred scriptures.' },
  { num: 26, name: 'Chinta (Anxiety)', hindi: 'चिन्ता', type: 'snake', target: 8, virtueVice: 'Vice', meaning: 'Restless worry.' },
  { num: 25, name: 'Vrata (Sacred Vow)', hindi: 'व्रत', type: 'normal', meaning: 'Vow of purity.' },

  // Row 3
  { num: 17, name: 'Brahmacharya', hindi: 'ब्रह्मचर्य', type: 'ladder', target: 33, virtueVice: 'Virtue', meaning: 'Preservation of vital energy.' },
  { num: 18, name: 'Vasanas', hindi: 'वासना', type: 'normal', meaning: 'Deep latent desires.' },
  { num: 19, name: 'Pranayama', hindi: 'प्राणायाम', type: 'ladder', target: 35, virtueVice: 'Virtue', meaning: 'Breath mastery and stillness.' },
  { num: 20, name: 'Mada (Arrogance)', hindi: 'मद', type: 'normal', meaning: 'Intoxication of pride.' },
  { num: 21, name: 'Punya (Virtue)', hindi: 'पुण्य', type: 'ladder', target: 37, virtueVice: 'Virtue', meaning: 'Meritorious deeds accumulate grace.' },
  { num: 22, name: 'Papa (Sin)', hindi: 'पाप', type: 'normal', meaning: 'Harmful action.' },
  { num: 23, name: 'Gurukripa', hindi: 'गुरूकृपा', type: 'ladder', target: 41, virtueVice: 'Virtue', meaning: 'Blessings of a true spiritual teacher.' },
  { num: 24, name: 'Swarga', hindi: 'स्वर्ग', type: 'normal', meaning: 'Pleasant heavenly realm.' },

  // Row 2
  { num: 16, name: 'Adharma', hindi: 'अधर्म', type: 'snake', target: 3, virtueVice: 'Vice', meaning: 'Action violating cosmic balance.' },
  { num: 15, name: 'Saucha', hindi: 'शौच', type: 'ladder', target: 29, virtueVice: 'Virtue', meaning: 'Cleanliness of body and speech.' },
  { num: 14, name: 'Matsarya', hindi: 'मात्सर्य', type: 'normal', meaning: 'Jealous resentment.' },
  { num: 13, name: 'Vinaya (Humility)', hindi: 'विनय', type: 'ladder', target: 27, virtueVice: 'Virtue', meaning: 'Gentle and respectful conduct.' },
  { num: 12, name: 'Bhog', hindi: 'भोग', type: 'normal', meaning: 'Sensory enjoyment.' },
  { num: 11, name: 'Agnyana', hindi: 'अज्ञान', type: 'normal', meaning: 'Ignorance.' },
  { num: 10, name: 'Sadachar', hindi: 'सदाचार', type: 'ladder', target: 25, virtueVice: 'Virtue', meaning: 'Good character and ethics.' },
  { num: 9, name: 'Duryodhana Dosha', hindi: 'दुर्बुद्धि', type: 'normal', meaning: 'Ill-intention.' },

  // Row 1 (Bottom)
  { num: 1, name: 'Janma (Birth)', hindi: 'जन्म', type: 'normal', meaning: 'The mortal arrival of the soul on earth.' },
  { num: 2, name: 'Maya Jal', hindi: 'माया जाल', type: 'normal', meaning: 'The web of material illusion.' },
  { num: 3, name: 'Krodha Seed', hindi: 'क्रोध बीज', type: 'normal', meaning: 'Uncontrolled temper.' },
  { num: 4, name: 'Satya Marg', hindi: 'सत्य मार्ग', type: 'ladder', target: 15, virtueVice: 'Virtue', meaning: 'First step on the path of truth.' },
  { num: 5, name: 'Mohit', hindi: 'मोहित', type: 'normal', meaning: 'Infatuated.' },
  { num: 6, name: 'Lobh Rog', hindi: 'लोभ रोग', type: 'normal', meaning: 'Seed of greed.' },
  { num: 7, name: 'Daya Sparsh', hindi: 'दया स्पर्श', type: 'ladder', target: 19, virtueVice: 'Virtue', meaning: 'Initial blossoming of compassion.' },
  { num: 8, name: 'Ashanti', hindi: 'अशान्ति', type: 'normal', meaning: 'Restlessness.' },
];

export const AncientGamesAndCanvasView: React.FC = () => {
  // Main view navigation tab
  const [activeTab, setActiveTab] = useState<'moksha' | 'chaupar' | 'canvas'>('moksha');

  // ==========================================
  // 1. MOKSHA PATAM STATE
  // ==========================================
  const [playerPos, setPlayerPos] = useState<number>(1);
  const [chanakyaPos, setChanakyaPos] = useState<number>(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<number>(1);
  const [cowries, setCowries] = useState<boolean[]>([true, false, true, false, true, true]); // true = open, false = closed
  const [gameMessage, setGameMessage] = useState<string>(
    'Roll the sacred cowrie shells to begin your karmic pilgrimage!'
  );
  const [activeSquareNote, setActiveSquareNote] = useState<MokshaSquareInfo | null>(null);
  const [gameWon, setGameWon] = useState<'player' | 'chanakya' | null>(null);

  // Play Cowrie Roll for Moksha Patam
  const handleRollMoksha = () => {
    if (diceRolling || gameWon) return;

    setDiceRolling(true);
    heritageAudio.playCowrieRollSound();

    // Randomize 6 cowrie shells (open vs closed)
    const newCowries = Array.from({ length: 6 }, () => Math.random() > 0.45);
    setCowries(newCowries);

    // Roll between 1 and 6
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastRoll(roll);

    setTimeout(() => {
      setDiceRolling(false);
      movePiece(playerPos, roll, true);
    }, 500);
  };

  const movePiece = (currentPos: number, roll: number, isHuman: boolean) => {
    let target = currentPos + roll;
    if (target > 64) {
      // Must land exactly on 64 or bounce back
      const excess = target - 64;
      target = 64 - excess;
      setGameMessage(`Overshot by ${excess}! Bounced back to square ${target}.`);
    }

    // Find the target square info
    const sq = MOKSHA_BOARD.find((s) => s.num === target);

    if (isHuman) {
      setPlayerPos(target);
      if (sq) {
        setActiveSquareNote(sq);

        if (sq.type === 'ladder' && sq.target) {
          heritageAudio.playBellChime();
          setGameMessage(
            `✨ Ladder Climbed! Virtue: ${sq.name} (${sq.hindi}) lifted you to square ${sq.target}!`
          );
          setTimeout(() => {
            setPlayerPos(sq.target!);
          }, 800);
        } else if (sq.type === 'snake' && sq.target) {
          heritageAudio.playSnakeHiss();
          setGameMessage(
            `🐍 Bitten by Vice! ${sq.name} (${sq.hindi}) dragged consciousness down to square ${sq.target}!`
          );
          setTimeout(() => {
            setPlayerPos(sq.target!);
          }, 800);
        } else if (sq.type === 'moksha') {
          heritageAudio.playBellChime();
          setGameWon('player');
          setGameMessage('🕉️ MOKSHA ATTAINED! You have transcended the cycle of birth and death!');
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } else {
          setGameMessage(`Moved ${roll} steps to ${sq.name} (${sq.hindi}).`);
        }
      }

      // Trigger Chanakya AI turn
      if (!gameWon && target !== 64) {
        setIsPlayerTurn(false);
        setTimeout(playChanakyaTurn, 1600);
      }
    } else {
      // Chanakya Move
      setChanakyaPos(target);
      if (sq) {
        if (sq.type === 'ladder' && sq.target) {
          setTimeout(() => setChanakyaPos(sq.target!), 600);
        } else if (sq.type === 'snake' && sq.target) {
          setTimeout(() => setChanakyaPos(sq.target!), 600);
        } else if (sq.type === 'moksha') {
          setGameWon('chanakya');
          setGameMessage('Chanakya attained Moksha first! Reflect upon your karma.');
        }
      }
      setIsPlayerTurn(true);
    }
  };

  const playChanakyaTurn = () => {
    if (gameWon) return;
    heritageAudio.playCowrieRollSound();
    const roll = Math.floor(Math.random() * 6) + 1;
    movePiece(chanakyaPos, roll, false);
  };

  const handleResetMoksha = () => {
    setPlayerPos(1);
    setChanakyaPos(1);
    setIsPlayerTurn(true);
    setGameWon(null);
    setGameMessage('A new pilgrimage begins at Janma (Square 1).');
    setActiveSquareNote(null);
  };

  // ==========================================
  // 2. CHAUPAR / PACHISI STATE
  // ==========================================
  const [chauparCowries, setChauparCowries] = useState<boolean[]>([true, true, false, true, false, true]);
  const [chauparScore, setChauparScore] = useState<number>(4);
  const [chauparRolling, setChauparRolling] = useState<boolean>(false);
  const [playerPawns, setPlayerPawns] = useState<number[]>([0, 0, 0, 0]); // 0 = at home, 1-84 track
  const [activePawnIndex, setActivePawnIndex] = useState<number>(0);

  const handleRollChaupar = () => {
    if (chauparRolling) return;
    setChauparRolling(true);
    heritageAudio.playCowrieRollSound();

    const rolled = Array.from({ length: 6 }, () => Math.random() > 0.5);
    setChauparCowries(rolled);

    // Calculate score based on traditional rules
    const mouthsUp = rolled.filter(Boolean).length;
    let score = mouthsUp;
    if (mouthsUp === 0) score = 25; // Pachisi!
    else if (mouthsUp === 1) score = 10;
    else if (mouthsUp === 6) score = 12;

    setChauparScore(score);

    setTimeout(() => {
      setChauparRolling(false);
      // Move active pawn
      setPlayerPawns((prev) => {
        const next = [...prev];
        next[activePawnIndex] = Math.min(68, next[activePawnIndex] + score);
        return next;
      });
      if (score === 25 || score === 12) {
        heritageAudio.playBellChime();
      }
    }, 500);
  };

  // ==========================================
  // 3. LIVE SANSKRITI CANVAS STATE
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [symmetryMode, setSymmetryMode] = useState<'8-fold' | '4-fold' | 'freehand'>('8-fold');
  const [showDotGrid, setShowDotGrid] = useState<boolean>(true);
  const [brushSize, setBrushSize] = useState<number>(3);
  const [selectedPigment, setSelectedPigment] = useState<string>('#FAF7EE'); // Chuna white default
  const [canvasBg, setCanvasBg] = useState<'terracotta' | 'khadi' | 'slate'>('terracotta');
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [selectedMotif, setSelectedMotif] = useState<string | null>(null);

  const PIGMENTS = [
    { name: 'Chuna White', hindi: 'चूना / चावल चूर्ण', hex: '#FAF7EE' },
    { name: 'Geru Red', hindi: 'गेरू (Red Ochre)', hex: '#B93826' },
    { name: 'Haldi Gold', hindi: 'हल्दी (Turmeric)', hex: '#E5A93B' },
    { name: 'Indigo Neel', hindi: 'नील (Indigo)', hex: '#1E3F66' },
    { name: 'Kajal Black', hindi: 'काजल (Lampblack)', hex: '#18181B' },
    { name: 'Peepal Green', hindi: 'हरा (Leaf Green)', hex: '#15803D' },
  ];

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI sizing
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    redrawBackground(ctx, rect.width, rect.height);
  }, [canvasBg, showDotGrid, activeTab]);

  const redrawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Fill background color
    if (canvasBg === 'terracotta') {
      ctx.fillStyle = '#8B3A2B';
    } else if (canvasBg === 'khadi') {
      ctx.fillStyle = '#F5EFE6';
    } else {
      ctx.fillStyle = '#1C1917';
    }
    ctx.fillRect(0, 0, width, height);

    // Optional Dot Grid (Pulli Kolam)
    if (showDotGrid) {
      const dotColor = canvasBg === 'khadi' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)';
      ctx.fillStyle = dotColor;
      const step = 40;
      for (let x = 40; x < width; x += step) {
        for (let y = 40; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history for undo
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev.slice(-10), imgData]);
    } catch (err) {
      // ignore
    }

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // If motif stamp selected, stamp it!
    if (selectedMotif) {
      stampMotif(ctx, x, y, selectedMotif);
      return;
    }

    setIsDrawing(true);
    drawStroke(x, y, true);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedMotif) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    drawStroke(x, y, false);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const drawStroke = (x: number, y: number, isStart: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / 2;
    const height = canvas.height / 2;
    const cx = width / 2;
    const cy = height / 2;

    const color = isEraser
      ? canvasBg === 'terracotta'
        ? '#8B3A2B'
        : canvasBg === 'khadi'
        ? '#F5EFE6'
        : '#1C1917'
      : selectedPigment;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (symmetryMode === 'freehand') {
      if (isStart) {
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    } else if (symmetryMode === '4-fold') {
      // 4-fold Cartesian symmetry
      const dx = x - cx;
      const dy = y - cy;
      const points = [
        [cx + dx, cy + dy],
        [cx - dx, cy + dy],
        [cx + dx, cy - dy],
        [cx - dx, cy - dy],
      ];
      points.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (symmetryMode === '8-fold') {
      // 8-fold radial mandala symmetry
      const dx = x - cx;
      const dy = y - cy;
      const points = [
        [cx + dx, cy + dy],
        [cx - dx, cy + dy],
        [cx + dx, cy - dy],
        [cx - dx, cy - dy],
        [cx + dy, cy + dx],
        [cx - dy, cy + dx],
        [cx + dy, cy - dx],
        [cx - dy, cy - dx],
      ];
      points.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  };

  const stampMotif = (ctx: CanvasRenderingContext2D, x: number, y: number, motif: string) => {
    heritageAudio.playStampSound();
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = selectedPigment;
    ctx.strokeStyle = selectedPigment;
    ctx.lineWidth = 2;

    if (motif === 'lotus') {
      // Draw stylized 8-petal sacred lotus
      for (let i = 0; i < 8; i++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.beginPath();
        ctx.ellipse(0, -18, 7, 18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (motif === 'diya') {
      // Draw clay lamp with flame
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI);
      ctx.fill();
      // Flame
      ctx.beginPath();
      ctx.ellipse(0, -12, 5, 12, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#E5A93B';
      ctx.fill();
    } else if (motif === 'peacock') {
      // Stylized Warli dancer
      ctx.beginPath();
      // Head
      ctx.arc(0, -22, 6, 0, Math.PI * 2);
      ctx.fill();
      // Hourglass body
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(12, 0);
      ctx.lineTo(-12, 0);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(12, 0);
      ctx.lineTo(-12, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    setSelectedMotif(null);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = history[history.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    redrawBackground(ctx, rect.width, rect.height);
  };

  const handleDownloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `aarambh-sanskriti-kolam-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-[#F7F4EB] text-stone-900 pb-20 selection:bg-amber-100">
      {/* HEADER SECTION */}
      <section className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Pracheen Khel & Sanskriti Canvas
                </span>
                <span className="text-xs font-mono text-stone-500 font-semibold">
                  Heritage Arcade & Folk Art Studio
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-royal text-stone-950">
                Ancient Indian Games & Sacred Art Canvas
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 max-w-2xl font-light">
                Experience authentic games played across ancient Indian temple courtyards and royal courts, alongside a live symmetrical Kolam and Rangoli drawing canvas with traditional mineral pigments.
              </p>
            </div>

            {/* Sub-Tab Navigation Switcher */}
            <div className="flex items-center p-1 bg-stone-100 rounded-2xl border border-stone-200 self-start md:self-auto">
              <button
                onClick={() => setActiveTab('moksha')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'moksha'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🐍</span>
                <span>Moksha Patam</span>
              </button>

              <button
                onClick={() => setActiveTab('chaupar')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'chaupar'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🐚</span>
                <span>Chaupar (Pachisi)</span>
              </button>

              <button
                onClick={() => setActiveTab('canvas')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'canvas'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🎨</span>
                <span>Live Canvas</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* =================================================================== */}
        {/* TAB 1: MOKSHA PATAM (ANCIENT VEDIC KARMA & VIRTUES BOARD GAME) */}
        {/* =================================================================== */}
        {activeTab === 'moksha' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: 8x8 MOKSHA BOARD (SPAN 8) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                    Sanskrit: मोक्ष पटम् • Ancestor of Snakes & Ladders
                  </span>
                  <h2 className="text-lg sm:text-xl font-black font-royal text-stone-900">
                    The 64 Squares of Karma, Virtues & Vices
                  </h2>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-stone-700">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-600 border border-amber-800 shadow-xs" />
                    <span>You (Sq {playerPos})</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-stone-500">
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-indigo-800 shadow-xs" />
                    <span>Chanakya AI (Sq {chanakyaPos})</span>
                  </div>
                </div>
              </div>

              {/* Game Message Alert Bar */}
              <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs font-semibold text-amber-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🪔</span>
                  <span>{gameMessage}</span>
                </div>
                <button
                  onClick={handleResetMoksha}
                  className="p-1.5 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                  title="Reset Game"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* THE 8x8 BOARD GRID */}
              <div className="grid grid-cols-8 gap-1 sm:gap-1.5 aspect-square bg-[#E6DEC8] p-2 sm:p-3 rounded-2xl border-2 border-[#C2B294] shadow-inner select-none">
                {MOKSHA_BOARD.map((sq) => {
                  const hasPlayer = playerPos === sq.num;
                  const hasChanakya = chanakyaPos === sq.num;

                  let bgColor = 'bg-[#FAF6EC] text-stone-800';
                  if (sq.type === 'ladder') bgColor = 'bg-emerald-50 text-emerald-950 border border-emerald-300';
                  if (sq.type === 'snake') bgColor = 'bg-red-50 text-red-950 border border-red-300';
                  if (sq.type === 'moksha') bgColor = 'bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 text-amber-950 font-black border-2 border-amber-600 shadow-md';

                  return (
                    <div
                      key={sq.num}
                      onClick={() => setActiveSquareNote(sq)}
                      className={`${bgColor} rounded-lg p-1 sm:p-1.5 flex flex-col justify-between items-center text-center relative overflow-hidden transition-transform hover:scale-105 cursor-pointer shadow-2xs`}
                    >
                      {/* Square Number */}
                      <div className="w-full flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold opacity-75">
                        <span>{sq.num}</span>
                        {sq.type === 'ladder' && <span className="text-[10px] text-emerald-700">🪜</span>}
                        {sq.type === 'snake' && <span className="text-[10px] text-red-700">🐍</span>}
                        {sq.type === 'moksha' && <span className="text-[10px] text-amber-900">🕉️</span>}
                      </div>

                      {/* Name & Concept */}
                      <div className="text-[7px] sm:text-[9px] font-bold font-royal leading-tight line-clamp-2 my-auto px-0.5">
                        {sq.hindi}
                      </div>

                      {/* Pawns Overlay */}
                      <div className="flex items-center gap-1 z-10">
                        {hasPlayer && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-600 border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-black animate-pulse">
                            Y
                          </div>
                        )}
                        {hasChanakya && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-indigo-600 border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-black">
                            C
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono px-2">
                <span>🪜 Ladders = Punya (Virtues that elevate)</span>
                <span>🐍 Snakes = Papa (Vices that pull you down)</span>
                <span>🕉️ Sq 64 = Moksha</span>
              </div>
            </div>

            {/* RIGHT: CONTROLS & PHILOSOPHICAL NOTE (SPAN 4) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* COWRIE ROLLER CARD */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-700">
                    Vedic Cowrie Shells • कौड़ी फेंकें
                  </span>
                  <h3 className="text-base font-bold font-royal text-stone-900">
                    Roll to Navigate Karma
                  </h3>
                </div>

                {/* The 6 Cowrie Shells Display */}
                <div className="flex items-center justify-center gap-2 py-2">
                  {cowries.map((isOpen, idx) => (
                    <div
                      key={idx}
                      className={`w-9 h-12 rounded-full border-2 transition-all flex items-center justify-center shadow-xs ${
                        diceRolling ? 'animate-spin' : ''
                      } ${
                        isOpen
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-stone-200 border-stone-400 text-stone-600'
                      }`}
                      title={isOpen ? 'Open (Face Up)' : 'Closed (Face Down)'}
                    >
                      {isOpen ? (
                        <div className="w-1.5 h-6 bg-amber-800 rounded-full" />
                      ) : (
                        <div className="w-4 h-6 rounded-full bg-stone-400/40" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-xs font-mono font-bold text-stone-600">
                  Last Throw: <span className="text-amber-800 text-base">{lastRoll}</span> Steps
                </div>

                <button
                  onClick={handleRollMoksha}
                  disabled={diceRolling || !isPlayerTurn || gameWon !== null}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 disabled:opacity-40 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Dice5 className="w-4 h-4 text-amber-200" />
                  <span>
                    {diceRolling
                      ? 'Rolling Sacred Cowries...'
                      : !isPlayerTurn
                      ? 'Chanakya AI is contemplating...'
                      : 'Roll Sacred Cowries (कौड़ी फेंकें)'}
                  </span>
                </button>
              </div>

              {/* CURRENT SQUARE PHILOSOPHICAL CARD */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="text-xs font-bold text-stone-500 uppercase font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Vedic Philosophical Wisdom</span>
                </div>

                {activeSquareNote ? (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold font-royal text-stone-900">
                        {activeSquareNote.num}. {activeSquareNote.hindi}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeSquareNote.type === 'ladder'
                            ? 'bg-emerald-100 text-emerald-800'
                            : activeSquareNote.type === 'snake'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {activeSquareNote.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-stone-700 font-sans">
                      {activeSquareNote.name}
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                      "{activeSquareNote.meaning}"
                    </p>
                    {activeSquareNote.target && (
                      <div className="text-xs font-mono font-bold text-amber-800">
                        → Leads to Square {activeSquareNote.target}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Click any square on the board or roll the cowries to read its spiritual meaning and historical context.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: CHAUPAR / PACHISI (IMPERIAL MAHABHARATA BOARD GAME) */}
        {/* =================================================================== */}
        {activeTab === 'chaupar' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-stone-200 shadow-xl space-y-5">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                    Royal Cross Board Game of Emperor Akbar & Mahabharata
                  </span>
                  <h2 className="text-xl font-bold font-royal text-stone-900">
                    Chaupar & Pachisi (चौपड़)
                  </h2>
                </div>
                <div className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Target: Char Koni (Center Home)
                </div>
              </div>

              {/* Cruciform Cloth Board Simulation */}
              <div className="relative aspect-square max-w-lg mx-auto bg-[#A8201A] p-4 rounded-3xl border-4 border-[#65100B] shadow-2xl flex items-center justify-center text-white">
                
                {/* Center Charkoni / Home */}
                <div className="w-28 h-28 bg-[#E5A93B] border-4 border-[#143642] rounded-2xl flex flex-col items-center justify-center p-2 text-center text-stone-950 font-royal font-black shadow-lg">
                  <div className="text-lg">🕉️</div>
                  <div className="text-xs tracking-wider">CHAR KONI</div>
                  <div className="text-[9px] font-mono font-bold">HOME</div>
                </div>

                {/* 4 Arms of Ashtapada Cross */}
                {/* North Arm */}
                <div className="absolute top-4 w-28 h-36 border-2 border-dashed border-amber-300/60 rounded-t-xl flex flex-col justify-around p-1 text-center text-[10px] font-mono font-bold">
                  <span>NORTH ARM</span>
                  <span className="text-base">⚔️</span>
                  <span>CASTLE</span>
                </div>
                {/* South Arm */}
                <div className="absolute bottom-4 w-28 h-36 border-2 border-dashed border-amber-300/60 rounded-b-xl flex flex-col justify-around p-1 text-center text-[10px] font-mono font-bold">
                  <span>START GATE</span>
                  <div className="flex justify-center gap-1">
                    {playerPawns.map((pos, i) => (
                      <div
                        key={i}
                        onClick={() => setActivePawnIndex(i)}
                        className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold cursor-pointer transition-transform ${
                          activePawnIndex === i ? 'bg-amber-400 text-stone-950 scale-125 ring-2 ring-white' : 'bg-stone-900'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <span>SOUTH ARM</span>
                </div>
                {/* East Arm */}
                <div className="absolute right-4 w-36 h-28 border-2 border-dashed border-amber-300/60 rounded-r-xl flex items-center justify-around p-1 text-center text-[9px] font-mono font-bold">
                  <span>EAST</span>
                  <span className="text-base">🏰</span>
                </div>
                {/* West Arm */}
                <div className="absolute left-4 w-36 h-28 border-2 border-dashed border-amber-300/60 rounded-l-xl flex items-center justify-around p-1 text-center text-[9px] font-mono font-bold">
                  <span className="text-base">🛡️</span>
                  <span>WEST</span>
                </div>
              </div>

              <div className="text-xs text-stone-600 text-center leading-relaxed">
                In classical Chaupar, players cast 6 Cowrie shells. If 0 shells land open, the player scores <strong>25 (Pachisi!)</strong>. Move your 4 pawns around the outer arms and into the central Char Koni!
              </div>
            </div>

            {/* RIGHT: CHAUPAR COWRIE CONTROLS */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4 text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-700">
                  Imperial Dice Throw
                </span>
                <h3 className="text-base font-bold font-royal text-stone-900">
                  Cast 6 Cowrie Shells
                </h3>
              </div>

              {/* Cowries Graphic */}
              <div className="flex items-center justify-center gap-2 py-3">
                {chauparCowries.map((isOpen, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-12 rounded-full border-2 transition-all flex items-center justify-center shadow-xs ${
                      chauparRolling ? 'animate-bounce' : ''
                    } ${
                      isOpen
                        ? 'bg-amber-50 border-amber-500 text-amber-900'
                        : 'bg-stone-200 border-stone-400 text-stone-600'
                    }`}
                  >
                    {isOpen ? <div className="w-1.5 h-6 bg-amber-800 rounded-full" /> : <div className="w-3 h-5 rounded-full bg-stone-400/50" />}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="text-[11px] font-mono font-bold text-stone-500">POINTS SCORED</div>
                <div className="text-2xl font-black font-royal text-amber-900">
                  {chauparScore} Points
                </div>
                {chauparScore === 25 && (
                  <div className="text-xs font-bold text-emerald-700 mt-0.5">★ PACHISI ROLL! BONUS MOVE ★</div>
                )}
              </div>

              <div className="text-left space-y-1 text-xs">
                <div className="font-bold text-stone-700">Select Pawn to Advance:</div>
                <div className="grid grid-cols-4 gap-2">
                  {playerPawns.map((pos, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePawnIndex(idx)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        activePawnIndex === idx
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <div className="text-[10px]">Pawn {idx + 1}</div>
                      <div className="text-xs font-mono font-bold">{pos}/68</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRollChaupar}
                disabled={chauparRolling}
                className="w-full py-3.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dice5 className="w-4 h-4 text-amber-200" />
                <span>{chauparRolling ? 'Rolling...' : 'Throw 6 Cowries (कौड़ी फेंकें)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: LIVE SANSKRITI CANVAS (KOLAM, RANGOLI & SACRED MANDALAS) */}
        {/* =================================================================== */}
        {activeTab === 'canvas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: THE INTERACTIVE CANVAS (SPAN 8) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                    जीवंत रंगोली एवं कोलम कैनवास
                  </span>
                  <h2 className="text-xl font-bold font-royal text-stone-900">
                    Sacred Symmetrical Heritage Art Studio
                  </h2>
                </div>

                {/* Undo, Clear, Download Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndo}
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Undo Stroke"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>

                  <button
                    onClick={handleClearCanvas}
                    className="p-2 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Clear Canvas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>

                  <button
                    onClick={handleDownloadCanvas}
                    className="px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Artwork</span>
                  </button>
                </div>
              </div>

              {/* THE HTML5 CANVAS ELEMENT */}
              <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-inner border-4 border-stone-300 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawMove}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full block touch-none"
                />

                {/* Subtitle helper in corner */}
                <div className="absolute bottom-2 left-2 bg-black/85 border border-white/20 text-white/95 px-3 py-1 rounded-lg text-[10px] font-mono pointer-events-none shadow-md">
                  Mode: {symmetryMode.toUpperCase()} • Drag cursor to draw
                </div>
              </div>

              <div className="text-[11px] text-stone-500 font-mono text-center">
                ✨ Tip: In 8-Fold Mandala mode, a single stroke paints an intricate 8-pointed Rangoli automatically!
              </div>
            </div>

            {/* RIGHT: PALETTE, SYMMETRY & STAMP CONTROLS (SPAN 4) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* SYMMETRY MODES */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="text-xs font-bold text-stone-700 uppercase font-mono">
                  Sacred Geometry Symmetry
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '8-fold', label: '8-Fold Radial', icon: '☸️' },
                    { id: '4-fold', label: '4-Fold Square', icon: '🪟' },
                    { id: 'freehand', label: 'Freehand Folk', icon: '🖌️' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setSymmetryMode(mode.id as any);
                        setIsEraser(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        symmetryMode === mode.id
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <div className="text-lg">{mode.icon}</div>
                      <div className="text-[10px] mt-0.5 leading-tight">{mode.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-xs font-semibold text-stone-700">Pulli Kolam Dot Grid:</span>
                  <button
                    onClick={() => setShowDotGrid(!showDotGrid)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      showDotGrid ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {showDotGrid ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>

              {/* TRADITIONAL MINERAL PIGMENTS */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="text-xs font-bold text-stone-700 uppercase font-mono">
                  Traditional Mineral Pigments
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PIGMENTS.map((pigment) => (
                    <button
                      key={pigment.hex}
                      onClick={() => {
                        setSelectedPigment(pigment.hex);
                        setIsEraser(false);
                        setSelectedMotif(null);
                      }}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                        selectedPigment === pigment.hex && !isEraser
                          ? 'ring-2 ring-amber-500 bg-stone-50 font-bold'
                          : 'bg-stone-50/60 border-stone-200'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-stone-300 shadow-xs shrink-0"
                        style={{ backgroundColor: pigment.hex }}
                      />
                      <div className="text-left leading-tight truncate">
                        <div className="text-[11px] text-stone-900 font-bold truncate">{pigment.name}</div>
                        <div className="text-[9px] text-stone-500 truncate">{pigment.hindi}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Brush Size Slider */}
                <div className="space-y-1 pt-2 border-t border-stone-100">
                  <div className="flex justify-between text-xs font-semibold text-stone-700">
                    <span>Brush Thickness:</span>
                    <span className="font-mono">{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-amber-700 cursor-pointer"
                  />
                </div>

                {/* Eraser Toggle */}
                <button
                  onClick={() => setIsEraser(!isEraser)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isEraser
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>{isEraser ? 'Eraser Active' : 'Switch to Eraser'}</span>
                </button>
              </div>

              {/* MOTIF STAMP BRUSHES */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
                <div className="text-xs font-bold text-stone-700 uppercase font-mono">
                  Traditional Folk Stamps
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lotus', label: 'Padma (Lotus)', icon: '🪷' },
                    { id: 'diya', label: 'Deepak (Lamp)', icon: '🪔' },
                    { id: 'peacock', label: 'Warli Dancer', icon: '💃' },
                  ].map((motif) => (
                    <button
                      key={motif.id}
                      onClick={() => setSelectedMotif(motif.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedMotif === motif.id
                          ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                          : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      <div className="text-lg">{motif.icon}</div>
                      <div className="text-[9px] mt-0.5 leading-tight">{motif.label}</div>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-stone-500">
                  Select a motif, then tap anywhere on the canvas to place it!
                </div>
              </div>

              {/* CANVAS BACKGROUND TEXTURE */}
              <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm space-y-2">
                <div className="text-xs font-bold text-stone-700 uppercase font-mono">
                  Base Surface
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'terracotta', label: 'Terracotta' },
                    { id: 'khadi', label: 'Khadi Paper' },
                    { id: 'slate', label: 'Temple Slate' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setCanvasBg(bg.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        canvasBg === bg.id
                          ? 'bg-stone-900 text-white font-bold'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
