const fs = require('fs');
const path = require('path');

// M1: The Master Athletic Shield
// Broadcast-grade institutional football shield with golden crown star, 3D faceted soccer ball, victory speed wings, and FHB ribbon
const masterShield = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="100%" height="100%">
  <defs>
    <!-- Background Shield Gradient -->
    <linearGradient id="m1Bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#181D2D"/>
      <stop offset="50%" stop-color="#0E1322"/>
      <stop offset="100%" stop-color="#070913"/>
    </linearGradient>

    <!-- Outer Gold & Crimson Rim -->
    <linearGradient id="m1Rim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E46"/>
      <stop offset="35%" stop-color="#FF4365"/>
      <stop offset="65%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>

    <!-- Crimson Gradient -->
    <linearGradient id="m1Crimson" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF244D"/>
      <stop offset="100%" stop-color="#C7002B"/>
    </linearGradient>

    <!-- Gold Gradient -->
    <linearGradient id="m1Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <filter id="m1Glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#FF1E46" flood-opacity="0.38"/>
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <g filter="url(#m1Glow)">
    <!-- Outer Shield Border -->
    <path d="M 100 12
             C 145 12, 178 18, 186 32
             C 192 78, 186 142, 100 224
             C 14 142, 8 78, 14 32
             C 22 18, 55 12, 100 12 Z"
          fill="url(#m1Rim)" />

    <!-- Inner Shield Face -->
    <path d="M 100 16
             C 142 16, 173 21.5, 180.5 34.5
             C 186 77, 180.5 138, 100 217
             C 19.5 138, 14 77, 19.5 34.5
             C 27 21.5, 58 16, 100 16 Z"
          fill="url(#m1Bg)" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />

    <!-- Top Star (Bangladesh Football Ambition) -->
    <polygon points="100,24 103,32 111,32 104.5,37 107,45 100,40.5 93,45 95.5,37 89,32 97,32" 
             fill="url(#m1Gold)" />

    <!-- Victory Speed Wings (Embracing the football) -->
    <!-- Left Wing (Tiger Stripe Swoosh) -->
    <path d="M 32 64
             C 32 110, 52 148, 86 166
             C 74 154, 52 126, 50 82
             L 32 64 Z"
          fill="url(#m1Crimson)" />

    <!-- Right Wing (Tiger Stripe Swoosh) -->
    <path d="M 168 64
             C 168 110, 148 148, 114 166
             C 126 154, 148 126, 150 82
             L 168 64 Z"
          fill="url(#m1Crimson)" />

    <!-- Gold Accent Tips on Wings -->
    <path d="M 32 64 L 44 64 C 42 74, 38 84, 34 94 Z" fill="url(#m1Gold)" />
    <path d="M 168 64 L 156 64 C 158 74, 162 84, 166 94 Z" fill="url(#m1Gold)" />

    <!-- Center Soccer Ball -->
    <g transform="translate(100, 106)">
      <!-- Ball Base Sphere -->
      <circle cx="0" cy="0" r="38" fill="#F8FAFC" />
      <circle cx="0" cy="0" r="38" fill="none" stroke="#0F172A" stroke-width="2.5" />

      <!-- Center Pentagon (FHB Crimson) -->
      <polygon points="0,-14 13.3,-4.3 8.2,11.3 -8.2,11.3 -13.3,-4.3" 
               fill="url(#m1Crimson)" stroke="#0F172A" stroke-width="2" />

      <!-- 5 Surrounding Black/Navy Pentagonal Seam Patches -->
      <!-- Top Seam -->
      <polygon points="0,-14 13.3,-4.3 18,-18 0,-28 -18,-18 -13.3,-4.3" 
               fill="#0F172A" stroke="#0F172A" stroke-width="1.5" />
      <!-- Top-Right Seam -->
      <polygon points="13.3,-4.3 8.2,11.3 22,20 33,8 28,-10" 
               fill="#0F172A" stroke="#0F172A" stroke-width="1.5" />
      <!-- Bottom-Right Seam -->
      <polygon points="8.2,11.3 -8.2,11.3 -6,28 10,34 22,20" 
               fill="#0F172A" stroke="#0F172A" stroke-width="1.5" />
      <!-- Bottom-Left Seam -->
      <polygon points="-8.2,11.3 -13.3,-4.3 -28,-10 -33,8 -22,20" 
               fill="#0F172A" stroke="#0F172A" stroke-width="1.5" />
      <!-- Top-Left Seam -->
      <polygon points="-8.2,11.3 0,28 -10,34 -22,20" 
               fill="#0F172A" stroke="#0F172A" stroke-width="1.5" />

      <!-- Ball Edge Clip/Shading -->
      <circle cx="0" cy="0" r="38" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    </g>

    <!-- FHB Brand Pill / Plaque at Base -->
    <g transform="translate(100, 176)">
      <!-- Red Badge -->
      <path d="M -46 -12 
               L 46 -12 
               C 42 6, 28 16, 0 20
               C -28 16, -42 6, -46 -12 Z" 
            fill="url(#m1Crimson)" stroke="url(#m1Gold)" stroke-width="1.5" />

      <!-- FHB Monogram Text -->
      <text x="0" y="3" 
            text-anchor="middle" 
            font-family="'Antipasto Pro', 'Barlow Condensed', sans-serif" 
            font-size="16" 
            font-weight="900" 
            letter-spacing="2.5" 
            fill="#FFFFFF">FHB</text>
    </g>
  </g>
