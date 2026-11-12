const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Variation 1: The Modern Bengal Football Shield (Institutional, Premier League / UEFA style athletic crest)
// Features: Sleek crest contour, Bengal tiger claw / speed cuts forming 'FHB', faceted geometric soccer ball, golden star
const logoV1 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="100%" height="100%">
  <defs>
    <!-- Background Shield Gradient -->
    <linearGradient id="shieldBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#180C14"/>
      <stop offset="50%" stop-color="#0E1322"/>
      <stop offset="100%" stop-color="#070A12"/>
    </linearGradient>

    <!-- Outer Glow Border Gradient -->
    <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E46"/>
      <stop offset="45%" stop-color="#FF5364"/>
      <stop offset="75%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>

    <!-- Crimson Flame Gradient -->
    <linearGradient id="crimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF2E56"/>
      <stop offset="60%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>

    <!-- Gold Accent Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="40%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <!-- Chrome Silver Gradient -->
    <linearGradient id="silverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>

    <!-- Ball Core Gradient -->
    <radialGradient id="ballGlow" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="45%" stop-color="#E2E8F0"/>
      <stop offset="85%" stop-color="#CBD5E1"/>
      <stop offset="100%" stop-color="#64748B"/>
    </radialGradient>

    <!-- Filter for subtle drop shadow -->
    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#FF1E46" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <g filter="url(#badgeShadow)">
    <!-- Outer Shield Rim -->
    <path d="M 120 18 
             C 165 18, 198 26, 204 40
             C 208 85, 200 148, 120 220
             C 40 148, 32 85, 36 40
             C 42 26, 75 18, 120 18 Z" 
          fill="url(#shieldBorder)" />

    <!-- Inner Shield Dark Plate -->
    <path d="M 120 23
             C 162 23, 193 30.5, 198.5 43
             C 202 85, 194.5 144, 120 213
             C 45.5 144, 38 85, 41.5 43
             C 47 30.5, 78 23, 120 23 Z" 
          fill="url(#shieldBg)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />

    <!-- Top Crown Star (National Football Ambition) -->
    <polygon points="120,33 123.5,41.5 132.5,42 125.5,47.5 128,56.5 120,51.5 112,56.5 114.5,47.5 107.5,42 116.5,41.5" 
             fill="url(#goldGrad)" />

    <!-- Stylized Football Geometry (Center-Right Hexagon / Pentagon System) -->
    <!-- Geometric Football Base Sphere (Subtle outline) -->
    <circle cx="132" cy="120" r="46" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />

    <!-- The 'F' Monogram sculpted as Tiger Claw / Dynamic Aerodynamic Blades -->
    <!-- Blade 1: Vertical Backbone of the 'F' -->
    <path d="M 68 56
             L 86 56
             C 86 95, 84 135, 78 168
             L 62 168
             C 66 132, 68 94, 68 56 Z"
          fill="url(#crimsonGrad)" />

    <!-- Blade 2: Top Horizontal Bar of 'F' (Extending toward star/ball) -->
    <path d="M 78 56
             L 165 56
             C 152 68, 135 73, 98 73
             L 78 73 Z"
          fill="url(#crimsonGrad)" />

    <!-- Blade 3: Middle Aerodynamic Slash of 'F' (Pointing into Football center) -->
    <path d="M 76 96
             L 118 96
             C 126 104, 126 110, 114 113
             L 74 113 Z"
          fill="url(#goldGrad)" />

    <!-- Center Soccer Ball Pentagon & Panels -->
    <!-- Center Pentagon -->
    <polygon points="138,102 154,113 148,131 128,131 122,113" 
             fill="#0F172A" stroke="url(#silverGrad)" stroke-width="2" />
    <!-- Panel Lines radiating outward -->
    <!-- Top-Right Panel -->
    <path d="M 138 102 L 142 80" stroke="url(#silverGrad)" stroke-width="2" stroke-linecap="round"/>
    <!-- Right Panel -->
    <path d="M 154 113 L 174 118" stroke="url(#silverGrad)" stroke-width="2" stroke-linecap="round"/>
    <!-- Bottom-Right Panel -->
    <path d="M 148 131 L 160 152" stroke="url(#silverGrad)" stroke-width="2" stroke-linecap="round"/>
    <!-- Bottom-Left Panel -->
    <path d="M 128 131 L 115 150" stroke="url(#silverGrad)" stroke-width="2" stroke-linecap="round"/>
    <!-- Top-Left Panel -->
    <path d="M 122 113 L 105 106" stroke="url(#silverGrad)" stroke-width="2" stroke-linecap="round"/>

    <!-- Subtle Dynamic Speed Curves underneath ball -->
    <path d="M 88 178 C 108 190, 132 186, 152 172" 
          fill="none" stroke="url(#crimsonGrad)" stroke-width="3.5" stroke-linecap="round"/>
  </g>
