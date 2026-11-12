const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function getBase64(relPath) {
  const full = path.resolve(relPath);
  if (!fs.existsSync(full)) {
    console.error('File not found:', full);
    return '';
  }
  const ext = path.extname(full).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(full).toString('base64')}`;
}

/**
 * 19 Commercial Display Banners
 * Art Direction:
 * - NO BUTTONS: Clickable full-bleed banner.
 * - TRANSPARENT LOGOS: No solid white boxes. High-contrast typography/filters.
 * - UNOBSTRUCTED PHOTOGRAPHY: Generous negative space, only soft localized gradient edges.
 * - SLEEK, PUNCHY COPY: 1 headline + 1 tag, no crowded text walls.
 */
const banners = [
  // ── 1. SIDEBAR BANNERS (300×250 MPU) ──
  {
    id: 'walton_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/walton_tv_banner.jpg'),
    logo: getBase64('public/brands/walton.png'),
    logoClass: 'logo-white',
    logoHeight: 28,
    tag: '120Hz Bezel-Less 4K',
    tagColor: '#38BDF8',
    headline: 'Bring the Stadium Home with Walton Google TV'
  },
  {
    id: 'samsung_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/samsung_galaxy_banner.jpg'),
    logo: getBase64('public/brands/samsung.png'),
    logoClass: 'logo-white',
    logoHeight: 24,
    tag: 'Galaxy AI Is Here',
    tagColor: '#60A5FA',
    headline: '100x Space Zoom · Capture Every Goal'
  },
  {
    id: 'citybank_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/citybank_vip_lounge.jpg'),
    logo: getBase64('public/brands/citybank.png'),
    logoText: 'CITY BANK AMEX',
    logoClass: 'logo-white',
    logoHeight: 32,
    tag: 'Exclusive Matchday Hospitality',
    tagColor: '#FBBF24',
    headline: 'Experience Stadium Luxury & VIP Gate Entry'
  },
  {
    id: 'pathao_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/pathao_matchday.jpg'),
    logo: getBase64('public/brands/pathao.png'),
    logoClass: 'logo-white',
    logoHeight: 30,
    tag: 'Promo Code: FHB40',
    tagColor: '#FF4B63',
    headline: 'Beat Stadium Traffic with 40% Off Rides'
  },
  {
    id: 'robi_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/robi_sports_pass.jpg'),
    logo: getBase64('public/brands/robi.svg'),
    logoText: 'robi 4.5G',
    logoClass: 'logo-color',
    logoHeight: 30,
    tag: 'No. 1 Data Network',
    tagColor: '#F87171',
    headline: 'Stream Football in Ultra HD · Zero Buffering'
  },
  {
    id: 'bata_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/bata_boots.jpg'),
    logo: getBase64('public/brands/bata.png'),
    logoClass: 'logo-color',
    logoHeight: 34,
    tag: 'New Autumn Drop · 25% Off',
    tagColor: '#FB7185',
    headline: 'Dominate the Pitch with Pro Turf Studs'
  },

  // ── 2. HEADER BILLBOARD LEADERBOARD BANNERS (728×90) ──
  {
    id: 'bkash_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/bkash_matchday_banner.jpg'),
    logo: getBase64('public/brands/bkash.png'),
    logoClass: 'logo-white',
    logoHeight: 32,
    tag: '15% Instant Cashback',
    tagColor: '#F472B6',
    headline: 'Book Stadium Match Tickets via bKash App'
  },
  {
    id: 'daraz_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/daraz_mega_sale.jpg'),
    logo: getBase64('public/brands/daraz.png'),
    logoClass: 'logo-white',
    logoHeight: 30,
    tag: 'Mega Sports Festival',
    tagColor: '#FB923C',
    headline: 'Up to 70% Off Official Jerseys & Cleats'
  },
  {
    id: 'gp_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/gp_stadium_stream.jpg'),
    logo: getBase64('public/brands/grameenphone.svg'),
    logoText: 'Grameenphone',
    logoClass: 'logo-color',
    logoHeight: 28,
    tag: 'Superfast 4G Pass · Zero Buffering',
    tagColor: '#38BDF8',
    headline: 'Stream Football Live in 4K with GP Match Pass'
  },
  {
    id: 'robi_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/robi_sports_pass.jpg'),
    logo: getBase64('public/brands/robi.svg'),
    logoText: 'robi 4.5G',
    logoClass: 'logo-color',
    logoHeight: 28,
    tag: 'Official BPL Streaming Partner',
    tagColor: '#F87171',
    headline: 'Unlimited Football Match Streaming on Robi 4.5G'
  },

  // ── 3. IN-FEED EDITORIAL BANNERS (728×110) ──
  {
    id: 'foodpanda_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/foodpanda_feast.jpg'),
    logo: getBase64('public/brands/foodpanda.svg'),
    logoText: 'foodpanda',
    logoClass: 'logo-color',
    logoHeight: 26,
    tag: 'Matchday Feast · 50% Off with Code: MATCH50',
    tagColor: '#F472B6',
    headline: 'Hot Burgers & Wings Delivered at Half-Time'
  },
  {
    id: 'chaldal_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/chaldal_gamenight.jpg'),
    logo: getBase64('public/brands/chaldal.png'),
    logoClass: 'logo-white',
    logoHeight: 30,
    tag: '30-Minute Game Night Delivery',
    tagColor: '#FBBF24',
    headline: 'Cold Drinks, Chips & Snacks at Your Door'
  },
  {
    id: 'pran_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/chaldal_gamenight.jpg'),
    logo: getBase64('public/brands/pran.png'),
    logoClass: 'logo-color',
    logoHeight: 32,
    tag: 'Bangladesh Pride · 20% Extra Crunch',
    tagColor: '#EF4444',
    headline: 'Pran Chanachur — The Official Snack of Matchday'
  },
  {
    id: 'bracbank_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/citybank_vip_lounge.jpg'),
    logo: getBase64('public/brands/bracbank.svg'),
    logoClass: 'logo-color',
    logoHeight: 28,
    tag: 'Exclusive Matchday Offer · 0% EMI',
    tagColor: '#60A5FA',
    headline: 'BRAC Bank Astha — Instant Digital Season Ticket Financing'
  },
  {
    id: 'fhb_premium_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/fhb_premium_trophy.jpg'),
    logo: getBase64('public/logo.svg'),
    logoText: 'Football Hub',
    logoClass: 'logo-color',
    logoHeight: 28,
    tag: 'Official Fan Pass · 100% Ad-Free',
    tagColor: '#FBBF24',
    headline: 'FHB Premium — Watch in 4K, Transfer Radar & Zero Ads'
  },

  // ── 4. MOBILE BANNERS (320×60) ──
  {
    id: 'bkash_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/bkash_matchday_banner.jpg'),
    logo: getBase64('public/brands/bkash.png'),
    logoClass: 'logo-white',
    logoHeight: 22,
    tag: '15% Cashback',
    tagColor: '#F472B6',
    headline: 'Matchday Stadium Tickets on bKash'
  },
  {
    id: 'walton_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/walton_tv_banner.jpg'),
    logo: getBase64('public/brands/walton.png'),
    logoClass: 'logo-white',
    logoHeight: 20,
    tag: '120Hz 4K Google TV',
    tagColor: '#38BDF8',
    headline: 'Bring the Stadium Home with Walton'
  },
  {
    id: 'bata_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/bata_boots.jpg'),
    logo: getBase64('public/brands/bata.png'),
    logoClass: 'logo-color',
    logoHeight: 24,
    tag: '25% Off Cleats',
    tagColor: '#FB7185',
    headline: 'Dominate the Pitch with Bata Turf Studs'
  },
  {
    id: 'gp_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/gp_stadium_stream.jpg'),
    logo: getBase64('public/brands/grameenphone.svg'),
    logoText: 'GP 4G',
    logoClass: 'logo-color',
    logoHeight: 20,
    tag: 'Zero Buffering',
    tagColor: '#38BDF8',
    headline: 'Stream Football Live in 4K with GP 4G'
  }
];

const antipastoBase64 = fs.readFileSync('src/fonts/antipasto/AntipastoPro-Bold_trial.ttf').toString('base64');

function buildHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Inter:wght@600;700;800&display=swap');
    
    @font-face {
      font-family: 'AntipastoPro';
      src: url('data:font/truetype;charset=utf-8;base64,${antipastoBase64}') format('truetype');
      font-weight: 700;
      unicode-range: U+0000-002F, U+003A-FFFF;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080F; padding: 30px; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; gap: 30px; }

    /* Corner AdChoices Mark */
    .ad-mark {
      position: absolute;
      top: 7px;
      right: 7px;
      z-index: 50;
      background: rgba(0,0,0,0.65);
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 4px;
      padding: 1px 5px;
      font-size: 9px;
      font-weight: 700;
      color: rgba(255,255,255,0.85);
      letter-spacing: 0.04em;
      backdrop-filter: blur(4px);
    }

    /* Transparent Brand Logo Display (No solid white boxes!) */
    .brand-wrap {
      display: inline-flex;
      align-items: center;
      gap: 9px;
    }
    .brand-wrap img {
      object-fit: contain;
      display: block;
    }
    .brand-wrap span {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-weight: 900;
      font-size: 19px;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      text-shadow: 0 2px 8px rgba(0,0,0,0.95);
    }

    .logo-white {
      filter: brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.9));
    }
    .logo-color {
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.95)) drop-shadow(0 0 12px rgba(0,0,0,0.7));
    }

    /* ── 1. SIDEBAR BANNER (300×250 MPU) ── */
    .banner-sidebar {
      width: 300px;
      height: 250px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 14px 16px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.85);
    }
    .banner-sidebar .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .banner-sidebar .top-grad {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 75px;
      background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 65%, transparent 100%);
      z-index: 2;
    }
    .banner-sidebar .bot-grad {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 95px;
      background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 60%, transparent 100%);
      z-index: 2;
    }
    .banner-sidebar .content-top {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .banner-sidebar .content-bottom {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .banner-sidebar .promo-tag {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 1px 4px rgba(0,0,0,0.95);
    }
    .banner-sidebar .headline {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 900;
      line-height: 1.15;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.98);
      max-width: 260px;
    }

    /* ── 2. HEADER BILLBOARD LEADERBOARD (728×90) ── */
    .banner-header {
      width: 728px;
      height: 90px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.8);
    }
    .banner-header .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .banner-header .h-grad {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.94) 0%, rgba(6,8,15,0.80) 35%, rgba(6,8,15,0.2) 60%, transparent 85%);
      z-index: 2;
    }
    .banner-header .left-col {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 18px;
      max-width: 500px;
    }
    .banner-header .divider {
      width: 1px;
      height: 36px;
      background: rgba(255,255,255,0.2);
    }
    .banner-header .text-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .banner-header .promo-tag {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
    }
    .banner-header .headline {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 19px;
      font-weight: 900;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      line-height: 1.15;
      text-shadow: 0 2px 6px rgba(0,0,0,0.95);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 340px;
    }

    /* ── 3. IN-FEED EDITORIAL BANNER (728×110) ── */
    .banner-infeed {
      width: 728px;
      height: 110px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 26px;
      box-shadow: 0 14px 34px rgba(0,0,0,0.8);
    }
    .banner-infeed .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .banner-infeed .h-grad {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.95) 0%, rgba(6,8,15,0.82) 38%, rgba(6,8,15,0.2) 65%, transparent 88%);
      z-index: 2;
    }
    .banner-infeed .left-col {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 20px;
      max-width: 520px;
    }
    .banner-infeed .divider {
      width: 1px;
      height: 44px;
      background: rgba(255,255,255,0.2);
    }
    .banner-infeed .text-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .banner-infeed .promo-tag {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
    }
    .banner-infeed .headline {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 21px;
      font-weight: 900;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      line-height: 1.15;
      text-shadow: 0 2px 8px rgba(0,0,0,0.98);
      max-width: 370px;
    }

    /* ── 4. MOBILE BANNER (320×60) ── */
    .banner-mobile {
      width: 320px;
      height: 60px;
      position: relative;
      overflow: hidden;
      border-radius: 10px;
      display: flex;
      align-items: center;
      padding: 0 14px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7);
    }
    .banner-mobile .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .banner-mobile .h-grad {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.94) 0%, rgba(6,8,15,0.75) 45%, rgba(6,8,15,0.2) 80%, transparent 100%);
      z-index: 2;
    }
    .banner-mobile .content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding-right: 28px;
    }
    .banner-mobile .text-col {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .banner-mobile .promo-tag {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      text-shadow: 0 1px 3px rgba(0,0,0,0.9);
      line-height: 1;
    }
    .banner-mobile .headline {
      font-family: 'AntipastoPro', 'Outfit', sans-serif;
      font-size: 13.5px;
      font-weight: 800;
      color: #FFFFFF;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
      line-height: 1.2;
    }
  </style>
</head>
<body>

${banners.map(b => {
  if (b.type === 'sidebar') {
    return `
      <div id="${b.id}" class="banner-sidebar">
        <img class="bg-img" src="${b.bg}" />
        <div class="top-grad"></div>
        <div class="bot-grad"></div>
        <span class="ad-mark">Ad &#9654;</span>
        
        <div class="content-top">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
        </div>

        <div class="content-bottom">
          <div class="promo-tag" style="color: ${b.tagColor};">${b.tag}</div>
          <div class="headline">${b.headline}</div>
        </div>
      </div>
    `;
  }

  if (b.type === 'header') {
    return `
      <div id="${b.id}" class="banner-header">
        <img class="bg-img" src="${b.bg}" />
        <div class="h-grad"></div>
        <span class="ad-mark">Ad &#9654;</span>
        
        <div class="left-col">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
          <div class="divider"></div>
          <div class="text-col">
            <div class="promo-tag" style="color: ${b.tagColor};">${b.tag}</div>
            <div class="headline">${b.headline}</div>
          </div>
        </div>
      </div>
    `;
  }

  if (b.type === 'infeed') {
    return `
      <div id="${b.id}" class="banner-infeed">
        <img class="bg-img" src="${b.bg}" />
        <div class="h-grad"></div>
        <span class="ad-mark">Ad &#9654;</span>
        
        <div class="left-col">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
          <div class="divider"></div>
          <div class="text-col">
            <div class="promo-tag" style="color: ${b.tagColor};">${b.tag}</div>
            <div class="headline">${b.headline}</div>
          </div>
        </div>
      </div>
    `;
  }

  if (b.type === 'mobile') {
    return `
      <div id="${b.id}" class="banner-mobile">
        <img class="bg-img" src="${b.bg}" />
        <div class="h-grad"></div>
        <span class="ad-mark">Ad &#9654;</span>
        
        <div class="content">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
          <div class="text-col">
            <div class="promo-tag" style="color: ${b.tagColor};">${b.tag}</div>
            <div class="headline">${b.headline}</div>
          </div>
        </div>
      </div>
    `;
  }
  return '';
}).join('')}

</body>
</html>
`;
}

