import React from 'react';
import { InformationSource } from '../types';
import { ShieldCheck, ExternalLink, Database, Cpu, Users, Clock } from 'lucide-react';

interface SourcesTransparencyProps {
  sources: InformationSource[];
  retrievedAt: string;
}

export const SourcesTransparency: React.FC<SourcesTransparencyProps> = ({
  sources,
  retrievedAt,
}) => {
  const getSourceBadge = (type: string) => {
    switch (type) {
      case 'VERIFIED_API':
        return (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Verified Factual Source
          </span>
        );
      case 'OPEN_DATA':
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold flex items-center gap-1">
            <Database className="w-3 h-3" /> Geographic / Open Data
          </span>
        );
      case 'COMMUNITY':
        return (
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-semibold flex items-center gap-1">
            <Users className="w-3 h-3" /> Community Memory Network
          </span>
        );
      case 'AI_SYNTHESIS':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold flex items-center gap-1">
            <Cpu className="w-3 h-3" /> AI Grounded Synthesis
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-stone-100/80 border border-stone-200/90 text-stone-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-700" />
          <h4 className="text-sm font-bold font-heritage uppercase tracking-wider text-stone-900">
            Source Transparency & Provenance
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>Retrieved: {new Date(retrievedAt).toLocaleString()}</span>
        </div>
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">
        AARAMBH adheres to strict zero-hallucination protocols. Historical facts are derived from
        public archival encyclopedias and survey databases, geographical information from live
        geocoding and meteorological providers, and living oral lore directly from vetted community
        contributors.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-stone-900 truncate">{src.name}</span>
                {getSourceBadge(src.type)}
              </div>
              <p className="text-[11px] text-stone-500 leading-normal">{src.note}</p>
            </div>

            {src.link && (
              <a
                href={src.link}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 pt-2 border-t border-stone-100 text-[11px] text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-1 transition-colors"
              >
                <span>Inspect Primary Record</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 rounded-2xl bg-stone-200/60 text-[11px] text-stone-600 flex items-start gap-2">
        <span className="font-bold text-stone-700">Archival Disclaimer:</span>
        <span>
          AI-assisted interpretations and historical reconstructions are designed for pedagogical and cultural engagement. They reflect evidence-based syntheses rather than primary archival certificates.
        </span>
      </div>
    </div>
  );
};