</svg>
`;

// Variation 2: Pure Icon Standalone — "The Velocity Football Hub" (Super modern, scalable, minimalist & athletic like Juventus / FIFA / Sofascore)
// Features: A hyper-crafted modern soccer ball transitioning into dynamic athletic 'F' blades with golden Bangladesh spark.
const logoV2 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="100%" height="100%">
  <defs>
    <linearGradient id="v2Red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF244D"/>
      <stop offset="60%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>

    <linearGradient id="v2Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <linearGradient id="v2White" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>

    <filter id="v2Glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#FF1E46" flood-opacity="0.4"/>
    </filter>
  </defs>

  <g filter="url(#v2Glow)">
    <!-- Aerodynamic Badge Base: Rounded Hex-Shield in Sleek Midnight Blue/Black -->
    <rect x="20" y="20" width="200" height="200" rx="48" fill="#0A0E1A" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
    
    <!-- Ambient Red Radial Glow inside badge -->
    <circle cx="120" cy="120" r="75" fill="none" stroke="rgba(255,30,70,0.12)" stroke-width="28" />

    <!-- The FHB Icon Group: Monogram 'F' + Dynamic Football -->
    <!-- Spine of the 'F' (Slanted Athletic Column) -->
    <path d="M 64 60 
             L 90 60 
             L 76 180 
             L 50 180 Z" 
          fill="url(#v2Red)" />

    <!-- Top Blade of 'F' (Shooting Right with Aerodynamic Bevel) -->
    <path d="M 84 60 
             L 174 60 
             L 160 84 
             L 81 84 Z" 
          fill="url(#v2Red)" />

    <!-- Middle Blade of 'F' with Gold Energy Slash -->
    <path d="M 76 106 
             L 138 106 
             L 126 128 
             L 73 128 Z" 
          fill="url(#v2Gold)" />

    <!-- Geometric Soccer Ball Facet (Docked in upper right quadrant) -->
    <!-- Ball Outer Orbit -->
    <circle cx="152" cy="136" r="34" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2.5" />

    <!-- Center Pentagon of the ball -->
    <polygon points="152,122 165,131 160,146 144,146 139,131" fill="#FFFFFF" />

    <!-- Radiating Seam lines connecting to outer orbit -->
    <line x1="152" y1="122" x2="152" y2="104" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="165" y1="131" x2="182" y2="136" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="160" y1="146" x2="171" y2="162" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="144" y1="146" x2="133" y2="162" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="139" y1="131" x2="122" y2="136" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Bangladesh Golden Star accent at top right -->
    <polygon points="186,40 189,48 197,48 191,53 193,61 186,56 179,61 181,53 175,48 183,48" 
             fill="url(#v2Gold)" />
  </g>
</svg>
`;

