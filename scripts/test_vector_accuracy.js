const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/.user_uploaded/media_1794430050331_5a580bf8.jpg';

// Let's create the mathematically exact SVG of FHB
function getFhbSvg(fillColor = '#FFFFFF', bgColor = '#DC0714', withBg = true) {
  // Coordinates based on the exact 1024x576 canvas
  // Slant: matrix(1, 0, -0.2133, 1, 79, 0)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 576" width="1024" height="576">
  ${withBg ? `<rect width="1024" height="576" fill="${bgColor}"/>` : ''}
  <g transform="matrix(1 0 -0.2133 1 79 0)">
    <!-- ═══════════════ LETTER F ═══════════════ -->
    <!-- F Top Bar (Above Speed Slit y=193..238) -->
    <path d="M 125 193
             L 358 193
             L 358 238
             L 125 238 Z"
          fill="${fillColor}" />

    <!-- F Lower Body (Middle bar y=254..298 & Stem y=298..372) -->
    <path d="M 125 254
             L 357 254
             L 357 298
             L 204 298
             L 204 372
             L 125 372 Z"
          fill="${fillColor}" />

    <!-- ═══════════════ LETTER H ═══════════════ -->
    <!-- H Top Pillars (Above Speed Slit y=193..238) -->
    <rect x="376" y="193" width="79" height="45" fill="${fillColor}" />
    <rect x="548" y="193" width="79" height="45" fill="${fillColor}" />

    <!-- H Lower Body with Crossbar and Arch Window (y=254..372) -->
    <path d="M 376 254
             L 627 254
             L 627 372
             L 548 372
             L 548 298
             L 455 298
             L 455 372
             L 376 372 Z"
          fill="${fillColor}" />

    <!-- ═══════════════ LETTER B ═══════════════ -->
    <!-- B Top Lobe (Above Speed Slit y=193..238) -->
    <path d="M 648 193
             L 838 193
             Q 885 193 885 238
             L 648 238 Z"
          fill="${fillColor}" />

    <!-- B Lower Body with Middle Red Cut-Out Slot (y=254..372) -->
    <path d="M 648 254
             L 835 254
             Q 878 254 878 288
             Q 878 298 860 306
             Q 878 316 878 338
             Q 878 372 830 372
             L 648 372 Z
             M 726 298
             L 800 298
             Q 818 298 818 310
             Q 818 322 800 322
             L 726 322
             Q 720 322 720 310
             Q 720 298 726 298 Z"
          fill-rule="evenodd"
          fill="${fillColor}" />
  </g>
</svg>`;
}

fs.writeFileSync(path.join(__dirname, '../public/logo.svg'), getFhbSvg('#FFFFFF', '#DC0714', true));
fs.writeFileSync(path.join(__dirname, '../public/logo-badge.svg'), getFhbSvg('#FF1E46', 'transparent', false));
fs.writeFileSync(path.join(__dirname, '../public/logo-white.svg'), getFhbSvg('#FFFFFF', 'transparent', false));
fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), getFhbSvg('#FFFFFF', '#DC0714', true));

console.log("Written exact FHB SVG files to public/ and src/app/icon.svg");