</svg>
`;

// M2: Modern Football Roundel (Premier League / Manchester City / Inter Milan style circular badge)
const masterRoundel = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="100%" height="100%">
  <defs>
    <linearGradient id="rBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141926"/>
      <stop offset="100%" stop-color="#080B13"/>
    </linearGradient>

    <linearGradient id="rRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E46"/>
      <stop offset="40%" stop-color="#FBBF24"/>
      <stop offset="70%" stop-color="#FF1E46"/>
      <stop offset="100%" stop-color="#E11D48"/>
    </linearGradient>

    <linearGradient id="rGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="60%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <linearGradient id="rRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF244D"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>

    <filter id="rShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#FF1E46" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.8"/>
    </filter>

    <!-- Circular text path -->
    <path id="textPathTop" d="M 30,110 A 80,80 0 0,1 190,110" />
    <path id="textPathBottom" d="M 190,110 A 80,80 0 0,1 30,110" />
  </defs>

  <g filter="url(#rShadow)">
    <!-- Outer Rim -->
    <circle cx="110" cy="110" r="98" fill="url(#rRim)" />
    <!-- Outer Dark Ring -->
    <circle cx="110" cy="110" r="94" fill="#0A0E1A" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />
    <!-- Inner Crimson Ring -->
    <circle cx="110" cy="110" r="66" fill="url(#rRim)" />
    <!-- Center Core Plate -->
    <circle cx="110" cy="110" r="63" fill="url(#rBg)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

    <!-- Circular Brand Text -->
    <!-- Top Arc: FOOTBALL HUB -->
    <text font-family="'Antipasto Pro', sans-serif" font-size="12.5" font-weight="800" fill="#FFFFFF" letter-spacing="3.5">
      <textPath href="#textPathTop" startOffset="50%" text-anchor="middle">
        FOOTBALL HUB
      </textPath>
    </text>

    <!-- Bottom Arc: BANGLADESH -->
    <text font-family="'Antipasto Pro', sans-serif" font-size="10.5" font-weight="700" fill="url(#rGold)" letter-spacing="4">
      <textPath href="#textPathBottom" startOffset="50%" text-anchor="middle">
        BANGLADESH
      </textPath>
    </text>

    <!-- Left & Right Gold Star Dividers -->
    <polygon points="26,110 28,114 33,114 29,117 31,121 26,118 22,121 24,117 20,114 24,114" fill="url(#rGold)" />
    <polygon points="194,110 196,114 201,114 197,117 199,121 194,118 190,121 192,117 188,114 192,114" fill="url(#rGold)" />

    <!-- Center Icon: Dynamic 3D Soccer Ball + Golden Star -->
    <g transform="translate(110, 110)">
      <!-- Ball sphere -->
      <circle cx="0" cy="4" r="30" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
      <!-- Center Crimson Pentagon -->
      <polygon points="0,-7 10,0 6,12 -6,12 -10,0" fill="url(#rRed)" stroke="#0F172A" stroke-width="1.5" />
      <!-- Seams -->
      <line x1="0" y1="-7" x2="0" y2="-25" stroke="#0F172A" stroke-width="2" />
      <line x1="10" y1="0" x2="25" y2="-6" stroke="#0F172A" stroke-width="2" />
      <line x1="6" y1="12" x2="19" y2="22" stroke="#0F172A" stroke-width="2" />
      <line x1="-6" y1="12" x2="-19" y2="22" stroke="#0F172A" stroke-width="2" />
      <line x1="-10" y1="0" x2="-25" y2="-6" stroke="#0F172A" stroke-width="2" />

      <!-- Top Golden Star -->
      <polygon points="0,-36 2.5,-30 8,-30 3.5,-26 5.5,-20 0,-24 -5.5,-20 -3.5,-26 -8,-30 -2.5,-30" 
               fill="url(#rGold)" />
    </g>
  </g>
</svg>
`;

