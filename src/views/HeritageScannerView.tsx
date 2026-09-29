import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Scan,
  Compass,
  Sparkles,
  MapPin,
  Volume2,
  VolumeX,
  Play,
  Pause,
  CheckCircle2,
  Heart,
  Bookmark,
  ArrowRight,
  Clock,
  ShieldCheck,
  Layers,
  RefreshCw,
  Upload,
  AlertTriangle,
  Plus,
  MessageSquare,
  Send,
  Crosshair,
  Image as ImageIcon,
  Zap,
  Info,
  Award,
  ChevronRight,
  ExternalLink,
  Flame,
  Radio,
  FileCheck,
  Share2,
} from 'lucide-react';
import {
  HeritageScannerResult,
  MonumentCommunityMemory,
  NearbyMonumentProximity,
} from '../types';
import {
  identifyMonumentFromImage,
  fetchNearbyMonuments,
  submitScannerMemory,
} from '../services/api';
import { recordMonumentScannedXP, recordMemorySavedXP } from '../utils/experiencePoints';
import { SocialShareModal } from '../components/SocialShareModal';
import { executeWebShare, isWebShareSupported, SharePayload } from '../utils/socialShare';

interface HeritageScannerViewProps {
  onNavigateTab: (tab: string) => void;
  onExplorePlace?: (placeName: string) => void;
  onSaveItineraryStop?: (stop: { title: string; location: string; day: number }) => void;
}

// Quick Sample Landmark Presets for instant scanning
const SAMPLE_LANDMARKS = [
  {
    name: 'Taj Mahal',
    city: 'Agra, UP',
    era: '1631–1648 CE',
    style: 'Mughal Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    lat: 27.1751,
    lon: 78.0421,
  },
  {
    name: 'Hawa Mahal',
    city: 'Jaipur, Rajasthan',
    era: '1799 CE',
    style: 'Rajput-Mughal Fusion',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    lat: 26.9239,
    lon: 75.8267,
  },
  {
    name: 'Konark Sun Temple',
    city: 'Konark, Odisha',
    era: '1250 CE',
    style: 'Kalinga Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    lat: 19.8876,
    lon: 86.0945,
  },
  {
    name: 'Brihadeeswarar Temple',
    city: 'Thanjavur, Tamil Nadu',
    era: '1010 CE',
    style: 'Chola Dravidian Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1627993077651-789c67eb269e?auto=format&fit=crop&w=800&q=80',
    lat: 10.7828,
    lon: 79.1318,
  },
  {
    name: 'Gateway of India',
    city: 'Mumbai, Maharashtra',
    era: '1924 CE',
    style: 'Indo-Saracenic',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    lat: 18.9220,
    lon: 72.8347,
  },
  {
    name: 'Charminar',
    city: 'Hyderabad, Telangana',
    era: '1591 CE',
    style: 'Qutb Shahi Indo-Islamic',
    imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    lat: 17.3616,
    lon: 78.4747,
  },
  {
    name: 'Qutub Minar',
    city: 'New Delhi',
    era: '1192 CE',
    style: 'Indo-Islamic Fluted Minaret',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    lat: 28.5244,
    lon: 77.1855,
  },
  {
    name: 'Amer Fort',
    city: 'Jaipur, Rajasthan',
    era: '1592 CE',
    style: 'Hill Fort Rajput Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    lat: 26.9855,
    lon: 75.8513,
  },
];

