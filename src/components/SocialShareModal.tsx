import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Smartphone,
  Globe,
  Award,
  MapPin,
  Compass,
} from 'lucide-react';
import { executeWebShare, getSocialShareLinks, isWebShareSupported, SharePayload } from '../utils/socialShare';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: SharePayload;
  badgeType?: 'passport' | 'monument' | 'memory';
  subtitle?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  payload,
  badgeType = 'passport',
  subtitle,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareLinks = getSocialShareLinks(payload);
  const shareUrl = payload.url || (typeof window !== 'undefined' ? window.location.href : 'https://aarambh.heritage.in');

  const handleNativeShare = async () => {
    const result = await executeWebShare(payload);
    if (result.success) {
      setStatusMsg(result.message);
      if (result.method === 'clipboard') {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${payload.text}\n\n${shareUrl}`);
        setCopied(true);
        setStatusMsg('Copied share text & link to clipboard!');
        setTimeout(() => {
          setCopied(false);
          setStatusMsg(null);
        }, 3000);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92dvh] overflow-y-auto border border-stone-200 shadow-2xl animate-fade-in flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-royal text-white">
                Share Cultural Achievement
              </h3>
              <p className="text-[11px] text-stone-300 font-light">
                {subtitle || 'Broadcast Indian heritage pride with fellow travelers'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Card Preview of Shared Item */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                {badgeType === 'passport' && <Award className="w-3 h-3 text-amber-700" />}
                {badgeType === 'monument' && <MapPin className="w-3 h-3 text-amber-700" />}
                {badgeType === 'memory' && <Sparkles className="w-3 h-3 text-amber-700" />}
                <span>
                  {badgeType === 'passport'
                    ? 'Aarambh Digital Yatra Passport'
                    : badgeType === 'monument'
                    ? 'Heritage Discovery'
                    : 'Living Heritage Memory'}
                </span>
              </span>
              <span className="text-[9px] font-mono text-stone-500">Live Preview</span>
            </div>

            <div className="font-bold text-stone-900 text-xs sm:text-sm">
              {payload.title}
            </div>

            <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed whitespace-pre-line font-normal">
              {payload.text}
            </p>
          </div>

          {/* Toast / Notification Banner */}
          {statusMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Primary Action: Web Share API button */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-amber-200" />
            <span>Share via Device Apps (WhatsApp, Stories, Messages)</span>
          </button>

          {/* Direct Social Platform Buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider text-center">
              Or share directly to platforms:
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/80 transition-colors flex flex-col items-center justify-center gap-1 group text-center"
              >
                <span className="text-lg">💬</span>
                <span className="text-[10px] font-bold text-emerald-900">WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 hover:bg-stone-200/80 transition-colors flex flex-col items-center justify-center gap-1 group text-center"
              >
                <span className="text-lg">𝕏</span>
                <span className="text-[10px] font-bold text-stone-900">X / Post</span>
              </a>

              {/* Telegram */}
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 hover:bg-sky-100/80 transition-colors flex flex-col items-center justify-center gap-1 group text-center"
              >
                <span className="text-lg">✈️</span>
                <span className="text-[10px] font-bold text-sky-900">Telegram</span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100/80 transition-colors flex flex-col items-center justify-center gap-1 group text-center"
              >
                <span className="text-lg">💼</span>
                <span className="text-[10px] font-bold text-blue-900">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Copy Link Input Bar */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full pl-3 pr-24 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-600 font-mono select-all focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="absolute right-1 px-3 py-1 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
          Powered by Web Share API & Aarambh Sovereign Cultural Ledger
        </div>
      </div>
    </div>
  );
};