// M3: The Aerodynamic Bengal Monogram (Hyper-Modern Minimalist, like FotMob / OneFootball / Juventus)
// A razor-sharp geometric monogram where an athletic 'F' embraces a speeding football with Bengal tiger stripes
const masterMinimal = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <linearGradient id="m3Red" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF1E46"/>
      <stop offset="60%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#9F1239"/>
    </linearGradient>

    <linearGradient id="m3Gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="50%" stop-color="#FBBF24"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>

    <filter id="m3Glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#FF1E46" flood-opacity="0.45"/>
    </filter>
  </defs>

  <g filter="url(#m3Glow)">
    <!-- Aerodynamic Squircle Base (Deep Midnight Navy with Crimson Border) -->
    <rect x="14" y="14" width="172" height="172" rx="42" fill="#0A0E1A" stroke="url(#m3Red)" stroke-width="2.5" />

    <!-- Ambient Glow behind ball -->
    <circle cx="128" cy="122" r="40" fill="none" stroke="rgba(255,30,70,0.18)" stroke-width="16" />

    <!-- The Bold Athletic 'F' Monogram -->
    <!-- Backbone Pillar -->
    <path d="M 46 44 
             L 74 44 
             L 58 156 
             L 30 156 Z" 
          fill="url(#m3Red)" />

    <!-- Top Aerodynamic Bar (Extending Right) -->
    <path d="M 66 44 
             L 156 44 
             L 142 68 
             L 63 68 Z" 
          fill="url(#m3Red)" />

    <!-- Middle Golden Slash Bar (Shooting towards football) -->
    <path d="M 59 90 
             L 116 90 
             L 104 112 
             L 56 112 Z" 
          fill="url(#m3Gold)" />

    <!-- Crisp Modern Soccer Ball Core (Docked at lower right) -->
    <g transform="translate(132, 126)">
      <!-- White sphere -->
      <circle cx="0" cy="0" r="30" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
      <!-- Center Crimson Pentagon -->
      <polygon points="0,-11 10.5,-3.4 6.5,8.9 -6.5,8.9 -10.5,-3.4" fill="url(#m3Red)" stroke="#0F172A" stroke-width="1.5" />
      <!-- Seam lines -->
      <line x1="0" y1="-11" x2="0" y2="-29" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
      <line x1="10.5" y1="-3.4" x2="25" y2="-9" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
      <line x1="6.5" y1="8.9" x2="19" y2="20" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
      <line x1="-6.5" y1="8.9" x2="-19" y2="20" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
      <line x1="-10.5" y1="-3.4" x2="-25" y2="-9" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Golden Star at Top Right -->
    <polygon points="166,32 168.5,39 176,39 170,44 172.5,51 166,47 159.5,51 162,44 156,39 163.5,39" 
             fill="url(#m3Gold)" />
  </g>