// Variation 3: Broadcast Grade "Apex Crest" (Super sleek, modern European & Asian club aesthetic, clean contours, razor sharp at any size)
const logoV3 = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="100%" height="100%">
  <defs>
    <!-- Background Shield Gradient -->
    <linearGradient id="v3Plate" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141824"/>
      <stop offset="100%" stop-color="#080B12"/>
    </linearGradient>

    <linearGradient id="v3Red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF244D"/>
      <stop offset="100%" stop-color="#D90429"/>
    </linearGradient>

    <linearGradient id="v3Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>

    <linearGradient id="v3Border" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E46"/>
      <stop offset="50%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>

    <filter id="v3Shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#FF1E46" flood-opacity="0.3"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <g filter="url(#v3Shadow)">
    <!-- Modern Hex-Shield Badge Outer Rim -->
    <path d="M 120 16
             L 204 54
             L 204 136
             C 204 178, 168 214, 120 226
             C 72 214, 36 178, 36 136
             L 36 54 Z"
          fill="url(#v3Border)" />

    <!-- Inner Dark Plate -->
    <path d="M 120 21
             L 199 57
             L 199 135
             C 199 174, 165 208, 120 220
             C 75 208, 41 174, 41 135
             L 41 57 Z"
          fill="url(#v3Plate)" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />

    <!-- Top Ribbon / Star Accent -->
    <polygon points="120,30 123.5,39 133,39 125.5,45 128,54 120,49 112,54 114.5,45 107,39 116.5,39" 
             fill="url(#v3Gold)" />

    <!-- Dynamic Soccer Ball in Upper Section -->
    <g transform="translate(120, 114)">
      <!-- Outer Orbit Seams -->
      <circle cx="0" cy="0" r="44" fill="#0C101B" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
      
      <!-- Iconic White/Crimson Football Panels -->
      <!-- Center Core Pentagon -->
      <polygon points="0,-16 15,-5 9,13 -9,13 -15,-5" fill="url(#v3Red)" stroke="#FFFFFF" stroke-width="2"/>

      <!-- Surrounding Radiating Panels -->
      <!-- Top -->
      <polygon points="0,-16 -15,-5 -18,-24 0,-34 18,-24 15,-5" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
      <!-- Bottom-Left -->
      <polygon points="-15,-5 -9,13 -26,22 -38,10 -35,-10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
      <!-- Bottom-Right -->
      <polygon points="15,-5 9,13 26,22 38,10 35,-10" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
      <!-- Bottom -->
      <polygon points="-9,13 9,13 14,33 0,40 -14,33" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round"/>
    </g>

    <!-- Prominent 'FHB' Athletic Monogram Ribbon at Lower Base -->
    <g transform="translate(120, 182)">
      <!-- Red Ribbon Pill -->
      <rect x="-64" y="-14" width="128" height="26" rx="6" fill="url(#v3Red)" />
      <!-- Gold Edge Accents -->
      <line x1="-64" y1="-14" x2="-64" y2="12" stroke="url(#v3Gold)" stroke-width="3"/>
      <line x1="64" y1="-14" x2="64" y2="12" stroke="url(#v3Gold)" stroke-width="3"/>
      
      <!-- FHB Text inside ribbon -->
      <text x="0" y="5" 
            text-anchor="middle" 
            font-family="'Antipasto Pro', 'Barlow Condensed', sans-serif" 
            font-size="18" 
            font-weight="900" 
            letter-spacing="3" 
            fill="#FFFFFF">FHB</text>
    </g>
  </g>