async function run() {
  const htmlPath = path.resolve('public/ads/generated/banners_template.html');
  fs.writeFileSync(htmlPath, buildHtml());
  console.log('Saved template to', htmlPath);

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9226',
    '--window-size=1600,4500',
    '--disable-gpu',
    '--no-sandbox',
    '--allow-file-access-from-files',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome-debug-gen-v2'
  ]);
  
  await new Promise(r => setTimeout(r, 1500));
  
  try {
    const newRes = await fetch('http://127.0.0.1:9226/json/new', { method: 'PUT' });
    const tab = await newRes.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    
    let id = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const curId = id++;
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.enable');
    const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
    console.log('Navigating to', fileUrl);
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 3000));

    for (const b of banners) {
      const rectRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById("${b.id}");
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.left + window.scrollX, y: r.top + window.scrollY, width: r.width, height: r.height };
          })()
        `,
        returnByValue: true
      });

      const rect = rectRes.result.value;
      if (!rect) {
        console.error('Element not found:', b.id);
        continue;
      }

      const shot = await send('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 92,
        clip: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          scale: 1
        }
      });

      const outPath = path.resolve('public/ads/generated', b.id + '.jpg');
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log('Saved:', b.id + '.jpg', Buffer.from(shot.data, 'base64').length, 'bytes');
    }

    console.log('ALL 19 FLAT BANNERS GENERATED SUCCESSFULLY!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
