const fs = require('fs');
const path = require('path');

// Mathematically perfect, broadcast-grade Football Hub Bangladesh (FHB) Official Shield Crest
function getFhbShieldSvg({ size = 240, hasGlow = true } = {}) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 236" width="${size}" height="${Math.round(size * 1.18)}">
  <defs>
    <!-- Background Shield Gradient -->
    <linearGradient id="fhbBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#161B2E"/>
      <stop offset="45%" stop-color="#0E1324"/>
      <stop offset="100%" stop-color="#060913"/>
    </linearGradient>

    <!-- Outer Gold & Crimson Rim -->
    <linearGradient id="fhbRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E46"/>
      <stop offset="25%" stop-color="#FF3B5C"/>
      <stop offset="55%" stop-color="#FBBF24"/>
      <stop offset="80%" stop-color="#FF1E46"/>
      <stop offset="100%" stop-color="#C7002B"/>
    </linearGradient>

    <!-- Crimson Gradient -->
    <linearGradient id="fhbCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF244D"/>
      <stop offset="60%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>

    <!-- Gold Gradient -->
    <linearGradient id="fhbGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="40%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- Ball Shading Gradient -->
    <radialGradient id="ballShade" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="65%" stop-color="#E2E8F0"/>
      <stop offset="90%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </radialGradient>

    ${hasGlow ? `
    <filter id="fhbDropShadow" x="-25%" y="-20%" width="150%" height="145%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#FF1E46" flood-opacity="0.45"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.85"/>
    </filter>
    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#FBBF24" flood-opacity="0.8"/>
    </filter>
    ` : ''}
  </defs>

  <g ${hasGlow ? 'filter="url(#fhbDropShadow)"' : ''}>
    <!-- ── 1. OUTER SHIELD FRAME ── -->
    <!-- Outer Rim -->
    <path d="M 100 10
             C 146 10, 178 16, 186 30
             C 192 78, 186 144, 100 224
             C 14 144, 8 78, 14 30
             C 22 16, 54 10, 100 10 Z"
          fill="url(#fhbRim)" />

    <!-- Inner Shield Dark Plate -->
    <path d="M 100 14.5
             C 143 14.5, 173 20, 180.5 32.5
             C 186 76, 180.5 139, 100 216
             C 19.5 139, 14 76, 19.5 32.5
             C 27 20, 57 14.5, 100 14.5 Z"
          fill="url(#fhbBg)" stroke="rgba(255,255,255,0.12)" stroke-width="1.2" />

    <!-- ── 2. TOP GOLDEN CHAMPION STAR ── -->
    <g ${hasGlow ? 'filter="url(#starGlow)"' : ''}>
      <polygon points="100,22 103,30.5 112,30.5 105,35.5 107.5,44 100,39.2 92.5,44 95,35.5 88,30.5 97,30.5" 
               fill="url(#fhbGold)" />
    </g>

    <!-- ── 3. ATHLETIC VICTORY WINGS / BENGAL CLAWS ── -->
    <!-- Left Wing -->
    <path d="M 28 58
             C 28 106, 50 146, 86 164
             C 72 150, 48 122, 46 76
             L 28 58 Z"
          fill="url(#fhbCrimson)" />
    <!-- Left Wing Gold Tip -->
    <path d="M 28 58 L 41 58 C 38 68, 33 79, 29 88 Z" fill="url(#fhbGold)" />

    <!-- Right Wing -->
    <path d="M 172 58
             C 172 106, 150 146, 114 164
             C 128 150, 152 122, 154 76
             L 172 58 Z"
          fill="url(#fhbCrimson)" />
    <!-- Right Wing Gold Tip -->
    <path d="M 172 58 L 159 58 C 162 68, 167 79, 171 88 Z" fill="url(#fhbGold)" />

    <!-- ── 4. MATHEMATICALLY PERFECT SOCCER BALL ── -->
    <g transform="translate(100, 102)">
      <!-- Ball Base Sphere -->
      <circle cx="0" cy="0" r="37" fill="url(#ballShade)" stroke="#090D1A" stroke-width="2.5" />

      <!-- Center Pentagon (FHB Crimson with subtle gold border) -->
      <polygon points="0,-14.5 13.8,-4.5 8.5,11.7 -8.5,11.7 -13.8,-4.5" 
               fill="url(#fhbCrimson)" stroke="#090D1A" stroke-width="2" />

      <!-- Radiating Seam Lines from Center Pentagon Vertices -->
      <line x1="0" y1="-14.5" x2="0" y2="-37" stroke="#090D1A" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="13.8" y1="-4.5" x2="35.2" y2="-11.4" stroke="#090D1A" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="8.5" y1="11.7" x2="21.7" y2="30.0" stroke="#090D1A" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="-8.5" y1="11.7" x2="-21.7" y2="30.0" stroke="#090D1A" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="-13.8" y1="-4.5" x2="-35.2" y2="-11.4" stroke="#090D1A" stroke-width="2.2" stroke-linecap="round"/>

      <!-- Outer Facet Dark Pentagon Patches -->
      <!-- Top Patch -->
      <path d="M -16 -33.3 L 0 -37 L 16 -33.3 L 13.8 -25 L -13.8 -25 Z" fill="#090D1A" />
      <!-- Top-Right Patch -->
      <path d="M 35.2 -11.4 L 37 0 L 32 18 L 24 9 L 26 -7 Z" fill="#090D1A" />
      <!-- Bottom-Right Patch -->
      <path d="M 21.7 30 L 10 35.6 L -3 36.8 L 3 24 L 14 20 Z" fill="#090D1A" />
      <!-- Bottom-Left Patch -->
      <path d="M -21.7 30 L -10 35.6 L 3 36.8 L -3 24 L -14 20 Z" fill="#090D1A" />
      <!-- Top-Left Patch -->
      <path d="M -35.2 -11.4 L -37 0 L -32 18 L -24 9 L -26 -7 Z" fill="#090D1A" />

      <!-- Ball Edge Highlight Ring -->
      <circle cx="0" cy="0" r="36" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
    </g>

    <!-- ── 5. LOWER FHB MONOGRAM RIBBON PLAQUE ── -->
    <g transform="translate(100, 172)">
      <!-- Red Plaque Base -->
      <path d="M -48 -13 
               L 48 -13 
               C 44 8, 30 18, 0 23
               C -30 18, -44 8, -48 -13 Z" 
            fill="url(#fhbCrimson)" stroke="url(#fhbGold)" stroke-width="1.8" />

      <!-- Gold Top Trim on Plaque -->
      <line x1="-46" y1="-13" x2="46" y2="-13" stroke="url(#fhbGold)" stroke-width="2.5" />

      <!-- FHB Monogram Text -->
      <text x="0" y="4.5" 
            text-anchor="middle" 
            font-family="'Antipasto Pro', 'Barlow Condensed', sans-serif" 
            font-size="17" 
            font-weight="900" 
            letter-spacing="3" 
            fill="#FFFFFF">FHB</text>
    </g>

    <!-- ── 6. BOTTOM BANGLADESH GOLDEN ACCENT STAR ── -->
    <polygon points="100,201 101.5,205 106,205 102.5,207.5 104,212 100,209.5 96,212 97.5,207.5 94,205 98.5,205" 
             fill="url(#fhbGold)" />
  </g>
