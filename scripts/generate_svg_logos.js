const fs = require('fs');
const path = require('path');

function generateFHB(isRedBg = true) {
  const bg = isRedBg ? '#E10600' : 'transparent';
  const letterColor = isRedBg ? '#FFFFFF' : '#FF1E46';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 340" width="880" height="340">
  ${isRedBg ? '<rect width="880" height="340" fill="#E10600" rx="16"/>' : ''}
  <g transform="skewX(-13) translate(80, 20)">
    <!-- ═════════ LETTER F ═════════ -->
    <!-- F Top Bar (Above Speed Slit) -->
    <path d="M 120 70
             L 260 70
             L 260 126
             L 100 126
             L 100 90
             Q 100 70 120 70 Z"
          fill="${letterColor}" />

    <!-- F Lower Stem & Middle Bar (Below Speed Slit) -->
    <path d="M 100 144
             L 242 144
             L 242 192
             L 154 192
             L 154 270
             L 100 270 Z"
          fill="${letterColor}" />

    <!-- ═════════ LETTER H ═════════ -->
    <!-- H Left Top Column -->
    <path d="M 284 70 L 340 70 L 340 126 L 284 126 Z" fill="${letterColor}" />
    <!-- H Right Top Column -->
    <path d="M 404 70 L 460 70 L 460 126 L 404 126 Z" fill="${letterColor}" />

    <!-- H Lower Body with Connected Crossbar -->
    <path d="M 284 144
             L 460 144
             L 460 270
             L 404 270
             L 404 198
             L 340 198
             L 340 270
             L 284 270 Z"
          fill="${letterColor}" />

    <!-- ═════════ LETTER B ═════════ -->
    <!-- B Top Lobe (Above Speed Slit) -->
    <path d="M 488 70
             L 600 70
             Q 645 70 645 102
             Q 645 126 620 126
             L 488 126 Z
             M 542 94
             L 590 94
             Q 606 94 606 102
             Q 606 110 590 110
             L 542 110 Z"
          fill-rule="evenodd"
          fill="${letterColor}" />

    <!-- B Bottom Lobe (Below Speed Slit) -->
    <path d="M 488 144
             L 605 144
             Q 655 144 655 186
             Q 655 270 595 270
             L 488 270 Z
             M 542 170
             L 590 170
             Q 608 170 608 195
             Q 608 226 585 226
             L 542 226 Z"
          fill-rule="evenodd"
          fill="${letterColor}" />
  </g>
</svg>`;
}

function generateFBH(isRedBg = true) {
  const bg = isRedBg ? '#E10600' : 'transparent';
  const letterColor = isRedBg ? '#FFFFFF' : '#FF1E46';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 340" width="880" height="340">
  ${isRedBg ? '<rect width="880" height="340" fill="#E10600" rx="16"/>' : ''}
  <g transform="skewX(-13) translate(80, 20)">
    <!-- ═════════ LETTER F ═════════ -->
    <!-- F Top Bar (Above Speed Slit) -->
    <path d="M 120 70
             L 260 70
             L 260 126
             L 100 126
             L 100 90
             Q 100 70 120 70 Z"
          fill="${letterColor}" />

    <!-- F Lower Stem & Middle Bar (Below Speed Slit) -->
    <path d="M 100 144
             L 242 144
             L 242 192
             L 154 192
             L 154 270
             L 100 270 Z"
          fill="${letterColor}" />

    <!-- ═════════ LETTER B ═════════ -->
    <!-- B Top Lobe (Above Speed Slit) -->
    <path d="M 284 70
             L 396 70
             Q 441 70 441 102
             Q 441 126 416 126
             L 284 126 Z
             M 338 94
             L 386 94
             Q 402 94 402 102
             Q 402 110 386 110
             L 338 110 Z"
          fill-rule="evenodd"
          fill="${letterColor}" />

    <!-- B Bottom Lobe (Below Speed Slit) -->
    <path d="M 284 144
             L 401 144
             Q 451 144 451 186
             Q 451 270 391 270
             L 284 270 Z
             M 338 170
             L 386 170
             Q 404 170 404 195
             Q 404 226 381 226
             L 338 226 Z"
          fill-rule="evenodd"
          fill="${letterColor}" />

    <!-- ═════════ LETTER H ═════════ -->
    <!-- H Left Top Column -->
    <path d="M 478 70 L 534 70 L 534 126 L 478 126 Z" fill="${letterColor}" />
    <!-- H Right Top Column -->
    <path d="M 598 70 L 654 70 L 654 126 L 598 126 Z" fill="${letterColor}" />

    <!-- H Lower Body with Connected Crossbar -->
    <path d="M 478 144
             L 654 144
             L 654 270
             L 598 270
             L 598 198
             L 534 198
             L 534 270
             L 478 270 Z"
          fill="${letterColor}" />
  </g>
</svg>`;
}

fs.writeFileSync(path.join(__dirname, '../public/logos/concept-fhb-red.svg'), generateFHB(true));
fs.writeFileSync(path.join(__dirname, '../public/logos/concept-fhb-badge.svg'), generateFHB(false));
fs.writeFileSync(path.join(__dirname, '../public/logos/concept-fbh-red.svg'), generateFBH(true));
fs.writeFileSync(path.join(__dirname, '../public/logos/concept-fbh-badge.svg'), generateFBH(false));

console.log("Generated 4 SVG concepts in public/logos/ successfully!");