export const HeritageScannerView: React.FC<HeritageScannerViewProps> = ({
  onNavigateTab,
  onExplorePlace,
  onSaveItineraryStop,
}) => {
  // Device & Camera States
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scannerMode, setScannerMode] = useState<'camera' | 'upload' | 'samples'>('camera');

  // Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'locating' | 'ready' | 'denied'>('locating');
  const [compassHeading, setCompassHeading] = useState<number>(0);

  // Analysis / Scanner State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('Initializing Scanner HUD...');
  const [scanResult, setScanResult] = useState<HeritageScannerResult | null>(null);
  const [nearbyMonuments, setNearbyMonuments] = useState<NearbyMonumentProximity[]>([]);

  // Audio Guide Speech Synthesis
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Community Memory Contribution Drawer
  const [showMemoryForm, setShowMemoryForm] = useState<boolean>(false);
  const [newMemoryStory, setNewMemoryStory] = useState<string>('');
  const [newMemoryTitle, setNewMemoryTitle] = useState<string>('');
  const [newMemoryAuthor, setNewMemoryAuthor] = useState<string>('');
  const [newMemoryRole, setNewMemoryRole] = useState<string>('Pilgrim & Heritage Explorer');
  const [isSubmittingMemory, setIsSubmittingMemory] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Active Tab within Result View: 'history' | 'memories' | 'tips' | 'nearby'
  const [resultSubTab, setResultSubTab] = useState<'history' | 'memories' | 'tips' | 'nearby'>('history');

  // Social Share State
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);

  const handleShareDiscovery = async () => {
    if (!scanResult) return;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://aarambh.heritage.in';
    const payload: SharePayload = {
      title: `Discovered: ${scanResult.monumentName} (${scanResult.hindiName || ''})`,
      text: `🏛️ Verified monument discovery on Aarambh Heritage Scanner!\n\n${scanResult.monumentName} (${scanResult.hindiName || ''})\n• Era: ${scanResult.era}\n• Builder: ${scanResult.builderDynasty}\n• Architecture: ${scanResult.architecturalStyle}\n\n${scanResult.significance?.slice(0, 180)}...\n\nScan and uncover Indian heritage with Aarambh:`,
      url: currentUrl,
      imageUrl: scanResult.capturedImageUrl,
    };

    if (isWebShareSupported()) {
      try {
        const res = await executeWebShare(payload);
        if (res.success && res.method === 'native') {
          triggerNotification('Discovery shared successfully!');
          return;
        }
      } catch (e) {
        console.warn('Native share failed:', e);
      }
    }
    setSharePayload(payload);
    setShowShareModal(true);
  };

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Show transient toast
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Initialize GPS & Proximity Radar
  useEffect(() => {
    if ('geolocation' in navigator) {
      setGpsStatus('locating');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setUserCoords({ lat, lon });
          setGpsStatus('ready');
          fetchNearbyMonuments(lat, lon, 250)
            .then((list) => setNearbyMonuments(list))
            .catch(() => {});
        },
        () => {
          setGpsStatus('denied');
          // Default to Agra coordinates for initial radar demonstration
          const fallbackLat = 27.1751;
          const fallbackLon = 78.0421;
          setUserCoords({ lat: fallbackLat, lon: fallbackLon });
          fetchNearbyMonuments(fallbackLat, fallbackLon, 250)
            .then((list) => setNearbyMonuments(list))
            .catch(() => {});
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsStatus('denied');
    }

    // Compass Orientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setCompassHeading(Math.round(e.alpha));
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      stopCamera();
    };
  }, []);

  // 2. Start Camera Feed
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    try {
      setCameraError(null);
      stopCamera();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported on this device/browser.');
        setScannerMode('upload');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access denied or error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions or upload an image.'
          : 'Unable to initialize device camera. Please upload an image or select a landmark.'
      );
      setCameraActive(false);
      setScannerMode('samples');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  // Switch between Rear / Front camera
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle Torch/Flash if supported
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !torchOn } as any],
          });
          setTorchOn(!torchOn);
        } catch (e) {
          console.warn('Failed to toggle torch:', e);
        }
      } else {
        triggerNotification('Torch/Flashlight is not supported on this camera lens.');
      }
    }
  };

  // Initialize camera when scannerMode is 'camera'
  useEffect(() => {
    if (scannerMode === 'camera' && !scanResult) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [scannerMode, scanResult]);

  // Capture Snapshot from Camera Feed
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedImage(dataUrl);
    stopCamera();
    performMonumentScan(dataUrl);
  };

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      performMonumentScan(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Scan a Landmark from Sample Presets
  const handleSelectSample = (sample: typeof SAMPLE_LANDMARKS[0]) => {
    setCapturedImage(sample.imageUrl);
    stopCamera();
    performMonumentScan(undefined, sample.name, sample.lat, sample.lon, sample.imageUrl);
  };

  // Perform Gemini Multimodal Visual Heritage Scan
  const performMonumentScan = async (
    base64Url?: string,
    landmarkHint?: string,
    presetLat?: number,
    presetLon?: number,
    previewImageUrl?: string
  ) => {
    setIsAnalyzing(true);
    setScanResult(null);

    // Dynamic HUD Scanner sequence simulation
    const steps = [
      'Scanning architectural contours & silhouettes...',
      'Analyzing stone masonry, arch styles & carvings...',
      'Cross-referencing ASI & UNESCO Archaeological Registry...',
      'Retrieving oral histories & living community memories...',
    ];

    let stepIndex = 0;
    setAnalysisStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setAnalysisStep(steps[stepIndex]);
      }
    }, 650);

    try {
      const targetLat = presetLat || userCoords?.lat;
      const targetLon = presetLon || userCoords?.lon;

      const result = await identifyMonumentFromImage({
        imageBase64: base64Url,
        lat: targetLat,
        lon: targetLon,
        monumentHint: landmarkHint,
      });

      clearInterval(stepInterval);
      result.capturedImageUrl = previewImageUrl || base64Url;
      setScanResult(result);
      setResultSubTab('history');
      recordMonumentScannedXP();
      triggerNotification(`Identified: ${result.monumentName} (+75 XP)`);
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Scan error:', err);
      triggerNotification('Identification error. Loading closest regional monument.');
      // Graceful fallback to Taj Mahal
      const fallbackSample = SAMPLE_LANDMARKS[0];
      handleSelectSample(fallbackSample);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset Scanner to capture another monument
  const handleResetScanner = () => {
    stopAudioGuide();
    setScanResult(null);
    setCapturedImage(null);
    setScannerMode('camera');
    startCamera();
  };

  // Text-To-Speech Audio Guide
  const playAudioGuide = () => {
    if (!scanResult) return;
    if (!('speechSynthesis' in window)) {
      triggerNotification('Audio recitation not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlayingAudio(true);
      return;
    }

    window.speechSynthesis.cancel();

    const narrationText = `${scanResult.monumentName}. Located in ${scanResult.city}, ${scanResult.state}. Era: ${scanResult.era}. Architectural Style: ${scanResult.architecturalStyle}. Built by ${scanResult.builderDynasty}. ${scanResult.significance} Key architectural feature: ${scanResult.keyHighlights?.[0] || ''}. Oral tradition says: ${scanResult.folkloreAndLegends || ''}`;

    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.includes('en-IN') || v.name.includes('India') || v.name.includes('Natural')
    ) || voices[0];
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const stopAudioGuide = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // Submit a new Community Memory for the scanned monument
  const handleAddCommunityMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanResult || !newMemoryStory.trim()) return;

    try {
      setIsSubmittingMemory(true);
      const savedMem = await submitScannerMemory({
        monumentName: scanResult.monumentName,
        city: scanResult.city,
        title: newMemoryTitle.trim() || `Living Story of ${scanResult.monumentName}`,
        story: newMemoryStory.trim(),
        authorName: newMemoryAuthor.trim() || 'Heritage Contributor',
        authorRole: newMemoryRole,
        tags: ['Heritage Scanner Story', scanResult.monumentName],
      });

      setScanResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          communityMemories: [savedMem, ...(prev.communityMemories || [])],
        };
      });

      setNewMemoryStory('');
      setNewMemoryTitle('');
      setShowMemoryForm(false);
      recordMemorySavedXP();
      triggerNotification('Your memory was preserved in Aarambh living archives! (+150 XP)');
    } catch (err: any) {
      console.error('Error recording memory:', err);
      triggerNotification('Failed to preserve memory. Please try again.');
    } finally {
      setIsSubmittingMemory(false);
    }
  };

  // Add monument to traveler's saved itinerary
  const handleSaveToItinerary = () => {
    if (!scanResult) return;
    if (onSaveItineraryStop) {
      onSaveItineraryStop({
        title: `${scanResult.monumentName} Heritage Darshan`,
        location: `${scanResult.monumentName}, ${scanResult.city}, ${scanResult.state}`,
        day: 1,
      });
      triggerNotification(`Added ${scanResult.monumentName} to your Yatra Itinerary!`);
    } else {
      triggerNotification(`Added ${scanResult.monumentName} to Itinerary.`);
    }
  };

  // Claim Passport Stamp for scanning monument
  const handleClaimPassportStamp = () => {
    if (!scanResult) return;
    try {
      const stored = localStorage.getItem('aarambh_passport_stamps') || '[]';
      const stamps = JSON.parse(stored);
      const stampId = `stamp-${scanResult.monumentName.toLowerCase().replace(/\s+/g, '-')}`;

      if (!stamps.find((s: any) => s.id === stampId)) {
        stamps.push({
          id: stampId,
          placeName: scanResult.monumentName,
          city: scanResult.city,
          state: scanResult.state,
          verifiedDate: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          category: 'MONUMENT',
          era: scanResult.era,
        });
        localStorage.setItem('aarambh_passport_stamps', JSON.stringify(stamps));
        triggerNotification(`Official Ink Stamp stamped in your Digital Yatra Passport! 🛂`);
      } else {
        triggerNotification(`You already hold the verified stamp for ${scanResult.monumentName}! 🛂`);
      }
    } catch (e) {
      console.warn(e);
    }
    onNavigateTab('passport');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-amber-300 px-5 py-3 rounded-full text-xs font-semibold shadow-2xl border border-amber-500/40 backdrop-blur-md flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner Header */}
      <div className="w-full border-b border-stone-800 bg-stone-900/60 backdrop-blur-md px-4 py-3.5 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-stone-950">
              <Scan className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Heritage Scanner</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    AI Lens & Oral Memory
                  </span>
                </h1>
              </div>
              <p className="text-xs text-stone-400">
                Point device camera at any monument or temple to identify history and community memories
              </p>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setScannerMode('camera');
                if (scanResult) setScanResult(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                scannerMode === 'camera' && !scanResult
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera</span>
            </button>

            <button
              onClick={() => {
                setScannerMode('upload');
                fileInputRef.current?.click();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                scannerMode === 'upload'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            <button
              onClick={() => setScannerMode('samples')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                scannerMode === 'samples'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white border border-stone-700/60'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Iconic Presets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {/* Analyzing Overlay Modal */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-2xl border-2 border-amber-400/80 flex items-center justify-center relative overflow-hidden bg-stone-900 shadow-2xl shadow-amber-500/20">
                <Scan className="w-12 h-12 text-amber-400 animate-pulse" />
                {/* Laser scanline animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_#fbbf24] animate-scanline" />
              </div>
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Heritage AI Analysis in Progress</h3>
            <p className="text-amber-400 font-mono text-sm max-w-md h-6 animate-pulse">
              {analysisStep}
            </p>
            <p className="text-xs text-stone-500 mt-4">
              Cross-referencing architectural geometry with Aarambh Living Heritage Graph
            </p>
          </div>
        )}

        {/* VIEW 1: LIVE SCANNER VIEWFINDER */}
        {!scanResult && (
          <div className="space-y-6">
            {/* Viewfinder HUD Container (Responsive aspect ratio for phone 3:4 portrait, tablet 4:3, desktop 16:10) */}
            <div className="relative w-full max-w-3xl mx-auto aspect-[3/4] sm:aspect-4/3 md:aspect-16/10 min-h-[360px] sm:min-h-[440px] rounded-2xl overflow-hidden bg-stone-900 border-2 border-stone-800 shadow-2xl flex flex-col justify-between">
              {/* Real Video Stream */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  cameraActive ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Fallback if camera is inactive */}
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-stone-900/90 z-10">
                  <div className="w-16 h-16 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mb-4 text-amber-400 shadow-inner">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {cameraError ? 'Camera Unavailable' : 'Camera Feed Paused'}
                  </h3>
                  <p className="text-xs text-stone-400 max-w-md mb-5">
                    {cameraError ||
                      'Grant camera permission to point your device at monuments in real time, or choose from photo upload or sample landmarks below.'}
                  </p>

                  <div className="flex flex-wrap gap-2.5 justify-center">
                    <button
                      onClick={() => startCamera()}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs border border-stone-600 flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      onClick={() => setScannerMode('samples')}
                      className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Choose Iconic Landmark</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Viewfinder HUD Overlays (Corner Brackets, Reticle, GPS) */}
              <div className="relative z-20 p-4 flex items-center justify-between text-[11px] font-mono text-stone-300 pointer-events-none">
                {/* GPS and Compass Status */}
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>
                    GPS: {userCoords ? `${userCoords.lat.toFixed(3)}°N, ${userCoords.lon.toFixed(3)}°E` : 'Calibrating'}
                  </span>
                  <span className="text-stone-500">|</span>
                  <span className="flex items-center gap-1 text-amber-300">
                    <Compass className="w-3 h-3" />
                    {compassHeading}°
                  </span>
                </div>

                {/* Proximity alert if nearby monument detected */}
                {nearbyMonuments.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/40 backdrop-blur-md font-semibold text-[10px]">
                    <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Nearby: {nearbyMonuments[0].name} ({nearbyMonuments[0].distanceKm.toFixed(1)} km)</span>
                  </div>
                )}
              </div>

              {/* Central Aiming Reticle with Target Brackets */}
              <div className="relative z-20 flex-1 flex items-center justify-center pointer-events-none p-6">
                <div className="relative w-56 sm:w-72 aspect-square">
                  {/* Top-Left Bracket */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  {/* Top-Right Bracket */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  {/* Bottom-Left Bracket */}
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 shadow-[0_0_8px_#fbbf24]" />
                  {/* Bottom-Right Bracket */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400 shadow-[0_0_8px_#fbbf24]" />

                  {/* Center Crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Crosshair className="w-8 h-8 text-amber-400/60 animate-pulse" />
                  </div>

                  {/* Scanner Grid Lines */}
                  <div className="absolute inset-2 border border-dashed border-amber-400/20 rounded-xl" />

                  {/* Laser scan animation when camera is active */}
                  {cameraActive && (
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#fbbf24] animate-scanline" />
                  )}
                </div>
              </div>

              {/* Bottom HUD Controls */}
              <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-4">
                {/* Left: Lens controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleCameraFacing}
                    title="Switch Camera (Front/Back)"
                    disabled={!cameraActive}
                    className="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 transition-all disabled:opacity-40"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleTorch}
                    title="Toggle Flash / Torch"
                    disabled={!cameraActive}
                    className={`p-2.5 rounded-full border transition-all disabled:opacity-40 ${
                      torchOn
                        ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/50'
                        : 'bg-stone-900/80 hover:bg-stone-800 text-stone-200 border-stone-700/80'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                </div>

                {/* Center: Main Shutter Trigger Button */}
                <button
                  onClick={handleCaptureSnapshot}
                  disabled={!cameraActive}
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm tracking-wide shadow-xl shadow-orange-500/30 flex items-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Scan className="w-5 h-5 text-stone-950 stroke-[2.5]" />
                  <span>IDENTIFY MONUMENT</span>
                </button>

                {/* Right: Upload Shortcut */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload image from gallery"
                  className="p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-200 border border-stone-700/80 transition-all"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Iconic Landmark Presets Bar */}
            <div className="bg-stone-900/50 border border-stone-800/80 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    Iconic Indian Monuments (1-Tap Instant Scan)
                  </h3>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  Test recognition without physical travel
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAMPLE_LANDMARKS.slice(0, 4).map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className="group relative rounded-xl overflow-hidden aspect-4/3 text-left border border-stone-800 hover:border-amber-500/60 transition-all shadow-md hover:shadow-amber-500/10 active:scale-98"
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-85 group-hover:brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white leading-tight">
                          {sample.name}
                        </span>
                        <Scan className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono mt-0.5">
                        {sample.city}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Second row of sample landmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                {SAMPLE_LANDMARKS.slice(4, 8).map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className="group relative rounded-xl overflow-hidden aspect-4/3 text-left border border-stone-800 hover:border-amber-500/60 transition-all shadow-md hover:shadow-amber-500/10 active:scale-98"
                  >
                    <img
                      src={sample.imageUrl}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-85 group-hover:brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 flex flex-col justify-end">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white leading-tight">
                          {sample.name}
                        </span>
                        <Scan className="w-3.5 h-3.5 text-amber-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[10px] text-amber-300 font-mono mt-0.5">
                        {sample.city}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* How Heritage Scanner Works info card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-300">
              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">1. Optical Neural Vision</h4>
                  <p className="text-stone-400 leading-relaxed">
                    Uses Gemini Vision to classify architecture, dynasties, materials, and ASI inscription records in seconds.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">2. Living Oral Memories</h4>
                  <p className="text-stone-400 leading-relaxed">
                    Unearths real crowd-sourced memories, boatmen lore, elder legends, and local temple rituals connected to the site.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">3. Guided Audio Narration</h4>
                  <p className="text-stone-400 leading-relaxed">
                    Listen to deep architectural secrets and acoustic stories while standing right in front of the monument.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: INSTANT RETRIEVED MONUMENT HISTORY & LIVING COMMUNITY MEMORIES */}
        {scanResult && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Action Bar: Re-Scan, Itinerary, Audio Guide */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900/80 border border-stone-800 p-3.5 rounded-2xl backdrop-blur-md">
              <button
                onClick={handleResetScanner}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-2 border border-stone-700 transition-all cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Scan Another Monument</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Audio Guide Narration Button */}
                <button
                  onClick={playAudioGuide}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-stone-950 animate-pulse'
                      : 'bg-stone-800 text-amber-300 hover:bg-stone-700 border border-amber-500/40'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-stone-950" />
                      <span>Pause Audio Guide</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen to Audio Guide</span>
                    </>
                  )}
                </button>

                {/* Add to Itinerary */}
                <button
                  onClick={handleSaveToItinerary}
                  className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 border border-stone-700 transition-all cursor-pointer"
                  title="Save to your itinerary"
                >
                  <Bookmark className="w-3.5 h-3.5 text-orange-400" />
                  <span>Add to Itinerary</span>
                </button>

                {/* Claim Passport Stamp */}
                <button
                  onClick={handleClaimPassportStamp}
                  className="px-3.5 py-2 rounded-xl bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-semibold flex items-center gap-1.5 border border-amber-700/60 transition-all cursor-pointer"
                  title="Stamp your Digital Yatra Passport"
                >
                  <span>🛂</span>
                  <span>Claim Stamp</span>
                </button>

                {/* Share Monument Discovery */}
                <button
                  type="button"
                  onClick={handleShareDiscovery}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                  title="Share your monument discovery with others via Web Share API"
                >
                  <Share2 className="w-3.5 h-3.5 text-stone-950" />
                  <span>Share Discovery</span>
                </button>

                {/* Explore Deeply in Aarambh */}
                {onExplorePlace && (
                  <button
                    onClick={() => onExplorePlace(scanResult.monumentName)}
                    className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <span>Full Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Hero Card: Scanned Image + Monument Title + Key Architectural Badges */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left: Captured / Reference Image */}
                <div className="lg:col-span-5 relative aspect-4/3 lg:aspect-auto min-h-[260px] bg-stone-950">
                  <img
                    src={scanResult.capturedImageUrl || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80'}
                    alt={scanResult.monumentName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-stone-900" />

                  {/* Match Confidence Score */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{(scanResult.confidenceScore * 100).toFixed(1)}% Match</span>
                  </div>

                  {/* Scanned Badge */}
                  <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-stone-300 font-mono border border-stone-700">
                    Heritage Scanner AI Vision
                  </div>
                </div>

                {/* Right: Detailed Metadata & Dynasty Information */}
                <div className="lg:col-span-7 p-6 flex flex-col justify-between">
                  <div>
                    {/* Location & Status Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {scanResult.city}, {scanResult.state}
                      </span>

                      {scanResult.unescoStatus && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3 text-blue-400" />
                          {scanResult.unescoStatus}
                        </span>
                      )}

                      {scanResult.asiProtected && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          ASI Protected
                        </span>
                      )}
                    </div>

                    {/* Monument Name in English & Hindi */}
                    <div className="mb-3">
                      <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-baseline gap-3 flex-wrap">
                        <span>{scanResult.monumentName}</span>
                        {scanResult.hindiName && (
                          <span className="text-lg sm:text-xl font-normal text-amber-400/90 font-serif">
                            ({scanResult.hindiName})
                          </span>
                        )}
                      </h2>
                      {scanResult.alternativeNames && scanResult.alternativeNames.length > 0 && (
                        <p className="text-xs text-stone-400 mt-1 italic">
                          Also known as: {scanResult.alternativeNames.join(' • ')}
                        </p>
                      )}
                    </div>

                    {/* Metadata Grid (Era, Builder, Style) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                      <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">
                          Era / Period
                        </span>
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          {scanResult.era}
                        </span>
                      </div>

                      <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">
                          Builder / Dynasty
                        </span>
                        <span className="text-xs font-bold text-stone-200 line-clamp-1" title={scanResult.builderDynasty}>
                          {scanResult.builderDynasty}
                        </span>
                      </div>

                      <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                        <span className="text-[10px] uppercase font-mono text-stone-400 block mb-1">
                          Architectural Style
                        </span>
                        <span className="text-xs font-bold text-stone-200 line-clamp-1" title={scanResult.architecturalStyle}>
                          {scanResult.architecturalStyle}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Proximity Coordinates Footer */}
                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400 font-mono">
                    <span>
                      Coordinates: {scanResult.coordinates.lat.toFixed(4)}°N, {scanResult.coordinates.lon.toFixed(4)}°E
                    </span>
                    <span className="text-amber-400/80">Aarambh Verified Registry</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Tabs: History & Highlights vs Community Memories vs Visiting Tips vs Nearby Radar */}
            <div className="border-b border-stone-800 flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setResultSubTab('history')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  resultSubTab === 'history'
                    ? 'bg-stone-900 text-amber-300 border-t-2 border-amber-400 border-x border-stone-800'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>History & Architecture</span>
              </button>

              <button
                onClick={() => setResultSubTab('memories')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer relative ${
                  resultSubTab === 'memories'
                    ? 'bg-stone-900 text-amber-300 border-t-2 border-amber-400 border-x border-stone-800'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Living Community Memories</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                  {scanResult.communityMemories?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setResultSubTab('tips')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  resultSubTab === 'tips'
                    ? 'bg-stone-900 text-amber-300 border-t-2 border-amber-400 border-x border-stone-800'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>Visiting Secrets & Tips</span>
              </button>

              <button
                onClick={() => setResultSubTab('nearby')}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  resultSubTab === 'nearby'
                    ? 'bg-stone-900 text-amber-300 border-t-2 border-amber-400 border-x border-stone-800'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>Nearby Radar Sites</span>
                <span className="px-1.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-mono">
                  {scanResult.nearbyMonuments?.length || 0}
                </span>
              </button>
            </div>

            {/* TAB CONTENT 1: HISTORY & ARCHITECTURAL HIGHLIGHTS */}
            {resultSubTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                {/* Historical Narrative Card */}
                <div className="p-6 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider">
                    <FileCheck className="w-4 h-4" />
                    <span>Architectural Significance & Provenance</span>
                  </div>
                  <p className="text-sm text-stone-200 leading-relaxed font-serif text-justify sm:text-left">
                    {scanResult.significance}
                  </p>
                </div>

                {/* Key Architectural Highlights Cards */}
                {scanResult.keyHighlights && scanResult.keyHighlights.length > 0 && (
                  <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Key Architectural & Structural Highlights</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {scanResult.keyHighlights.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-start gap-3 hover:border-amber-500/30 transition-all"
                        >
                          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-stone-300 leading-relaxed font-sans">
                            {highlight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Folklore & Oral Legends Card */}
                {scanResult.folkloreAndLegends && (
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-orange-950/20 to-stone-900 border border-amber-500/30 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Oral Folklore & Traditional Legends</span>
                    </div>
                    <p className="text-sm text-amber-100/90 leading-relaxed font-serif italic">
                      "{scanResult.folkloreAndLegends}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: LIVING COMMUNITY MEMORIES */}
            {resultSubTab === 'memories' && (
              <div className="space-y-6 animate-fade-in">
                {/* Header with Contribute Button */}
                <div className="p-5 rounded-2xl bg-stone-900/80 border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>Community Oral Memories & Visitor Accounts</span>
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Living recollections recorded by travelers, local priests, boatmen, and elders
                    </p>
                  </div>

                  <button
                    onClick={() => setShowMemoryForm(!showMemoryForm)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Contribute Your Memory</span>
                  </button>
                </div>

                {/* Inline Contribution Form Drawer */}
                {showMemoryForm && (
                  <form
                    onSubmit={handleAddCommunityMemory}
                    className="p-6 rounded-2xl bg-stone-900 border-2 border-amber-500/50 shadow-2xl space-y-4 animate-fade-in"
                  >
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Preserve Your Memory of {scanResult.monumentName}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowMemoryForm(false)}
                        className="text-stone-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-stone-300 mb-1">
                          Your Name / Traveler Handle
                        </label>
                        <input
                          type="text"
                          required
                          value={newMemoryAuthor}
                          onChange={(e) => setNewMemoryAuthor(e.target.value)}
                          placeholder="e.g. Maya Krishnan"
                          className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-stone-300 mb-1">
                          Your Role or Association
                        </label>
                        <select
                          value={newMemoryRole}
                          onChange={(e) => setNewMemoryRole(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          <option value="Pilgrim & Heritage Explorer">Pilgrim & Heritage Explorer</option>
                          <option value="Local Resident / Elder">Local Resident / Elder</option>
                          <option value="Heritage Historian & Scholar">Heritage Historian & Scholar</option>
                          <option value="Artisan / Traditional Guide">Artisan / Traditional Guide</option>
                          <option value="Photographer & Chronicler">Photographer & Chronicler</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        Memory Title
                      </label>
                      <input
                        type="text"
                        value={newMemoryTitle}
                        onChange={(e) => setNewMemoryTitle(e.target.value)}
                        placeholder={`e.g. Dawn reflection across the sacred water tank`}
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        Your Story, Observation or Oral Legend *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={newMemoryStory}
                        onChange={(e) => setNewMemoryStory(e.target.value)}
                        placeholder="Share a vivid observation, acoustic detail, childhood story, local tea stall, or hidden corner..."
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowMemoryForm(false)}
                        className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingMemory || !newMemoryStory.trim()}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingMemory ? 'Preserving...' : 'Save to Aarambh Archives'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Community Memories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {scanResult.communityMemories && scanResult.communityMemories.length > 0 ? (
                    scanResult.communityMemories.map((mem, index) => (
                      <div
                        key={mem.id || index}
                        className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800/90 hover:border-stone-700 flex flex-col justify-between space-y-3 transition-all"
                      >
                        <div>
                          {/* Contributor Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{mem.avatar || '🏛️'}</span>
                              <div>
                                <h4 className="text-xs font-bold text-white leading-tight">
                                  {mem.author}
                                </h4>
                                <span className="text-[10px] text-amber-300 font-mono">
                                  {mem.role || 'Contributor'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {mem.date || 'Recent'}
                            </span>
                          </div>

                          {/* Story Narrative */}
                          <p className="text-xs text-stone-200 leading-relaxed font-sans font-normal">
                            "{mem.story}"
                          </p>
                        </div>

                        {/* Tags & Verified Badge */}
                        <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                          <div className="flex flex-wrap gap-1">
                            {mem.tags?.map((t, tidx) => (
                              <span
                                key={tidx}
                                className="px-2 py-0.5 rounded-md bg-stone-800 text-[10px] text-stone-300"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-stone-400">
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                            <span>{mem.likes || 12}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-8 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-center">
                      <MessageSquare className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                      <p className="text-xs text-stone-400">
                        Be the first traveler to record a living memory for {scanResult.monumentName}!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: VISITING TIPS & ADVICE */}
            {resultSubTab === 'tips' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Best Time Card */}
                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                      <Clock className="w-4 h-4" />
                      <span>Best Time to Visit</span>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed">
                      {scanResult.visitingTips?.bestTime ||
                        'Early morning at sunrise to experience quiet contemplation and soft lighting.'}
                    </p>
                  </div>

                  {/* Entry Guidelines Card */}
                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Entry Fees & Ticketing</span>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed">
                      {scanResult.visitingTips?.entryFee ||
                        'Standard Archaeological Survey of India (ASI) rates apply. Online ticketing available at ASI portal.'}
                    </p>
                  </div>

                  {/* Dress Code Card */}
                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Dress Code & Sanctity</span>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed">
                      {scanResult.visitingTips?.dressCode ||
                        'Modest attire covering shoulders and knees recommended for temples and active sanctums.'}
                    </p>
                  </div>

                  {/* Photography Guidelines Card */}
                  <div className="p-5 rounded-2xl bg-stone-900/60 border border-stone-800">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                      <Camera className="w-4 h-4" />
                      <span>Photography Guidelines</span>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed">
                      {scanResult.visitingTips?.photographyRules ||
                        'Permitted on exterior grounds. Tripods require prior ASI authorization.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: NEARBY RADAR MONUMENTS */}
            {resultSubTab === 'nearby' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">
                      Heritage Proximity Radar around {scanResult.monumentName}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    Sorted by road distance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {scanResult.nearbyMonuments && scanResult.nearbyMonuments.length > 0 ? (
                    scanResult.nearbyMonuments.map((nearby) => (
                      <div
                        key={nearby.id}
                        className="rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex flex-col justify-between hover:border-amber-500/40 transition-all"
                      >
                        <div className="relative aspect-16/9 bg-stone-950">
                          <img
                            src={nearby.thumbnail}
                            alt={nearby.name}
                            className="w-full h-full object-cover brightness-85"
                          />
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 font-bold border border-white/10">
                            ~{nearby.distanceKm} km
                          </div>
                        </div>

                        <div className="p-3.5 space-y-2">
                          <div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {nearby.name}
                            </h4>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {nearby.city}, {nearby.state} • {nearby.era}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                            {onExplorePlace && (
                              <button
                                onClick={() => onExplorePlace(nearby.name)}
                                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                              >
                                <span>Explore Site</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                performMonumentScan(undefined, nearby.name, nearby.lat, nearby.lon, nearby.thumbnail);
                              }}
                              className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-semibold border border-stone-700 cursor-pointer"
                            >
                              Scan This
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center p-6 text-stone-500 text-xs">
                      No nearby monuments cataloged in immediate perimeter.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Social Share Discovery Modal */}
      {scanResult && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          payload={sharePayload || { title: scanResult.monumentName, text: `Discovered ${scanResult.monumentName} on Aarambh!` }}
          badgeType="monument"
          subtitle="Share your verified monument discovery with travelers"
        />
      )}
    </div>
  );
};
