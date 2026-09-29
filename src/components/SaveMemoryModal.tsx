import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeMemoryContribution, submitMemory } from '../services/api';
import { MemoryContribution } from '../types';
import { recordMemorySavedXP } from '../utils/experiencePoints';
import {
  Camera,
  Mic,
  FileText,
  Video,
  Sparkles,
  X,
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  Languages,
} from 'lucide-react';

interface SaveMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlaceName?: string;
  defaultLat?: number;
  defaultLon?: number;
  defaultAddress?: string;
  onMemorySaved?: (newMem: MemoryContribution) => void;
}

const MEDIA_TYPES = [
  { id: 'oral story', label: 'Oral Story', icon: '🎙️' },
  { id: 'recipe', label: 'Heirloom Recipe', icon: '🍲' },
  { id: 'craft', label: 'Craft Technique', icon: '🧵' },
  { id: 'song', label: 'Folk Song / Geet', icon: '🎵' },
  { id: 'dialect', label: 'Dialect Word', icon: '🗣️' },
  { id: 'photo', label: 'Historic Photo / Site', icon: '📷' },
  { id: 'ritual', label: 'Community Ritual', icon: '🪔' },
  { id: 'text', label: 'Community Memory', icon: '📝' },
];

export const SaveMemoryModal: React.FC<SaveMemoryModalProps> = ({
  isOpen,
  onClose,
  defaultPlaceName = '',
  defaultLat = 20.5937,
  defaultLon = 78.9629,
  defaultAddress = '',
  onMemorySaved,
}) => {
  const { user } = useAuth();
  const [mediaType, setMediaType] = useState<any>('oral story');
  const [title, setTitle] = useState('');
  const [placeName, setPlaceName] = useState(defaultPlaceName);
  const [address, setAddress] = useState(defaultAddress);
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [audioTranscript, setAudioTranscript] = useState('');

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    detectedLanguage?: string;
    extractedEntities?: string[];
    traditionClassification?: string;
    preservationUrgency?: 'HIGH' | 'MEDIUM' | 'DOCUMENTED';
    audioTranscript?: string;
  } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAiAnalysis = async () => {
    if (!content.trim()) {
      setError('Please enter your memory details first before analyzing.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeMemoryContribution(
        title || 'Untitled Memory',
        content,
        placeName,
        mediaType
      );
      setAiAnalysis(result);
      if (result.audioTranscript) {
        setAudioTranscript(result.audioTranscript);
      }
    } catch (err: any) {
      setError('AI Analysis service unavailable.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // If AI analysis was not yet run, run it quickly
      let analysis = aiAnalysis;
      if (!analysis) {
        try {
          analysis = await analyzeMemoryContribution(title, content, placeName, mediaType);
        } catch (e) {
          analysis = null;
        }
      }

      // If user is CULTURAL_CREATOR or ADMIN, we can mark verified or pending
      const initialStatus = user?.role === 'ADMIN' ? 'VERIFIED' : 'PENDING';

      const saved = await submitMemory({
        placeName: placeName || 'India',
        location: {
          lat: defaultLat,
          lon: defaultLon,
          formattedAddress: address || placeName,
        },
        title: title.trim(),
        mediaType,
        mediaUrl: mediaUrl || undefined,
        content: content.trim(),
        contributorName: user?.name || 'Anonymous Contributor',
        contributorRole: user?.role || 'TRAVELER',
        contributorId: user?.id || 'anon',
        verificationStatus: initialStatus,
        detectedLanguage: analysis?.detectedLanguage || 'Regional Indian',
        extractedEntities: analysis?.extractedEntities || [],
        traditionClassification: analysis?.traditionClassification || 'Community Memory',
        preservationUrgency: analysis?.preservationUrgency || 'MEDIUM',
        audioTranscript: audioTranscript || analysis?.audioTranscript,
      });

      setSuccess(true);
      recordMemorySavedXP();
      if (onMemorySaved) {
        onMemorySaved(saved);
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setTitle('');
        setContent('');
        setAiAnalysis(null);
      }, 1500);
    } catch (err: any) {
      setError('Failed to record memory into database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-[2rem] p-6 sm:p-8 text-stone-900 shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Header (Fixed at top) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm border border-amber-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heritage text-stone-900">Save This Memory</h3>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">
                Contribute to India's National Cultural Memory Graph
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 overflow-x-hidden pt-4 pb-2 pr-1 custom-scrollbar">
          {success ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-stone-900">Memory Preserved Successfully</h4>
              <p className="text-sm text-stone-500 max-w-sm mx-auto">
                Your contribution has been recorded and submitted into the Aarambh cultural layer for curatorial verification.
              </p>
            </div>
          ) : (
            <form id="save-memory-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Category / Media Type selector */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2.5">
                  Type of Cultural Memory
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {MEDIA_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMediaType(t.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                        mediaType === t.id
                          ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-200 font-bold'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-amber-200'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Place */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Title of Tradition or Memory *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Generation-Old Bell-Metal Technique"
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Associated Indian Place / Village *
                  </label>
                  <div className="relative shadow-sm rounded-xl">
                    <input
                      type="text"
                      required
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      placeholder="e.g. Sarthebari, Assam or Varanasi"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    />
                    <MapPin className="w-4 h-4 text-amber-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* Content / Narrative */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <label className="text-xs font-bold text-stone-700">
                    Detailed Memory, Oral History, Recipe, or Craft Process *
                  </label>
                  <button
                    type="button"
                    onClick={handleRunAiAnalysis}
                    disabled={analyzing || !content.trim()}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center gap-1.5 font-bold disabled:opacity-40 transition-colors shadow-sm border border-amber-200"
                  >
                    {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    AI Cultural Analysis
                  </button>
                </div>

                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the story, materials used, generational songs, words in native dialect, who taught it, or why this custom might vanish..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-sm leading-relaxed"
                />
              </div>

              {/* AI Analysis Preview Drawer */}
              {aiAnalysis && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-sm space-y-3 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-stone-900">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      AI Archival Classification
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold shadow-sm ${
                        aiAnalysis.preservationUrgency === 'HIGH'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Urgency: {aiAnalysis.preservationUrgency || 'MEDIUM'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-stone-700 pt-2 border-t border-amber-200/50">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase block mb-0.5">Detected Language/Dialect</span>
                      <span className="font-bold text-stone-900">
                        {aiAnalysis.detectedLanguage || 'Regional'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase block mb-0.5">Tradition Category</span>
                      <span className="font-bold text-stone-900">
                        {aiAnalysis.traditionClassification || 'Folk Heritage'}
                      </span>
                    </div>
                  </div>

                  {aiAnalysis.extractedEntities && aiAnalysis.extractedEntities.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] text-stone-500 uppercase block mb-1.5">Extracted Cultural Entities</span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiAnalysis.extractedEntities.map((ent, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-white text-stone-800 text-[11px] font-medium border border-stone-200 shadow-sm">
                            {ent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Media URL / Reference Link */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Media Reference / Audio / Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://... (image, video, or cloud audio recording link)"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-sm"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2 shadow-sm font-medium">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer (Fixed at bottom) */}
        {!success && (
          <div className="pt-4 mt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="text-[11px] text-stone-500">
              {user?.isGuest ? (
                <span>Guest Contributor • <span className="text-amber-600 font-medium">Public Living Archive</span></span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Credited to <strong className="text-stone-900">{user?.name}</strong>{' '}
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200 font-bold tracking-wide">
                    {user?.authProvider === 'google' ? 'G-Verified ' : ''}{user?.role === 'CULTURAL_CREATOR' ? 'Contributor' : 'Traveler'}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 text-sm font-bold transition-all border border-stone-200 shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="save-memory-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:hover:shadow-md"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Preserve Memory</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
