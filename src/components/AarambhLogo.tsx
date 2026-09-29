import React from 'react';

interface AarambhLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
}

/**
 * Authentic Aarambh Brand Logo
 * Pixel-accurate vector recreation of the official Aarambh brand identity:
 * - Grand stylized 'A' with sacred Temple Kalash Shikhara spire at its apex
 * - Radiant orange sunrise and soaring birds in flight
 * - Intricately engraved historic Indian domed monument gateway with stairs & pine trees inside the 'A'
 * - Ancient hilltop fortress & snow-capped Himalayan mountain range with second sun atop 'ram'
 * - Sweeping 3D Indian national tricolor (Saffron, White, Emerald Green) dynamic ribbon wave
 * - High-contrast classical serif calligraphy for 'arambh'
 * - Vintage 16-point exploration Compass Rose with 'N' cardinal pointer integrated on the letter 'h'
 * - Supports both dark typography (default, matching logo.png) and white typography (matching logo1.png)
 */
export const AarambhLogo: React.FC<AarambhLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
}) => {
  // Height sizing: sm (32px), md (44px), lg (58px), xl (76px)
  const heightClass =
    size === 'sm'
      ? 'h-8'
      : size === 'lg'
      ? 'h-14'
      : size === 'xl'
      ? 'h-20'
      : 'h-10 sm:h-11';

  const isLight = variant === 'light';
  const textColor = isLight ? '#FFFFFF' : '#141210';
  const archStroke = isLight ? '#E5E0D8' : '#2A2624';
  const fortColor = isLight ? '#D6D3CD' : '#332E2B';
  const mountainCrag = isLight ? '#A8A29E' : '#1E1B18';
  const snowHighlight = '#FFFFFF';
  const compassColor = isLight ? '#F5F5F4' : '#141210';

  return (
    <div
      className={`relative inline-flex items-center select-none group transition-transform duration-300 hover:scale-[1.015] ${className}`}
      title="Aarambh - The Living Memory Layer of India"
    >
      <svg
        viewBox="0 0 460 200"
        className={`${heightClass} w-auto drop-shadow-xs`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sun 1 Gradient */}
          <radialGradient id="sunGradient1" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="60%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </radialGradient>

          {/* Sun 2 Gradient */}
          <radialGradient id="sunGradient2" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </radialGradient>

          {/* Tricolor Saffron Ribbon Gradient */}
          <linearGradient id="saffronWave" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="35%" stopColor="#F97316" />
            <stop offset="70%" stopColor="#FF671F" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Tricolor White Ribbon Gradient */}
          <linearGradient id="whiteWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="40%" stopColor="#FFFFFF" />
            <stop offset="80%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Tricolor Emerald Green Ribbon Gradient */}
          <linearGradient id="greenWave" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#14532D" />
            <stop offset="30%" stopColor="#15803D" />
            <stop offset="75%" stopColor="#046A38" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* Subtle Ambient Background Glow for Logo */}
          <radialGradient id="subtleHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={isLight ? '0.18' : '0.08'} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Halo */}
        <ellipse cx="230" cy="100" rx="220" ry="75" fill="url(#subtleHalo)" />

        {/* ================================================================= */}
        {/* 1. SUNS & FLYING BIRDS SILHOUETTES                                */}
        {/* ================================================================= */}
        {/* Sun 1 (behind left shoulder of letter 'A') */}
        <circle cx="132" cy="40" r="17" fill="url(#sunGradient1)" />
        {/* Subtle Sun 1 Corona Ring */}
        <circle cx="132" cy="40" r="21" stroke="#F97316" strokeWidth="0.8" opacity="0.35" strokeDasharray="3 2" />

        {/* 3 Flying Birds near Sun 1 */}
        <path
          d="M148 24 Q151 21 154 24 Q157 21 160 24 Q156 26 154 25 Q152 26 148 24 Z"
          fill={textColor}
        />
        <path
          d="M158 35 Q161 32 163 35 Q166 32 168 35 Q165 37 163 36 Q161 37 158 35 Z"
          fill={textColor}
          opacity="0.85"
        />
        <path
          d="M152 46 Q154 43 157 46 Q160 43 162 46 Q159 48 157 47 Q155 48 152 46 Z"
          fill={textColor}
          opacity="0.75"
        />

        {/* Sun 2 (rising behind snow-capped Himalayan mountain peaks) */}
        <circle cx="310" cy="62" r="16" fill="url(#sunGradient2)" />
        {/* 2 Birds above the mountains */}
        <path
          d="M272 49 Q275 46 277 49 Q280 46 282 49 Q279 51 277 50 Q275 51 272 49 Z"
          fill={textColor}
          opacity="0.85"
        />
        <path
          d="M288 44 Q290 42 292 44 Q294 42 296 44 Q293 45 292 45 Q290 45 288 44 Z"
          fill={textColor}
          opacity="0.7"
        />

        {/* ================================================================= */}
        {/* 2. ANCIENT HILLTOP FORT & HIMALAYAN PEAKS (ATOP 'RAM')            */}
        {/* ================================================================= */}
        <g id="fort-and-himalayas">
          {/* Ancient Hilltop Fort Citadel Bastions & Ramparts */}
          <path
            d="M205 92 L205 77 L209 77 L209 80 L213 80 L213 77 L217 77 L217 80 L221 80 L221 75 L225 75 L225 80 L229 80 L229 76 L233 76 L233 80 L237 80 L237 73 L241 73 L241 80 L245 80 L245 92 Z"
            fill={fortColor}
            opacity="0.9"
          />
          {/* Fort Main Tower & Dome Chhatri */}
          <path
            d="M235 73 Q239 67 243 73 Z"
            fill={fortColor}
          />
          <line x1="239" y1="67" x2="239" y2="64" stroke={fortColor} strokeWidth="1.2" />
          <circle cx="239" cy="64" r="1" fill="#F97316" />
          <path
            d="M217 76 Q220 71 223 76 Z"
            fill={fortColor}
          />
          {/* Fort Arched Windows & embrasures */}
          <rect x="211" y="82" width="2" height="3.5" rx="1" fill={isLight ? '#141210' : '#FFFFFF'} opacity="0.6" />
          <rect x="219" y="82" width="2" height="3.5" rx="1" fill={isLight ? '#141210' : '#FFFFFF'} opacity="0.6" />
          <rect x="227" y="82" width="2" height="3.5" rx="1" fill={isLight ? '#141210' : '#FFFFFF'} opacity="0.6" />
          <rect x="236" y="81" width="2" height="3.5" rx="1" fill={isLight ? '#141210' : '#FFFFFF'} opacity="0.6" />

          {/* Himalayan Mountains (Dramatic jagged snow peaks) */}
          {/* Mountain Silhouettes */}
          <polygon
            points="242,92 265,58 288,74 318,48 348,78 358,92"
            fill={mountainCrag}
          />
          {/* Snow Crest Highlights */}
          <polygon
            points="265,58 259,68 265,65 272,70 274,66"
            fill={snowHighlight}
          />
          <polygon
            points="318,48 308,62 318,58 327,66 332,60 324,53"
            fill={snowHighlight}
          />
          <polygon
            points="288,74 284,81 289,78 296,84"
            fill={snowHighlight}
            opacity="0.85"
          />
          {/* Craggy Ridges & Ridge Lines */}
          <path
            d="M265 58 L266 75 L272 85 M318 48 L314 68 L320 86 M348 78 L344 88"
            stroke={snowHighlight}
            strokeWidth="0.8"
            opacity="0.75"
          />
        </g>

        {/* ================================================================= */}
        {/* 3. THE HISTORIC MONUMENT INSIDE THE 'A' ARCHWAY                   */}
        {/* ================================================================= */}
        <g id="monument-inside-A">
          {/* Monument Plinth & Grand Steps */}
          <rect x="70" y="132" width="56" height="3" fill={archStroke} />
          <rect x="73" y="129" width="50" height="3" fill={archStroke} />
          <rect x="76" y="126" width="44" height="3" fill={archStroke} />
          <rect x="80" y="123" width="36" height="3" fill={archStroke} />
          <rect x="84" y="120" width="28" height="3" fill={archStroke} />

          {/* Central Monument Facade */}
          <rect x="74" y="99" width="48" height="21" fill={isLight ? '#262422' : '#FDFBF7'} stroke={archStroke} strokeWidth="1.2" />
          
          {/* Grand Central Archway (Iwan portal) */}
          <path
            d="M91 120 L91 107 Q98 102 105 107 L105 120 Z"
            fill={isLight ? '#141210' : '#1E1B18'}
          />
          {/* Inner sanctum soft glow */}
          <ellipse cx="98" cy="115" rx="3.5" ry="4.5" fill="#F59E0B" opacity="0.6" />

          {/* Central Dome (Fluted Bulbous Shikhara/Gumbad) */}
          <path
            d="M89 99 Q89 86 98 86 Q107 86 107 99 Z"
            fill={archStroke}
          />
          {/* Central Dome Finial Spire */}
          <line x1="98" y1="86" x2="98" y2="78" stroke={archStroke} strokeWidth="1.4" />
          <circle cx="98" cy="77" r="1.5" fill="#F59E0B" />

          {/* Left Flanking Chhatri / Minaret */}
          <rect x="74" y="94" width="6" height="6" fill={archStroke} />
          <path d="M73 94 Q77 89 81 94 Z" fill={archStroke} />
          <line x1="77" y1="89" x2="77" y2="86" stroke={archStroke} strokeWidth="1" />

          {/* Right Flanking Chhatri / Minaret */}
          <rect x="116" y="94" width="6" height="6" fill={archStroke} />
          <path d="M115 94 Q119 89 123 94 Z" fill={archStroke} />
          <line x1="119" y1="89" x2="119" y2="86" stroke={archStroke} strokeWidth="1" />

          {/* Side Arched Jali Windows */}
          <path d="M80 112 L80 106 Q83 103 86 106 L86 112 Z" fill={isLight ? '#141210' : '#2A2624'} />
          <path d="M110 112 L110 106 Q113 103 116 106 L116 112 Z" fill={isLight ? '#141210' : '#2A2624'} />

          {/* Symmetrical Pine/Cypress Trees Framing Stairs */}
          {/* Left Trees */}
          <path d="M68 135 L71 123 L69 123 L72 114 L70 114 L73 106 L76 114 L74 114 L77 123 L75 123 L78 135 Z" fill="#15803D" opacity="0.9" />
          <path d="M61 135 L64 126 L62 126 L65 119 L68 126 L66 126 L69 135 Z" fill="#046A38" opacity="0.8" />
          
          {/* Right Trees */}
          <path d="M118 135 L121 123 L119 123 L122 114 L120 114 L123 106 L126 114 L124 114 L127 123 L125 123 L128 135 Z" fill="#15803D" opacity="0.9" />
          <path d="M127 135 L130 126 L128 126 L131 119 L134 126 L132 126 L135 135 Z" fill="#046A38" opacity="0.8" />
        </g>

        {/* ================================================================= */}
        {/* 4. THE GRAND CAPITAL 'A' WITH TEMPLE KALASH SHIKHARA              */}
        {/* ================================================================= */}
        <g id="letter-A-and-spire">
          {/* Temple Spire / Kalash atop Apex of 'A' */}
          {/* Kalash Base Amalaka Ring */}
          <ellipse cx="106" cy="30" rx="9" ry="3" fill="#D97706" />
          <ellipse cx="106" cy="27" rx="7" ry="2.2" fill="#F59E0B" />
          <ellipse cx="106" cy="24" rx="5" ry="1.8" fill="#FBBF24" />
          {/* Kalash Spire Cone */}
          <path
            d="M101 24 Q106 14 106 10 Q106 14 111 24 Z"
            fill="url(#saffronWave)"
          />
          {/* Golden Finial Needle & Sacred Bindu */}
          <line x1="106" y1="10" x2="106" y2="4" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="106" cy="3" r="1.8" fill="#FEF08A" />

          {/* Grand Capital 'A' Stems */}
          {/* Left sweeping curved leg and outstretched majestic foot */}
          <path
            d="M106 32 C101 32 94 40 90 50 C76 80 58 114 36 138 C28 147 18 152 8 154 C6 154 5 155 7 156 C22 155 37 149 50 138 C68 122 84 94 98 62 C102 52 105 44 106 32 Z"
            fill={textColor}
          />

          {/* Right bold stem anchoring the letter */}
          <path
            d="M106 32 L112 32 C116 48 124 74 135 106 C144 130 154 150 162 152 L172 153 L172 157 L132 157 L132 153 L142 152 C137 140 128 116 120 92 L106 32 Z"
            fill={textColor}
          />

          {/* Upper Apex Junction Cap */}
          <path
            d="M98 38 C102 33 110 33 114 38 L106 32 Z"
            fill={textColor}
          />
        </g>

        {/* ================================================================= */}
        {/* 5. THE ELEGANT SERIF WORDMARK 'ARAMBH'                           */}
        {/* ================================================================= */}
        <g id="wordmark-typography">
          {/* Letter 'a' (second letter) */}
          {/* Bowl and arch */}
          <path
            d="M198 126 C198 118 193 114 186 114 C177 114 171 120 170 127 L163 125 C165 114 174 107 187 107 C199 107 206 114 206 125 L206 146 C206 149 207 151 210 151 L210 154 L198 154 L197 149 C193 153 186 156 179 156 C169 156 163 150 163 141 C163 131 171 125 186 125 L198 125 L198 126 Z M198 132 L187 132 C177 132 172 136 172 141 C172 146 176 150 183 150 C191 150 198 144 198 136 L198 132 Z"
            fill={textColor}
          />

          {/* Letter 'r' */}
          <path
            d="M221 118 L221 110 L229 110 L229 117 C233 111 239 107 246 107 C249 107 251 108 253 109 L250 117 C248 116 246 116 244 116 C237 116 231 121 231 130 L231 150 C231 153 233 154 236 154 L236 157 L215 157 L215 154 L219 154 C221 154 221 152 221 149 L221 118 Z"
            fill={textColor}
          />

          {/* Letter 'a' (third letter) */}
          <path
            d="M285 126 C285 118 280 114 273 114 C264 114 258 120 257 127 L250 125 C252 114 261 107 274 107 C286 107 293 114 293 125 L293 146 C293 149 294 151 297 151 L297 154 L285 154 L284 149 C280 153 273 156 266 156 C256 156 250 150 250 141 C250 131 258 125 273 125 L285 125 L285 126 Z M285 132 L274 132 C264 132 259 136 259 141 C259 146 263 150 270 150 C278 150 285 144 285 136 L285 132 Z"
            fill={textColor}
          />

          {/* Letter 'm' */}
          <path
            d="M305 118 L305 110 L314 110 L314 116 C318 111 324 107 332 107 C339 107 344 111 347 117 C352 111 358 107 366 107 C376 107 382 114 382 125 L382 149 C382 152 384 154 387 154 L387 157 L367 157 L367 154 L371 154 C373 154 373 152 373 149 L373 127 C373 120 370 116 364 116 C358 116 353 121 353 129 L353 149 C353 152 355 154 358 154 L358 157 L339 157 L339 154 L343 154 C345 154 345 152 345 149 L345 127 C345 120 342 116 336 116 C330 116 324 121 324 129 L324 149 C324 152 326 154 329 154 L329 157 L301 157 L301 154 L305 154 C307 154 307 152 307 149 L307 118 Z"
            fill={textColor}
          />

          {/* Letter 'b' */}
          <path
            d="M394 92 L402 92 L402 116 C406 110 413 107 421 107 C433 107 442 116 442 131 C442 146 432 156 419 156 C412 156 406 153 402 148 L402 154 L391 154 L391 92 Z M402 128 L402 136 C402 144 407 149 415 149 C424 149 431 142 431 131 C431 121 424 114 415 114 C408 114 402 119 402 128 Z"
            fill={textColor}
          />

          {/* Letter 'h' with tall ascender integrating the Compass Rose */}
          <path
            d="M447 98 L455 98 L455 116 C459 110 466 107 473 107 C483 107 488 114 488 126 L488 149 C488 152 490 154 493 154 L493 157 L473 157 L473 154 L477 154 C479 154 479 152 479 149 L479 127 C479 120 476 116 470 116 C464 116 459 121 459 129 L459 149 C459 152 461 154 464 154 L464 157 L443 157 L443 154 L447 154 C449 154 449 152 449 149 L449 98 Z"
            fill={textColor}
            transform="translate(-25, 0)"
          />
        </g>

        {/* ================================================================= */}
        {/* 6. VINTAGE 16-POINT COMPASS ROSE INTEGRATED ON LETTER 'h'         */}
        {/* ================================================================= */}
        <g id="compass-rose" transform="translate(426, 96)">
          {/* Compass Outer Rings */}
          <circle cx="0" cy="0" r="23" stroke={compassColor} strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
          <circle cx="0" cy="0" r="21" stroke={compassColor} strokeWidth="0.8" opacity="0.85" />
          <circle cx="0" cy="0" r="16" stroke={compassColor} strokeWidth="0.5" opacity="0.5" />

          {/* Cardinal 'N' Pointer on Top */}
          <text
            x="0"
            y="-25"
            textAnchor="middle"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontSize="8"
            fontWeight="bold"
            fill={compassColor}
          >
            N
          </text>

          {/* 4 Primary Cardinal Points (Two-Tone 3D Shading) */}
          {/* North Point */}
          <polygon points="0,0 -3.5,-5 0,-21" fill={compassColor} />
          <polygon points="0,0 3.5,-5 0,-21" fill={isLight ? '#78716C' : '#CBD5E1'} />

          {/* South Point */}
          <polygon points="0,0 3.5,5 0,21" fill={compassColor} />
          <polygon points="0,0 -3.5,5 0,21" fill={isLight ? '#78716C' : '#CBD5E1'} />

          {/* East Point */}
          <polygon points="0,0 5,-3.5 21,0" fill={compassColor} />
          <polygon points="0,0 5,3.5 21,0" fill={isLight ? '#78716C' : '#CBD5E1'} />

          {/* West Point */}
          <polygon points="0,0 -5,3.5 -21,0" fill={compassColor} />
          <polygon points="0,0 -5,-3.5 -21,0" fill={isLight ? '#78716C' : '#CBD5E1'} />

          {/* 4 Secondary Ordinal Points (NE, NW, SE, SW) */}
          <polygon points="0,0 -2.5,-2 11,-11" fill={compassColor} opacity="0.8" />
          <polygon points="0,0 2,-2.5 11,-11" fill={isLight ? '#78716C' : '#CBD5E1'} opacity="0.8" />

          <polygon points="0,0 -2,-2.5 -11,-11" fill={compassColor} opacity="0.8" />
          <polygon points="0,0 2.5,-2 -11,-11" fill={isLight ? '#78716C' : '#CBD5E1'} opacity="0.8" />

          <polygon points="0,0 2.5,2 11,11" fill={compassColor} opacity="0.8" />
          <polygon points="0,0 -2,2.5 11,11" fill={isLight ? '#78716C' : '#CBD5E1'} opacity="0.8" />

          <polygon points="0,0 2,2.5 -11,11" fill={compassColor} opacity="0.8" />
          <polygon points="0,0 -2.5,2 -11,11" fill={isLight ? '#78716C' : '#CBD5E1'} opacity="0.8" />

          {/* Center Brass Pivot Dot */}
          <circle cx="0" cy="0" r="3" fill="#F59E0B" stroke="#92400E" strokeWidth="0.8" />
          <circle cx="-0.8" cy="-0.8" r="1" fill="#FEF08A" />
        </g>

        {/* ================================================================= */}
        {/* 7. DYNAMIC 3D INDIAN NATIONAL TRICOLOR WAVE RIBBON                */}
        {/* Saffron, White, and Emerald Green ribbon sweeping across base     */}
        {/* ================================================================= */}
        <g id="tricolor-ribbon-wave">
          {/* SAFFRON (Orange) Wave */}
          <path
            d="M12 165 C35 162 70 148 105 120 C130 99 155 115 178 135 C205 158 240 167 278 165 C320 163 365 152 405 132 C425 122 442 108 454 90 C452 94 440 114 416 128 C375 152 328 167 282 169 C242 171 206 162 178 140 C154 122 134 108 110 126 C78 152 45 167 12 165 Z"
            fill="url(#saffronWave)"
          />

          {/* CRISP WHITE Wave (with soft border shadow for contrast) */}
          <path
            d="M14 169 C38 167 74 153 108 126 C134 106 158 121 182 141 C209 164 244 172 282 170 C324 168 369 157 410 137 C428 128 444 114 456 98 C454 102 442 120 420 134 C380 157 334 172 286 174 C246 176 210 167 182 146 C158 128 138 114 114 132 C82 157 48 171 14 169 Z"
            fill="url(#whiteWave)"
            stroke={isLight ? 'none' : '#E2E8F0'}
            strokeWidth="0.3"
          />

          {/* SACRED EMERALD GREEN Wave */}
          <path
            d="M16 174 C42 172 78 158 112 132 C138 112 162 127 186 147 C214 170 249 178 288 176 C330 174 375 163 416 143 C432 135 448 122 458 106 C455 111 444 128 424 142 C385 164 340 178 292 180 C250 182 214 173 186 152 C162 134 142 120 118 138 C86 163 52 177 16 174 Z"
            fill="url(#greenWave)"
          />
        </g>
      </svg>
    </div>
  );
};