</svg>
`.trim();
}

// Generate the SVG files
const svgContent = getFhbShieldSvg({ size: 240, hasGlow: true });
fs.writeFileSync(path.resolve('public/logo.svg'), svgContent);
fs.writeFileSync(path.resolve('public/icon.svg'), svgContent);
console.log('Successfully written public/logo.svg and public/icon.svg');

// Generate Horizontal Lockup (public/logo-horizontal.svg)
const horizontalSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 70" width="340" height="70">
  <defs>
    <!-- Background Shield Gradient -->
    <linearGradient id="hBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#161B2E"/>
      <stop offset="100%" stop-color="#060913"/>
    </linearGradient>
    <linearGradient id="hRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E46"/>
      <stop offset="45%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>
    <linearGradient id="hCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF244D"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>
    <linearGradient id="hGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>

  <!-- Left: Shield Emblem -->
  <g transform="translate(6, 4) scale(0.26)">
    <!-- Outer Shield Border -->
    <path d="M 100 10 C 146 10, 178 16, 186 30 C 192 78, 186 144, 100 224 C 14 144, 8 78, 14 30 C 22 16, 54 10, 100 10 Z" fill="url(#hRim)" />
    <!-- Inner Shield Dark Plate -->
    <path d="M 100 14.5 C 143 14.5, 173 20, 180.5 32.5 C 186 76, 180.5 139, 100 216 C 19.5 139, 14 76, 19.5 32.5 C 27 20, 57 14.5, 100 14.5 Z" fill="url(#hBg)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
    <!-- Top Star -->
    <polygon points="100,22 103,30.5 112,30.5 105,35.5 107.5,44 100,39.2 92.5,44 95,35.5 88,30.5 97,30.5" fill="url(#hGold)" />
    <!-- Wings -->
    <path d="M 28 58 C 28 106, 50 146, 86 164 C 72 150, 48 122, 46 76 L 28 58 Z" fill="url(#hCrimson)" />
    <path d="M 172 58 C 172 106, 150 146, 114 164 C 128 150, 152 122, 154 76 L 172 58 Z" fill="url(#hCrimson)" />
    <!-- Soccer Ball -->
    <g transform="translate(100, 102)">
      <circle cx="0" cy="0" r="37" fill="#F8FAFC" stroke="#090D1A" stroke-width="2.5" />
      <polygon points="0,-14.5 13.8,-4.5 8.5,11.7 -8.5,11.7 -13.8,-4.5" fill="url(#hCrimson)" stroke="#090D1A" stroke-width="2" />
      <line x1="0" y1="-14.5" x2="0" y2="-37" stroke="#090D1A" stroke-width="2.2"/>
      <line x1="13.8" y1="-4.5" x2="35.2" y2="-11.4" stroke="#090D1A" stroke-width="2.2"/>
      <line x1="8.5" y1="11.7" x2="21.7" y2="30.0" stroke="#090D1A" stroke-width="2.2"/>
      <line x1="-8.5" y1="11.7" x2="-21.7" y2="30.0" stroke="#090D1A" stroke-width="2.2"/>
      <line x1="-13.8" y1="-4.5" x2="-35.2" y2="-11.4" stroke="#090D1A" stroke-width="2.2"/>
    </g>
    <!-- FHB Ribbon -->
    <g transform="translate(100, 172)">
      <path d="M -48 -13 L 48 -13 C 44 8, 30 18, 0 23 C -30 18, -44 8, -48 -13 Z" fill="url(#hCrimson)" stroke="url(#hGold)" stroke-width="1.8" />
      <text x="0" y="4.5" text-anchor="middle" font-family="'Antipasto Pro', sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#FFFFFF">FHB</text>
    </g>
  </g>

  <!-- Right: Typography Lockup -->
  <g transform="translate(70, 32)">
    <!-- Primary Headline -->
    <text x="0" y="0" font-family="'Antipasto Pro', -apple-system, sans-serif" font-size="23" font-weight="900" letter-spacing="1.5" fill="#FFFFFF">
      FOOTBALL HUB
    </text>

    <!-- Subtitle / National Mark -->
    <g transform="translate(0, 17)">
      <!-- Bangladesh Pill / Badge -->
      <rect x="0" y="-11" width="84" height="15" rx="3" fill="rgba(255,30,70,0.15)" stroke="rgba(255,30,70,0.4)" stroke-width="1"/>
      <text x="6" y="0.5" font-family="'Antipasto Pro', sans-serif" font-size="8.5" font-weight="800" letter-spacing="2.8" fill="#FF1E46">
        BANGLADESH
      </text>

      <!-- Live Broadcast Dot / National Sun -->
      <circle cx="102" cy="-4" r="3.5" fill="#FBBF24" />
      <text x="112" y="0.5" font-family="'Antipasto Pro', sans-serif" font-size="9" font-weight="700" letter-spacing="2" fill="#94A3B8">
        LIVE &amp; SCORES
      </text>
    </g>
  </g>
</svg>
`.trim();

fs.writeFileSync(path.resolve('public/logo-horizontal.svg'), horizontalSvg);
console.log('Successfully written public/logo-horizontal.svg');
