const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

function getBase64(relPath) {
  const full = path.resolve(relPath);
  if (!fs.existsSync(full)) return '';
  const ext = path.extname(full).toLowerCase();
  const mime = ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(full).toString('base64')}`;
}

// Brand Logos
const bkashLogo = getBase64('public/brands/bkash.png');
const pathaoLogo = getBase64('public/brands/pathao.png');
const samsungLogo = getBase64('public/brands/samsung.png');
const waltonLogo = getBase64('public/brands/walton.png');
const bataLogo = getBase64('public/brands/bata.png');
const darazLogo = getBase64('public/brands/daraz.png');
const foodpandaLogo = getBase64('public/brands/foodpanda.svg');
const chaldalLogo = getBase64('public/brands/chaldal.png');
const pranLogo = getBase64('public/brands/pran.png');
const robiLogo = getBase64('public/brands/robi.svg');
const gpLogo = getBase64('public/brands/grameenphone.svg');
const citybankLogo = getBase64('public/brands/citybank.png');
const netshortLogo = getBase64('public/brands/netshort.png');

// Background Photos
const bkashBg = getBase64('public/ads/bkash_matchday_banner.jpg');
const pathaoBg = getBase64('public/ads/pathao_bike_1.jpg');
const samsungBg = getBase64('public/ads/samsung_galaxy_banner.jpg');
const waltonBg = getBase64('public/ads/walton_tv_banner.jpg');
const bataBg = getBase64('public/ads/bata_boots.jpg');
const darazBg = getBase64('public/ads/daraz_mega_sale.jpg');
const foodpandaBg = getBase64('public/ads/foodpanda_feast.jpg');
const chaldalBg = getBase64('public/ads/chaldal_gamenight.jpg');
const robiBg = getBase64('public/ads/robi_sports_pass.jpg');
const gpBg = getBase64('public/ads/gp_stadium_stream.jpg');
const citybankBg = getBase64('public/ads/citybank_vip_lounge.jpg');
const netshortPeople = getBase64('public/ads/netshort_people_only.png');
const poster2 = getBase64('public/brands/netshort_poster_2.jpg');
const poster3 = getBase64('public/brands/netshort_poster_3.jpg');
const poster4 = getBase64('public/brands/netshort_poster_4.jpg');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Cabinet+Grotesk:wght@800;900&family=Hind+Siliguri:wght@600;700;800&family=Playfair+Display:ital,wght@1,900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #06080F;
      padding: 30px;
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    /* Google AdChoices Official Badge */
    .adchoices-pill {
      position: absolute;
      top: 6px;
      right: 6px;
      z-index: 60;
      display: inline-flex;
      align-items: center;
      gap: 3.5px;
      background: rgba(255, 255, 255, 0.94);
      padding: 1.5px 5px 1.5px 6px;
      border-radius: 3px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    }
    .adchoices-pill .ad-text {
      font-size: 9.5px;
      font-weight: 700;
      color: #334155;
      line-height: 1;
    }
    .adchoices-pill svg {
      display: block;
      width: 12px;
      height: 12px;
    }

    /* ══════════════════════════════════════════════════════════════
       1. SIDEBAR BANNERS (300×250 MPU)
       ══════════════════════════════════════════════════════════════ */
    .sb-banner {
      width: 300px;
      height: 250px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 14px 16px;
    }
    .sb-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .sb-top-scrim {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 70px;
      background: linear-gradient(to bottom, rgba(6,8,15,0.88) 0%, rgba(6,8,15,0.3) 65%, transparent 100%);
      z-index: 2;
    }
    .sb-bot-scrim {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 120px;
      background: linear-gradient(to top, rgba(6,8,15,0.96) 0%, rgba(6,8,15,0.75) 60%, transparent 100%);
      z-index: 2;
    }
    .sb-top {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sb-bot {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .logo-w {
      filter: brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.85));
    }
    .logo-c {
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.9));
    }

    /* Graphic Offer Badges (Bold, striking, NO weak pill chips!) */
    .burst-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 12px;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.4);
      width: fit-content;
      color: #FFF;
    }
    .burst-badge-num {
      font-size: 24px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.02em;
      text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }
    .burst-badge-text {
      font-size: 11px;
      font-weight: 800;
      line-height: 1.1;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .sb-headline {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-size: 18.5px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.18;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 6px rgba(0,0,0,0.95);
    }
    .sb-subline {
      font-size: 11.5px;
      font-weight: 700;
      color: #CBD5E1;
      line-height: 1.3;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
    }
    .sb-cta-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      color: #FFF;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.3);
      width: fit-content;
    }
    .store-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .store-pill {
      background: rgba(0,0,0,0.85);
      border: 1px solid rgba(255,255,255,0.25);
      padding: 2.5px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      color: #FFF;
    }

    /* ══════════════════════════════════════════════════════════════
       2. HEADER LEADERBOARD BANNERS (728×90)
       ══════════════════════════════════════════════════════════════ */
    .hdr-banner {
      width: 728px;
      height: 90px;
      position: relative;
      overflow: hidden;
      border-radius: 10px;
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      padding: 0 22px;
    }
    .hdr-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .hdr-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.96) 0%, rgba(6,8,15,0.85) 48%, rgba(6,8,15,0.2) 75%, transparent 100%);
      z-index: 2;
    }
    .hdr-brand-col {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 130px;
      flex-shrink: 0;
    }
    .hdr-divider {
      position: relative;
      z-index: 10;
      width: 1px;
      height: 44px;
      background: rgba(255,255,255,0.2);
      margin: 0 16px 0 4px;
    }
    .hdr-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }
    .hdr-headline {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-size: 18.5px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 6px rgba(0,0,0,0.9);
    }
    .hdr-subline {
      font-size: 12px;
      font-weight: 700;
      color: #CBD5E1;
    }

    /* ══════════════════════════════════════════════════════════════
       3. IN-FEED EDITORIAL BANNERS (728×110)
       ══════════════════════════════════════════════════════════════ */
    .inf-banner {
      width: 728px;
      height: 110px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      padding: 0 24px;
    }
    .inf-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .inf-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.96) 0%, rgba(6,8,15,0.85) 48%, rgba(6,8,15,0.2) 75%, transparent 100%);
      z-index: 2;
    }

    /* ══════════════════════════════════════════════════════════════
       4. MOBILE STICKY BANNERS (320×60)
       ══════════════════════════════════════════════════════════════ */
    .mob-banner {
      width: 320px;
      height: 60px;
      position: relative;
      overflow: hidden;
      border-radius: 10px;
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      padding: 0 12px;
    }
    .mob-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .mob-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.96) 0%, rgba(6,8,15,0.85) 60%, transparent 100%);
      z-index: 2;
    }
    .mob-content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 260px;
    }

    /* NetShort Special */
    .netshort-banner {
      width: 300px;
      height: 250px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      background: #0f1322;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <!-- Google AdChoices Symbol Definition -->
  <div style="display:none;">
    <div id="adchoices-pill-html" class="adchoices-pill">
      <span class="ad-text">Ad</span>
      <svg viewBox="0 0 15 15">
        <polygon fill="#00a4e4" points="15,0 15,15 0,0"/>
        <circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/>
        <rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/>
      </svg>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════
       1. PATHAO SIDEBAR (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════ -->
  <!-- Pathao Frame 1: Hook -->
  <div id="pathao_f1" class="sb-banner">
    <img class="sb-bg" src="${pathaoBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${pathaoLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Beat Stadium Traffic with Pathao Bike</h3>
      <p class="sb-subline">গেমের দিনে স্টেডিয়ামে পৌঁছান জ্যাম ছাড়া দ্রুততম রাইডে</p>
    </div>
  </div>

  <!-- Pathao Frame 2: Big Graphic Offer Burst -->
  <div id="pathao_f2" class="sb-banner">
    <img class="sb-bg" src="${pathaoBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${pathaoLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <div class="burst-badge" style="background: linear-gradient(135deg, #FF1744 0%, #D50000 100%);">
        <span class="burst-badge-num">৪০%</span>
        <span class="burst-badge-text"><span>স্পেশাল ছাড়</span><span>PROMO: FHB40</span></span>
      </div>
      <h3 class="sb-headline">ম্যাচডে রাইডে ফ্ল্যাট ৪০% ডিসকাউন্ট!</h3>
      <p class="sb-subline">স্টেডিয়াম রুটের সকল বাইক রাইডে প্রযোজ্য</p>
    </div>
  </div>

  <!-- Pathao Frame 3: CTA & Download -->
  <div id="pathao_f3" class="sb-banner">
    <img class="sb-bg" src="${pathaoBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${pathaoLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <div class="sb-cta-btn" style="background: #E50914;">রাইড বুক করুন ▶</div>
      <h3 class="sb-headline">এখনই পাঠাও অ্যাপ নামিয়ে নিন</h3>
      <div class="store-row">
        <span class="store-pill">&#63743; App Store</span>
        <span class="store-pill">&#9654; Google Play</span>
      </div>
    </div>
  </div>


  <!-- ══════════════════════════════════════════════════════════
       2. SAMSUNG GALAXY S24 ULTRA (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════ -->
  <!-- Samsung Frame 1 -->
  <div id="samsung_f1" class="sb-banner">
    <img class="sb-bg" src="${samsungBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${samsungLogo}" class="logo-w" style="height:22px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Galaxy S24 Ultra</h3>
      <p class="sb-subline">Capture Every Goal in 100x Space Zoom</p>
    </div>
  </div>

  <!-- Samsung Frame 2: Galaxy AI Offer -->
  <div id="samsung_f2" class="sb-banner">
    <img class="sb-bg" src="${samsungBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${samsungLogo}" class="logo-w" style="height:22px;" /></div>
    <div class="sb-bot">
      <div class="burst-badge" style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);">
        <span class="burst-badge-num">✨ AI</span>
        <span class="burst-badge-text"><span>GALAXY AI</span><span>PRE-ORDER OFFER</span></span>
      </div>
      <h3 class="sb-headline">Circle to Search & Free Buds</h3>
      <p class="sb-subline">Pre-order now & get 0% EMI with Galaxy Buds</p>
    </div>
  </div>

  <!-- Samsung Frame 3: CTA -->
  <div id="samsung_f3" class="sb-banner">
    <img class="sb-bg" src="${samsungBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${samsungLogo}" class="logo-w" style="height:22px;" /></div>
    <div class="sb-bot">
      <div class="sb-cta-btn" style="background: #2563EB;">Pre-Order Now ▶</div>
      <h3 class="sb-headline">Official 1-Year Warranty</h3>
      <p class="sb-subline">Available at official Samsung Stores in BD</p>
    </div>
  </div>


  <!-- ══════════════════════════════════════════════════════════
       3. WALTON 4K GOOGLE TV (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════ -->
  <!-- Walton Frame 1 -->
  <div id="walton_f1" class="sb-banner">
    <img class="sb-bg" src="${waltonBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${waltonLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Bring the Stadium Home with Walton</h3>
      <p class="sb-subline">Bezel-Less 4K Google TV & Dolby Atmos</p>
    </div>
  </div>

  <!-- Walton Frame 2: Gold EMI Seal -->
  <div id="walton_f2" class="sb-banner">
    <img class="sb-bg" src="${waltonBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${waltonLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <div class="burst-badge" style="background: linear-gradient(135deg, #D97706 0%, #B45309 100%);">
        <span class="burst-badge-num">০%</span>
        <span class="burst-badge-text"><span>সহজ কিস্তি</span><span>৫ বছরের ওয়ারেন্টি</span></span>
      </div>
      <h3 class="sb-headline">স্টেডিয়ামের উত্তেজনা এখন ঘরেই</h3>
      <p class="sb-subline">120Hz রিফ্রেশ রেটে স্মুথ ফুটবল অ্যাকশন</p>
    </div>
  </div>

  <!-- Walton Frame 3: CTA -->
  <div id="walton_f3" class="sb-banner">
    <img class="sb-bg" src="${waltonBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${waltonLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <div class="sb-cta-btn" style="background: #0284C7;">ওয়ালটন প্লাজায় দেখুন ▶</div>
      <h3 class="sb-headline">ফ্রি হোম ডেলিভারি ও ইন্সটলেশন</h3>
      <p class="sb-subline">সারাদেশে নিকটস্থ ওয়ালটন প্লাজায় উপলব্ধ</p>
    </div>
  </div>


  <!-- ══════════════════════════════════════════════════════════
       4. BATA PRO TURF (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════ -->
  <!-- Bata Frame 1 -->
  <div id="bata_f1" class="sb-banner">
    <img class="sb-bg" src="${bataBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${bataLogo}" class="logo-c" style="height:30px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Dominate the Pitch with Bata</h3>
      <p class="sb-subline">Pro Turf Football Cleats & Speed Studs</p>
    </div>
  </div>

  <!-- Bata Frame 2: Discount Seal -->
  <div id="bata_f2" class="sb-banner">
    <img class="sb-bg" src="${bataBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${bataLogo}" class="logo-c" style="height:30px;" /></div>
    <div class="sb-bot">
      <div class="burst-badge" style="background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%);">
        <span class="burst-badge-num">২৫%</span>
        <span class="burst-badge-text"><span>ডিসকাউন্ট</span><span>NEW SEASON DROP</span></span>
      </div>
      <h3 class="sb-headline">নতুন ফুটবল বুট কালেকশন</h3>
      <p class="sb-subline">সর্বোচ্চ গ্রিপ ও স্পিড কন্ট্রোল টার্ম স্টাডস</p>
    </div>
  </div>

  <!-- Bata Frame 3: CTA -->
  <div id="bata_f3" class="sb-banner">
    <img class="sb-bg" src="${bataBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="sb-top"><img src="${bataLogo}" class="logo-c" style="height:30px;" /></div>
    <div class="sb-bot">
      <div class="sb-cta-btn" style="background: #E11D48;">শপ করুন ▶</div>
      <h3 class="sb-headline">ভিজিট করুন বাতা শোরুমে</h3>
      <p class="sb-subline">অথবা অনলাইন অর্ডার করুন bata.com.bd-তে</p>
    </div>
  </div>


  <!-- ══════════════════════════════════════════════════════════
       5. NETSHORT SIDEBAR (300×250) - 2 FRAMES
       ══════════════════════════════════════════════════════════ -->
  <!-- NetShort Frame 1 -->
  <div id="netshort_f1" class="netshort-banner">
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div style="position:relative; height:144px; display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg, #181d2e 0%, #0e1220 100%);">
      <img src="${netshortPeople}" style="height:100%; width:140px; object-fit:cover; object-position:left top;" />
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px; padding-right:12px;">
        <div style="display:inline-flex; align-items:center; gap:5px; background:#fff; border-radius:9999px; padding:3px 9px 3px 4px;">
          <img src="${netshortLogo}" style="width:18px; height:18px; border-radius:4px;" />
          <span style="font-size:11px; font-weight:800; color:#EF4444;">NetShort</span>
        </div>
        <div style="background:linear-gradient(135deg, #F59E0B 0%, #EC4899 100%); color:#fff; font-family:'Playfair Display',serif; font-style:italic; font-size:13px; font-weight:900; padding:4px 12px; border-radius:9999px; box-shadow:0 4px 12px rgba(236,72,153,0.5);">FREE DRAMAS</div>
        <div style="display:flex; gap:4px;">
          <span style="background:rgba(0,0,0,0.85); border:1px solid rgba(255,255,255,0.2); padding:2px 5px; border-radius:4px; font-size:7.5px; font-weight:700; color:#fff;">&#63743; App Store</span>
          <span style="background:rgba(0,0,0,0.85); border:1px solid rgba(255,255,255,0.2); padding:2px 5px; border-radius:4px; font-size:7.5px; font-weight:700; color:#fff;">&#9654; Google Play</span>
        </div>
      </div>
    </div>
    <div style="height:106px; background:#080B14; border-top:1px solid rgba(255,255,255,0.1); display:grid; grid-template-columns:repeat(4,1fr); gap:4px; padding:5px 8px 6px;">
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster2}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">The Billionaire</span></div>
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster3}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">Racing God</span></div>
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster4}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">Sniper Hero</span></div>
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster2}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">Revenge</span></div>
    </div>
  </div>

  <!-- NetShort Frame 2: Flash Offer -->
  <div id="netshort_f2" class="netshort-banner">
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div style="position:relative; height:144px; display:flex; align-items:center; justify-content:space-between; background:linear-gradient(135deg, #2b132e 0%, #0e1220 100%);">
      <img src="${netshortPeople}" style="height:100%; width:140px; object-fit:cover; object-position:left top;" />
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px; padding-right:12px;">
        <div style="background:linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%); color:#fff; font-size:11px; font-weight:900; padding:4px 10px; border-radius:6px; box-shadow:0 4px 12px rgba(236,72,153,0.5);">🔥 10,000+ EPISODES</div>
        <div style="background:linear-gradient(135deg, #F59E0B 0%, #EF4444 100%); color:#fff; font-family:'Playfair Display',serif; font-style:italic; font-size:14px; font-weight:900; padding:4px 14px; border-radius:9999px; box-shadow:0 4px 14px rgba(239,68,68,0.5);">100% FREE STREAM</div>
        <div style="display:flex; gap:4px;">
          <span style="background:rgba(255,255,255,0.95); padding:2.5px 7px; border-radius:4px; font-size:8px; font-weight:800; color:#0F172A;">INSTALL NOW ▶</span>
        </div>
      </div>
    </div>
    <div style="height:106px; background:#080B14; border-top:1px solid rgba(255,255,255,0.1); display:grid; grid-template-columns:repeat(4,1fr); gap:4px; padding:5px 8px 6px;">
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster3}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">The Delivery Boy</span></div>
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster4}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">Sniper Hero</span></div>
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster2}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">Alpha Wolves</span></div>
      <div style="position:relative; border-radius:5px; overflow:hidden;"><img src="${poster3}" style="width:100%; height:100%; object-fit:cover;" /><span style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.85); font-size:7px; font-weight:800; color:#fff; padding:2px 3px;">Doting Snake</span></div>
    </div>
  </div>


  <!-- ══════════════════════════════════════════════════════════
       6. DARAZ HEADER (728×90) - 2 FRAMES
       ══════════════════════════════════════════════════════════ -->
  <!-- Daraz Frame 1 -->
  <div id="daraz_f1" class="hdr-banner">
    <img class="hdr-bg" src="${darazBg}" />
    <div class="hdr-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="hdr-brand-col"><img src="${darazLogo}" class="logo-c" style="height:26px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <h3 class="hdr-headline">11.11 Football Mega Sports Festival</h3>
      <p class="hdr-subline">Official Club Jerseys, Boots & Training Equipment</p>
    </div>
  </div>

  <!-- Daraz Frame 2: Huge Voucher Burst -->
  <div id="daraz_f2" class="hdr-banner">
    <img class="hdr-bg" src="${darazBg}" />
    <div class="hdr-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div class="hdr-brand-col"><img src="${darazLogo}" class="logo-c" style="height:26px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <div style="display:flex; align-items:center; gap:14px;">
        <div class="burst-badge" style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);">
          <span class="burst-badge-num">৭০%</span>
          <span class="burst-badge-text"><span>পর্যন্ত ছাড়</span><span>+ ফ্রি ডেলিভারি</span></span>
        </div>
        <div>
          <h3 class="hdr-headline">ম্যাচডে মেগা ভাউচার সংগ্রহ করুন!</h3>
          <p class="hdr-subline">দারাজ অ্যাপে স্পেশাল ডিসকাউন্ট কোড উপলব্ধ</p>
        </div>
      </div>
    </div>
  </div>


  <!-- ══════════════════════════════════════════════════════════
       7. FOODPANDA INFEED (728×110) - 2 FRAMES
       ══════════════════════════════════════════════════════════ -->
  <!-- Foodpanda Frame 1 -->
  <div id="foodpanda_f1" class="inf-banner">
    <img class="inf-bg" src="${foodpandaBg}" />
    <div class="inf-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:8px; width:145px; flex-shrink:0;">
      <img src="${foodpandaLogo}" class="logo-c" style="height:28px;" />
      <span style="font-size:16px; font-weight:900; color:#FFF;">foodpanda</span>
    </div>
    <div style="position:relative; z-index:10; width:1px; height:50px; background:rgba(255,255,255,0.2); margin:0 18px 0 6px;"></div>
    <div style="position:relative; z-index:10; display:flex; flex-direction:column; gap:3px;">
      <h3 style="font-size:18px; font-weight:900; color:#FFF;">Half-Time Matchday Feast Delivered in 20 Mins</h3>
      <p style="font-size:12px; font-weight:700; color:#CBD5E1;">Hot Burgers, Crispy Wings & Chilled Drinks at Your Door</p>
    </div>
  </div>

  <!-- Foodpanda Frame 2: Huge Coupon Burst -->
  <div id="foodpanda_f2" class="inf-banner">
    <img class="inf-bg" src="${foodpandaBg}" />
    <div class="inf-scrim"></div>
    <div class="adchoices-pill"><span class="ad-text">Ad</span><svg viewBox="0 0 15 15"><polygon fill="#00a4e4" points="15,0 15,15 0,0"/><circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/><rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/></svg></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:8px; width:145px; flex-shrink:0;">
      <img src="${foodpandaLogo}" class="logo-c" style="height:28px;" />
      <span style="font-size:16px; font-weight:900; color:#FFF;">foodpanda</span>
    </div>
    <div style="position:relative; z-index:10; width:1px; height:50px; background:rgba(255,255,255,0.2); margin:0 18px 0 6px;"></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:16px;">
      <div class="burst-badge" style="background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);">
        <span class="burst-badge-num">৫০%</span>
        <span class="burst-badge-text"><span>স্পেশাল ছাড়</span><span>CODE: MATCH50</span></span>
      </div>
      <div>
        <h3 style="font-size:18px; font-weight:900; color:#FFF;">খেলা দেখতে দেখতে গরম খাবার ডেলিভারি!</h3>
        <p style="font-size:11.5px; font-weight:700; color:#CBD5E1;">ম্যাচ চলাকালে কোড MATCH50 ব্যবহারে ৫০% ডিসকাউন্ট</p>
      </div>
    </div>
  </div>

</body>
</html>`;