</svg>
`;

// HTML preview template
const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Antipasto Pro';
    src: url('../public/fonts/antipasto/AntipastoPro-Bold_trial.ttf');
  }
  body {
    margin: 0;
    padding: 40px;
    background: #06080F;
    color: #F8FAFC;
    font-family: 'Antipasto Pro', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  h1 {
    font-size: 28px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 8px;
    color: #FFFFFF;
  }
  p.subtitle {
    color: #94A3B8;
    font-size: 14px;
    margin-bottom: 40px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  .card {
    background: #0C101B;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .card-desc {
    font-size: 12px;
    color: #64748B;
    margin-bottom: 24px;
    text-align: center;
  }
  .logo-box {
    width: 180px;
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }
  .scales {
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(255,255,255,0.03);
    padding: 12px 20px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 20px;
  }
  .lockup-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #06080F;
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.06);
    width: 100%;
    box-sizing: border-box;
  }
  .lockup-text {
    display: flex;
    flex-direction: column;
  }
  .lockup-brand {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: #FFFFFF;
    line-height: 1;
  }
  .lockup-sub {
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 3px;
    color: #94A3B8;
    text-transform: uppercase;
    margin-top: 4px;
    line-height: 1;
  }
</style>
</head>
<body>
  <h1>Football Hub Bangladesh (FHB) — Official Identity Design Options</h1>
  <p class="subtitle">Broadcast-Grade Visual Marks · Vector Precision · Tested at 16px Favicon, 32px Navbar & 180px Display</p>

  <div class="grid">
    <!-- Option 1 -->
    <div class="card">
      <div class="card-title" style="color: #FF1E46;">Option 1: The Bengal Shield</div>
      <div class="card-desc">Athletic football shield, Bengal speed cuts forming 'F', geometric ball core & golden star</div>
      <div class="logo-box">${logoV1}</div>
      <div class="scales">
        <span style="font-size: 11px; color: #64748B;">Sizes:</span>
        <div style="width: 48px; height: 48px;">${logoV1}</div>
        <div style="width: 32px; height: 32px;">${logoV1}</div>
        <div style="width: 20px; height: 20px;">${logoV1}</div>
      </div>
      <div class="lockup-preview">
        <div style="width: 32px; height: 32px;">${logoV1}</div>
        <div class="lockup-text">
          <span class="lockup-brand">FOOTBALL HUB</span>
          <span class="lockup-sub">BANGLADESH</span>
        </div>
      </div>
    </div>

    <!-- Option 2 -->
    <div class="card">
      <div class="card-title" style="color: #FBBF24;">Option 2: Velocity Monogram</div>
      <div class="card-desc">Sleek squircle badge, athletic speed blades 'F', orbiting soccer star & golden spark</div>
      <div class="logo-box">${logoV2}</div>
      <div class="scales">
        <span style="font-size: 11px; color: #64748B;">Sizes:</span>
        <div style="width: 48px; height: 48px;">${logoV2}</div>
        <div style="width: 32px; height: 32px;">${logoV2}</div>
        <div style="width: 20px; height: 20px;">${logoV2}</div>
      </div>
      <div class="lockup-preview">
        <div style="width: 32px; height: 32px;">${logoV2}</div>
        <div class="lockup-text">
          <span class="lockup-brand">FOOTBALL HUB</span>
          <span class="lockup-sub">BANGLADESH</span>
        </div>
      </div>
    </div>

    <!-- Option 3 -->
    <div class="card">
      <div class="card-title" style="color: #38BDF8;">Option 3: Broadcast Apex Crest</div>
      <div class="card-desc">Hex-shield contour, multi-faceted classic football, golden champion star & FHB banner</div>
      <div class="logo-box">${logoV3}</div>
      <div class="scales">
        <span style="font-size: 11px; color: #64748B;">Sizes:</span>
        <div style="width: 48px; height: 48px;">${logoV3}</div>
        <div style="width: 32px; height: 32px;">${logoV3}</div>
        <div style="width: 20px; height: 20px;">${logoV3}</div>
      </div>
      <div class="lockup-preview">
        <div style="width: 32px; height: 32px;">${logoV3}</div>
        <div class="lockup-text">
          <span class="lockup-brand">FOOTBALL HUB</span>
          <span class="lockup-sub">BANGLADESH</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.resolve('scripts/logo_preview.html'), html);
console.log('Preview HTML written to scripts/logo_preview.html');
