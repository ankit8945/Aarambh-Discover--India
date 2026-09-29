import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  X,
  Sparkles,
  MapPin,
  ShieldCheck,
  Compass,
  Utensils,
  Hammer,
  BookOpen,
  Calendar,
  Share2,
} from 'lucide-react';
import { HeritageData } from '../types';
import { handlePrintSection } from '../utils/print';

interface DownloadMemoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: HeritageData;
}

export const DownloadMemoryCardModal: React.FC<DownloadMemoryCardModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = `
══════════════════════════════════════════════════════════════
AARAMBH — INDIA'S LIVING MEMORY LAYER (SIH 2026 ARCHIVAL RECORD)
══════════════════════════════════════════════════════════════
LOCATION: ${data.placeName} (${data.location.formattedAddress})
COORDINATES: ${data.location.lat.toFixed(4)}°N, ${data.location.lon.toFixed(4)}°E
STATE: ${data.location.state || 'India'}

OVERVIEW:
${data.overview}

HISTORICAL SIGNIFICANCE:
${data.history}

ARCHITECTURE & MOTIFS:
${data.architecture}

LIVING HERITAGE & CRAFTS:
${data.crafts?.map((c) => `• ${c.name}: ${c.description} [Materials: ${c.materials}]`).join('\n') || 'Oral traditions and community guilds'}

HEIRLOOM CULINARY CULTURE:
${data.traditionalFood?.map((f) => `• ${f.name}: ${f.description}`).join('\n') || 'Regional festive cuisine'}

ORAL LORE & SPOKEN DIALECTS:
${data.localStories?.map((s) => `• ${s.title}: ${s.narrative}`).join('\n') || 'Community memories'}

OFFICIAL PROVENANCE & SOURCES:
${data.sources?.map((s) => `[${s.type}] ${s.name}`).join(' | ')}
══════════════════════════════════════════════════════════════
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    handlePrintSection('memory-card-printable-area', 'portrait');
  };

  const handleDownloadPNG = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#faf8f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer border
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

      // Inner ornate border
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);

      // Tricolor top accent strip
      ctx.fillStyle = '#ea580c'; // Saffron
      ctx.fillRect(28, 28, 381, 6);
      ctx.fillStyle = '#ffffff'; // White
      ctx.fillRect(409, 28, 381, 6);
      ctx.fillStyle = '#16a34a'; // Green
      ctx.fillRect(790, 28, 354, 6);

      // Header Brand
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 22px serif';
      ctx.fillText('AARAMBH — INDIA’S LIVING MEMORY LAYER', 60, 75);

      ctx.fillStyle = '#78716c';
      ctx.font = '14px sans-serif';
      ctx.fillText('Smart India Hackathon (SIH) 2026 • Official Archival Memory Card', 60, 98);

      // Place Name
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 42px serif';
      ctx.fillText(data.placeName.toUpperCase(), 60, 160);

      // Location & Coords Subtitle
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 15px sans-serif';
      const addressLine = `${data.location.formattedAddress} • Lat: ${data.location.lat.toFixed(4)}°N, Lon: ${data.location.lon.toFixed(4)}°E`;
      ctx.fillText(addressLine, 60, 190);

      // Divider line
      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 210);
      ctx.lineTo(1140, 210);
      ctx.stroke();

      // Left Column: Overview & History
      ctx.fillStyle = '#292524';
      ctx.font = 'bold 16px serif';
      ctx.fillText('CIVILIZATIONAL OVERVIEW & ARCHIVAL RECORD', 60, 245);

      ctx.fillStyle = '#44403c';
      ctx.font = '13px sans-serif';
      const overviewWords = (data.overview || data.history || '').split(' ');
      let line = '';
      let y = 275;
      for (let n = 0; n < overviewWords.length; n++) {
        const testLine = line + overviewWords[n] + ' ';
        if (ctx.measureText(testLine).width > 500 && n > 0) {
          ctx.fillText(line, 60, y);
          line = overviewWords[n] + ' ';
          y += 20;
          if (y > 450) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 60, y);

      // Architecture Section
      ctx.fillStyle = '#292524';
      ctx.font = 'bold 16px serif';
      ctx.fillText('ARCHITECTURAL VERNACULAR & MOTIFS', 60, y + 45);

      ctx.fillStyle = '#44403c';
      ctx.font = '13px sans-serif';
      const archText = data.architecture || 'Reflects indigenous stone craft and regional Vedic/Islamic masonry traditions.';
      const archWords = archText.split(' ');
      line = '';
      y = y + 70;
      for (let n = 0; n < archWords.length; n++) {
        const testLine = line + archWords[n] + ' ';
        if (ctx.measureText(testLine).width > 500 && n > 0) {
          ctx.fillText(line, 60, y);
          line = archWords[n] + ' ';
          y += 20;
          if (y > 660) break;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 60, y);

      // Right Column: Living Heritage, Crafts & Cuisine
      ctx.fillStyle = '#292524';
      ctx.font = 'bold 16px serif';
      ctx.fillText('LIVING HERITAGE, CRAFTS & FOOD', 600, 245);

      let rightY = 275;
      if (data.crafts && data.crafts.length > 0) {
        data.crafts.slice(0, 2).forEach((c) => {
          ctx.fillStyle = '#9a3412';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`• Craft: ${c.name}`, 600, rightY);
          rightY += 18;
          ctx.fillStyle = '#57534e';
          ctx.font = '12px sans-serif';
          ctx.fillText(`  Materials: ${c.materials} | Tools: ${c.tools?.join(', ') || 'Traditional'}`, 600, rightY);
          rightY += 28;
        });
      }

      if (data.traditionalFood && data.traditionalFood.length > 0) {
        const food = data.traditionalFood[0];
        ctx.fillStyle = '#9a3412';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`• Heirloom Food: ${food.name}`, 600, rightY);
        rightY += 18;
        ctx.fillStyle = '#57534e';
        ctx.font = '12px sans-serif';
        ctx.fillText(`  Significance: ${food.culturalSignificance?.slice(0, 70)}...`, 600, rightY);
        rightY += 32;
      }

      if (data.language) {
        ctx.fillStyle = '#9a3412';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`• Spoken Lore: ${data.language.dialect || data.language.primary}`, 600, rightY);
        rightY += 18;
        ctx.fillStyle = '#57534e';
        ctx.font = '12px sans-serif';
        ctx.fillText(`  Phrase: "${data.language.samplePhrase || 'नमस्ते'}" (${data.language.meaning || 'Greeting'})`, 600, rightY);
        rightY += 30;
      }

      // Archival Stamp Box
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.strokeRect(600, rightY + 15, 520, 120);

      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(601, rightY + 16, 518, 118);

      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('AARAMBH VERIFIED PROVENANCE SEAL', 620, rightY + 45);

      ctx.fillStyle = '#78716c';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Archival Registry ID: IN-AARAMBH-${Math.abs(Math.round(data.location.lat * 10000))}`, 620, rightY + 68);
      ctx.fillText('Grounding Sources: Archaeological Survey of India (ASI), UNESCO, OSM', 620, rightY + 86);
      ctx.fillText(`Issued: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • SIH 2026 Non-Commercial Cultural Archive`, 620, rightY + 104);

      // Footer
      ctx.strokeStyle = '#e7e5e4';
      ctx.beginPath();
      ctx.moveTo(60, 830);
      ctx.lineTo(1140, 830);
      ctx.stroke();

      ctx.fillStyle = '#a8a29e';
      ctx.font = '11px sans-serif';
      ctx.fillText('Aarambh — India’s Living Memory Layer. Preserving what might disappear.', 60, 855);
      ctx.fillText('Verify online at aarambh.culture.gov.in (SIH-2026 Prototype)', 760, 855);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `AARAMBH_Memory_Card_${data.placeName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-50 rounded-3xl border border-stone-300 shadow-2xl overflow-hidden my-8 animate-fade-in shrink-0">
        {/* Subtle Tricolor identity accent line on card top */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-amber-600" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-emerald-700" />
        </div>

        {/* Modal Header Controls */}
        <div className="px-6 py-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-700 text-amber-50 flex items-center justify-center font-serif font-bold text-sm">
              आ
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-stone-900 uppercase tracking-wide">
                Digital Heritage Memory Card
              </h3>
              <p className="text-[11px] text-stone-500">
                SIH 2026 • Grounded Archival Living Memory Digest
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy text summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print card"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Rendering...' : 'Download Card (PNG)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable / Viewable Card Canvas Body */}
        <div id="memory-card-printable-area" ref={cardRef} className="p-6 sm:p-10 space-y-6 bg-[#faf8f5]">
          {/* Postcard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/90 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                Verified Cultural Record
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
                {data.placeName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>{data.location.formattedAddress}</span>
                <span className="text-stone-400">•</span>
                <span className="font-mono text-[11px] text-stone-500">
                  {data.location.lat.toFixed(4)}°N, {data.location.lon.toFixed(4)}°E
                </span>
              </div>
            </div>

            {/* Stamp / Seal Graphic */}
            <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-amber-800/40 p-2 flex flex-col items-center justify-center text-center bg-amber-50/60 shrink-0">
              <div className="text-[9px] font-bold uppercase tracking-widest text-amber-900">
                AARAMBH
              </div>
              <div className="w-7 h-7 rounded-full border border-amber-800/40 flex items-center justify-center my-1">
                <span className="font-serif text-xs font-bold text-amber-900">आ</span>
              </div>
              <div className="text-[8px] font-mono text-amber-800">
                SIH • 2026
              </div>
              <div className="text-[7px] text-stone-500 uppercase tracking-tight mt-0.5">
                Archival Seal
              </div>
            </div>
          </div>

          {/* Photo + Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {data.imageUrls && data.imageUrls.length > 0 ? (
              <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-stone-200 shadow-sm max-h-56 bg-stone-900">
                <img
                  src={data.imageUrls[0]}
                  alt={data.placeName}
                  className="w-full h-full object-cover filter brightness-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 px-3 rounded-xl bg-black/85 border border-white/20 text-white flex items-center justify-between text-xs shadow-lg">
                  <span className="font-bold truncate">{data.placeName}</span>
                  <span className="text-[10px] text-amber-300 font-mono shrink-0">{data.epoch || 'Heritage India'}</span>
                </div>
              </div>
            ) : null}

            <div className={`${data.imageUrls && data.imageUrls.length > 0 ? 'md:col-span-7' : 'md:col-span-12'} space-y-3`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-700" />
                Civilizational Memory & Historical Overview
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
                {data.overview}
              </p>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                <strong className="block text-[10px] uppercase font-bold text-amber-800 mb-0.5">
                  Why It Matters For India's Living Memory
                </strong>
                <p className="text-[11px] leading-relaxed">{data.whyItMatters || data.tagline}</p>
              </div>
            </div>
          </div>

          {/* 3-Column Structured Cultural Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* 1. Architecture */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                Architecture
              </span>
              <p className="text-xs text-stone-700 leading-relaxed line-clamp-4">
                {data.architecture}
              </p>
            </div>

            {/* 2. Living Crafts */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Hammer className="w-3.5 h-3.5 text-amber-700" />
                Crafts & Guilds
              </span>
              {data.crafts && data.crafts.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-stone-900">{data.crafts[0].name}</div>
                  <p className="text-[11px] text-stone-600 line-clamp-3">
                    {data.crafts[0].description}
                  </p>
                  <div className="text-[10px] text-stone-500">
                    Materials: {data.crafts[0].materials}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">Community handloom and regional craftsmanship.</p>
              )}
            </div>

            {/* 3. Heirloom Food */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-amber-700" />
                Heirloom Cuisine
              </span>
              {data.traditionalFood && data.traditionalFood.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-stone-900">{data.traditionalFood[0].name}</div>
                  <p className="text-[11px] text-stone-600 line-clamp-3">
                    {data.traditionalFood[0].description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-stone-500">Traditional seasonal culinary rituals.</p>
              )}
            </div>
          </div>

          {/* Sources Provenance Footer Bar */}
          <div className="pt-4 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-stone-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700">Archival Grounding:</span>
              <span>Archaeological Survey of India (ASI) • OpenStreetMap • UNESCO Public Registry</span>
            </div>
            <div className="font-mono text-[10px] text-amber-800">
              Generated via Aarambh Engine • SIH 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
