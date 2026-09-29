import React from 'react';
import { PassportStamp } from '../types';

interface PassportStampBadgeProps {
  stamp: PassportStamp;
  size?: 'sm' | 'md' | 'lg';
  isJustStamped?: boolean;
}

export const PassportStampBadge: React.FC<PassportStampBadgeProps> = ({
  stamp,
  size = 'md',
  isJustStamped = false,
}) => {
  // Ink color styles
  const colorMap = {
    crimson: {
      text: 'text-red-700',
      border: 'border-red-700',
      bg: 'bg-red-50/40',
      svgStroke: '#b91c1c',
      svgFill: '#b91c1c',
    },
    indigo: {
      text: 'text-blue-900',
      border: 'border-blue-900',
      bg: 'bg-blue-50/40',
      svgStroke: '#1e3a8a',
      svgFill: '#1e3a8a',
    },
    emerald: {
      text: 'text-emerald-800',
      border: 'border-emerald-800',
      bg: 'bg-emerald-50/40',
      svgStroke: '#065f46',
      svgFill: '#065f46',
    },
    ochre: {
      text: 'text-amber-800',
      border: 'border-amber-800',
      bg: 'bg-amber-50/40',
      svgStroke: '#92400e',
      svgFill: '#92400e',
    },
    purple: {
      text: 'text-purple-800',
      border: 'border-purple-800',
      bg: 'bg-purple-50/40',
      svgStroke: '#6b21a8',
      svgFill: '#6b21a8',
    },
    sepia: {
      text: 'text-stone-800',
      border: 'border-stone-800',
      bg: 'bg-stone-100/40',
      svgStroke: '#44403c',
      svgFill: '#44403c',
    },
  };

  const c = colorMap[stamp.inkColor] || colorMap.crimson;

  const sizeClasses = {
    sm: 'w-24 h-24 text-[9px]',
    md: 'w-32 h-32 sm:w-36 sm:h-36 text-[10px]',
    lg: 'w-40 h-40 sm:w-48 sm:h-48 text-[11px]',
  }[size];

  // Random or stored subtle rotation to feel like hand-stamped ink
  const rotationDeg = stamp.rotation || -3;

  return (
    <div
      style={{
        transform: `rotate(${rotationDeg}deg)`,
      }}
      className={`relative inline-flex items-center justify-center select-none transition-all duration-300 ${
        isJustStamped ? 'animate-bounce scale-105' : 'hover:scale-105'
      }`}
    >
      {/* SHAPE 1: ROUND STAMP (ARCHAEOLOGICAL SURVEY / TEMPLE SEAL) */}
      {(stamp.shape === 'round' || !stamp.shape) && (
        <div
          className={`${sizeClasses} ${c.text} ${c.bg} relative rounded-full border-2 border-dashed ${c.border} p-1 shadow-xs flex flex-col items-center justify-between text-center overflow-hidden`}
        >
          {/* Inner solid ring */}
          <div className={`absolute inset-1.5 rounded-full border border-solid ${c.border} opacity-80 pointer-events-none`} />

          {/* Top Header */}
          <div className="pt-2 font-mono font-bold uppercase tracking-wider text-[8px] sm:text-[9px] truncate max-w-[85%] z-10 opacity-90">
            ★ {stamp.city} ★
          </div>

          {/* Center Monument & Motto */}
          <div className="my-auto px-1 z-10 flex flex-col items-center">
            <div className="font-extrabold font-serif uppercase tracking-tight text-[10px] sm:text-[11px] leading-tight line-clamp-2 px-1">
              {stamp.name}
            </div>
            {stamp.hindiName && (
              <div className="text-[9px] font-royal opacity-85 mt-0.5">
                {stamp.hindiName}
              </div>
            )}
            <div className="text-[7px] sm:text-[8px] font-mono mt-1 opacity-75 font-semibold">
              ENTRY: {stamp.date}
            </div>
          </div>

          {/* Bottom Seal & Verification */}
          <div className="pb-2 font-mono font-bold text-[7px] sm:text-[8px] uppercase tracking-wider z-10 opacity-90 flex items-center gap-0.5">
            <span>BHARAT ASI • VERIFIED</span>
          </div>

          {/* Distressed Stamp Texture Overlay (simulated ink bleed) */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 20%, currentColor 90%)',
            }}
          />
        </div>
      )}

      {/* SHAPE 2: OCTAGON STAMP (ROYAL ENTRY PERMIT) */}
      {stamp.shape === 'octagon' && (
        <div
          className={`${sizeClasses} ${c.text} ${c.bg} relative border-2 ${c.border} p-2 shadow-xs flex flex-col items-center justify-between text-center overflow-hidden`}
          style={{
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
          }}
        >
          <div className="pt-2 font-mono font-bold uppercase tracking-wider text-[8px] truncate max-w-[80%] opacity-90">
            • {stamp.state} •
          </div>

          <div className="my-auto px-1 flex flex-col items-center">
            <div className="font-black font-serif uppercase tracking-tight text-[10px] sm:text-[12px] leading-tight line-clamp-2">
              {stamp.name}
            </div>
            <div className="text-[8px] font-mono font-bold mt-1 px-1.5 py-0.5 border border-dashed rounded-xs border-current">
              {stamp.date}
            </div>
          </div>

          <div className="pb-2 font-mono font-bold text-[8px] uppercase tracking-widest opacity-90">
            YATRA MUDRA
          </div>
        </div>
      )}

      {/* SHAPE 3: SHIELD / RECTANGLE STAMP */}
      {(stamp.shape === 'shield' || stamp.shape === 'rect' || stamp.shape === 'oval') && (
        <div
          className={`${sizeClasses} ${c.text} ${c.bg} relative rounded-xl border-2 border-double ${c.border} p-2 shadow-xs flex flex-col items-center justify-between text-center overflow-hidden`}
        >
          <div className="font-mono font-bold uppercase text-[8px] tracking-wider border-b border-current pb-0.5 w-full">
            OFFICIAL HERITAGE ENTRY
          </div>
          <div className="my-auto px-1 flex flex-col items-center">
            <div className="text-sm">{stamp.iconSymbol || '🏛️'}</div>
            <div className="font-bold font-serif uppercase text-[10px] sm:text-[11px] leading-tight">
              {stamp.name}
            </div>
            <div className="text-[8px] font-mono text-stone-600 mt-0.5">{stamp.city}</div>
          </div>
          <div className="text-[7px] font-mono font-semibold pt-0.5 border-t border-current w-full flex justify-between px-1">
            <span>PASSED</span>
            <span>{stamp.date}</span>
          </div>
        </div>
      )}
    </div>
  );
};