</svg>
`;

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
    padding: 36px;
    background: #06080F;
    color: #F8FAFC;
    font-family: 'Antipasto Pro', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  h1 {
    font-size: 26px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 6px;
    color: #FFFFFF;
  }
  p.subtitle {
    color: #94A3B8;
    font-size: 13px;
    margin-bottom: 32px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
  .card {
    background: #0C101B;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .card-title {
    font-size: 15px;
    font-weight: 700;
    margin-bottom: 4px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .card-desc {
    font-size: 11.5px;
    color: #64748B;
    margin-bottom: 20px;
    text-align: center;
    min-height: 32px;
  }
  .logo-box {
    width: 170px;
    height: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .scales {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255,255,255,0.03);
    padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 18px;
  }
  .navbar-mockup {
    background: #0B0E17;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    box-sizing: border-box;
  }
  .nav-text {
    display: flex;
    flex-direction: column;
  }
  .nav-title {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 1.2px;
    color: #FFFFFF;
    line-height: 1;
  }
  .nav-sub {
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 2.8px;
    color: #94A3B8;
    text-transform: uppercase;
    margin-top: 3px;
    line-height: 1;
  }
</style>
</head>
<body>
  <h1>Football Hub Bangladesh (FHB) — Master Brand Logo Selection</h1>
  <p class="subtitle">Broadcast Football Standard · High-Contrast Vector Fidelity · Scaled for Favicon (16px), Header (30px) & 4K Crest</p>

  <div class="grid">
    <!-- M1: Master Athletic Shield -->
    <div class="card">
      <div class="card-title" style="color: #FF1E46;">Design A: Master Athletic Shield</div>
      <div class="card-desc">Sleek UEFA/BFL style crest, golden star, victory wings, 32-panel soccer ball & FHB base plaque</div>
      <div class="logo-box">${masterShield}</div>
      <div class="scales">
        <span style="font-size: 10.5px; color: #64748B;">Sizes:</span>
        <div style="width: 44px; height: 50px;">${masterShield}</div>
        <div style="width: 30px; height: 34px;">${masterShield}</div>
        <div style="width: 18px; height: 21px;">${masterShield}</div>
      </div>
      <div class="navbar-mockup">
        <div style="width: 28px; height: 32px;">${masterShield}</div>
        <div class="nav-text">
          <span class="nav-title">FOOTBALL HUB</span>
          <span class="nav-sub">BANGLADESH</span>
        </div>
      </div>
    </div>

    <!-- M2: Modern Football Roundel -->
    <div class="card">
      <div class="card-title" style="color: #FBBF24;">Design B: European Club Roundel</div>
      <div class="card-desc">Premier League circular crest, dual ring typography, golden twin stars & authentic football core</div>
      <div class="logo-box" style="height: 190px;">${masterRoundel}</div>
      <div class="scales">
        <span style="font-size: 10.5px; color: #64748B;">Sizes:</span>
        <div style="width: 44px; height: 44px;">${masterRoundel}</div>
        <div style="width: 30px; height: 30px;">${masterRoundel}</div>
        <div style="width: 20px; height: 20px;">${masterRoundel}</div>
      </div>
      <div class="navbar-mockup">
        <div style="width: 30px; height: 30px;">${masterRoundel}</div>
        <div class="nav-text">
          <span class="nav-title">FOOTBALL HUB</span>
          <span class="nav-sub">BANGLADESH</span>
        </div>
      </div>
    </div>

    <!-- M3: Aerodynamic Monogram -->
    <div class="card">
      <div class="card-title" style="color: #38BDF8;">Design C: Velocity Monogram 'F'</div>
      <div class="card-desc">Hyper-modern sports badge (FotMob style), athletic speed blades forming 'F', soccer ball & gold spark</div>
      <div class="logo-box" style="height: 190px;">${masterMinimal}</div>
      <div class="scales">
        <span style="font-size: 10.5px; color: #64748B;">Sizes:</span>
        <div style="width: 44px; height: 44px;">${masterMinimal}</div>
        <div style="width: 30px; height: 30px;">${masterMinimal}</div>
        <div style="width: 20px; height: 20px;">${masterMinimal}</div>
      </div>
      <div class="navbar-mockup">
        <div style="width: 30px; height: 30px;">${masterMinimal}</div>
        <div class="nav-text">
          <span class="nav-title">FOOTBALL HUB</span>
          <span class="nav-sub">BANGLADESH</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.resolve('scripts/logo_preview2.html'), html);
console.log('Written scripts/logo_preview2.html');