const tempPath = path.resolve('public/ads/generated/banners_animated_template.html');
fs.writeFileSync(tempPath, html);

async function capture() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9251',
    '--window-size=1200,3200',
    '--disable-gpu',
    '--no-sandbox',
    '--allow-file-access-from-files'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9251/json/new', { method: 'PUT' });
    const tab = await res.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let id = 1;
    function send(m, p = {}) {
      return new Promise(resolve => {
        const cur = id++;
        const h = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === cur) {
            ws.removeEventListener('message', h);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method: m, params: p }));
      });
    }

    await send('Page.enable');
    const fileUrl = 'file:///' + tempPath.replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 3000));

    const bannerConfigs = [
      { id: 'pathao_sidebar_300x250', frames: ['pathao_f1', 'pathao_f2', 'pathao_f3'], durations: [2400, 2600, 2400] },
      { id: 'samsung_sidebar_300x250', frames: ['samsung_f1', 'samsung_f2', 'samsung_f3'], durations: [2400, 2600, 2400] },
      { id: 'walton_sidebar_300x250', frames: ['walton_f1', 'walton_f2', 'walton_f3'], durations: [2400, 2600, 2400] },
      { id: 'bata_sidebar_300x250', frames: ['bata_f1', 'bata_f2', 'bata_f3'], durations: [2400, 2600, 2400] },
      { id: 'netshort_sidebar_300x250', frames: ['netshort_f1', 'netshort_f2'], durations: [2800, 2800] },
      { id: 'daraz_header_728x90', frames: ['daraz_f1', 'daraz_f2'], durations: [2600, 2800] },
      { id: 'foodpanda_infeed_728x110', frames: ['foodpanda_f1', 'foodpanda_f2'], durations: [2600, 2800] }
    ];

    for (const b of bannerConfigs) {
      console.log('Capturing frames for', b.id);
      const frameFiles = [];
      for (let i = 0; i < b.frames.length; i++) {
        const frameId = b.frames[i];
        const rectRes = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.getElementById("${frameId}");
              const r = el.getBoundingClientRect();
              return { x: r.left, y: r.top, width: r.width, height: r.height };
            })()
          `,
          returnByValue: true
        });
        const rect = rectRes.result.value;
        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            scale: 1
          }
        });

        const framePath = `temp_${b.id}_f${i}.png`;
        fs.writeFileSync(framePath, Buffer.from(shot.data, 'base64'));
        frameFiles.push(framePath);
      }

      // Call python Pillow to assemble into GIF
      const pyScript = `
from PIL import Image

files = ${JSON.stringify(frameFiles)}
durations = ${JSON.stringify(b.durations)}
imgs = [Image.open(f).convert('RGB') for f in files]

# Quantize
base = imgs[0].quantize(colors=256, method=Image.Resampling.LANCZOS)
paletted = [im.quantize(palette=base) for im in imgs]

out_gif = 'public/ads/generated/${b.id}.gif'
out_jpg = 'public/ads/generated/${b.id}.jpg'

# Save GIF
paletted[0].save(
    out_gif,
    save_all=True,
    append_images=paletted[1:],
    duration=durations,
    loop=0,
    optimize=True
)

# Also save Frame 2 as the static JPG fallback with the bold offer
imgs[1].save(out_jpg, quality=94)

print('Compiled', out_gif, 'and', out_jpg)
`;
      fs.writeFileSync('temp_gif_build.py', pyScript);
      const py = spawn('python', ['temp_gif_build.py']);
      await new Promise(r => py.on('close', r));
    }

    console.log('ALL ANIMATED DISPLAY ADS COMPILED SUCCESSFULLY!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

capture().catch(console.error);
