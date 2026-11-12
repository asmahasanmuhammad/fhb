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
const bracbankLogo = getBase64('public/brands/bracbank.svg');
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
const trophyBg = getBase64('public/ads/fhb_premium_trophy.jpg');
const netshortPeople = getBase64('public/ads/netshort_people_only.png');
const poster2 = getBase64('public/brands/netshort_poster_2.jpg');
const poster3 = getBase64('public/brands/netshort_poster_3.jpg');
const poster4 = getBase64('public/brands/netshort_poster_4.jpg');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;600;700;800;900&family=Noto+Sans+Bengali:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Playfair+Display:ital,wght@1,900&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Hind Siliguri', 'Cabinet Grotesk', 'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif; }
    body {
      background: #000;
      font-family: 'Hind Siliguri', 'Cabinet Grotesk', 'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* All frames are absolute at 0,0 and hidden by default */
    .frame-view {
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      overflow: hidden;
    }
    .frame-view.active {
      display: flex;
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
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
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
      height: 125px;
      background: linear-gradient(to top, rgba(6,8,15,0.96) 0%, rgba(6,8,15,0.78) 60%, transparent 100%);
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
      gap: 5px;
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
      gap: 10px;
      padding: 6px 14px;
      border-radius: 9px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      border: 1px solid rgba(255,255,255,0.35);
      width: fit-content;
      color: #FFF;
      font-family: 'Hind Siliguri', 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
    }
    .burst-badge-num {
      font-family: 'Cabinet Grotesk', 'Hind Siliguri', sans-serif;
      font-size: 28px;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.02em;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .burst-badge-text {
      font-family: 'Hind Siliguri', 'Cabinet Grotesk', sans-serif;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      display: flex;
      flex-direction: column;
    }

    .sb-headline {
      font-family: 'Hind Siliguri', 'Cabinet Grotesk', 'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif;
      font-size: 19px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.22;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.95);
    }
    .sb-subline {
      font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #CBD5E1;
      line-height: 1.35;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
    }
    .sb-cta-btn {
      font-family: 'Hind Siliguri', 'Cabinet Grotesk', sans-serif;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 7px;
      font-size: 13px;
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

    /* NetShort Special 300x250 */
    .netshort-banner {
      width: 300px;
      height: 250px;
      background: #0f1322;
      border: 1px solid rgba(255,255,255,0.08);
      flex-direction: column;
      justify-content: space-between;
    }

    /* ══════════════════════════════════════════════════════════════
       2. HEADER LEADERBOARD BANNERS (728×140)
       ══════════════════════════════════════════════════════════════ */
    .hdr-banner {
      width: 728px;
      height: 140px;
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
      align-items: center;
      padding: 0 28px;
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
      background: linear-gradient(to right, rgba(6,8,15,0.96) 0%, rgba(6,8,15,0.86) 48%, rgba(6,8,15,0.2) 75%, transparent 100%);
      z-index: 2;
    }
    .hdr-brand-col {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 150px;
      flex-shrink: 0;
    }
    .hdr-divider {
      position: relative;
      z-index: 10;
      width: 1px;
      height: 68px;
      background: rgba(255,255,255,0.22);
      margin: 0 20px 0 6px;
    }
    .hdr-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
    }
    .hdr-headline {
      font-family: 'Hind Siliguri', 'Cabinet Grotesk', 'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif;
      font-size: 21px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      line-height: 1.25;
      text-shadow: 0 2px 6px rgba(0,0,0,0.9);
    }
    .hdr-subline {
      font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      color: #CBD5E1;
      line-height: 1.35;
    }

    /* ══════════════════════════════════════════════════════════════
       3. IN-FEED EDITORIAL BANNERS (728×160)
       ══════════════════════════════════════════════════════════════ */
    .inf-banner {
      width: 728px;
      height: 160px;
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
      align-items: center;
      padding: 0 30px;
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
    .inf-brand-col {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      width: 150px;
      flex-shrink: 0;
    }
    .inf-divider {
      position: relative;
      z-index: 10;
      width: 1px;
      height: 78px;
      background: rgba(255,255,255,0.22);
      margin: 0 22px 0 6px;
    }
    .inf-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
    }
    .inf-headline {
      font-family: 'Hind Siliguri', 'Cabinet Grotesk', 'Plus Jakarta Sans', 'Noto Sans Bengali', sans-serif;
      font-size: 21px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      line-height: 1.25;
      text-shadow: 0 2px 6px rgba(0,0,0,0.9);
    }
    .inf-subline {
      font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
      font-size: 13.5px;
      font-weight: 600;
      color: #CBD5E1;
      line-height: 1.35;
    }

    /* ══════════════════════════════════════════════════════════════
       4. MOBILE STICKY BANNERS (320×60)
       ══════════════════════════════════════════════════════════ */
    .mob-banner {
      width: 320px;
      height: 60px;
      background: #080C16;
      border: 1px solid rgba(255,255,255,0.08);
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
      max-width: 255px;
    }
  </style>
</head>
<body>

  <!-- Google AdChoices Symbol -->
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

  <!-- ══════════════════════════════════════════════════════════════
       1. PATHAO SIDEBAR (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="pathao_f1" class="frame-view sb-banner">
    <img class="sb-bg" src="${pathaoBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${pathaoLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Beat Stadium Traffic with Pathao Bike</h3>
      <p class="sb-subline">গেমের দিনে স্টেডিয়ামে পৌঁছান জ্যাম ছাড়া দ্রুততম রাইডে</p>
    </div>
  </div>

  <div id="pathao_f2" class="frame-view sb-banner">
    <img class="sb-bg" src="${pathaoBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
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

  <div id="pathao_f3" class="frame-view sb-banner">
    <img class="sb-bg" src="${pathaoBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
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

  <!-- ══════════════════════════════════════════════════════════════
       2. SAMSUNG GALAXY S24 ULTRA (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="samsung_f1" class="frame-view sb-banner">
    <img class="sb-bg" src="${samsungBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${samsungLogo}" class="logo-w" style="height:22px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Galaxy S24 Ultra</h3>
      <p class="sb-subline">Capture Every Goal in 100x Space Zoom</p>
    </div>
  </div>

  <div id="samsung_f2" class="frame-view sb-banner">
    <img class="sb-bg" src="${samsungBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
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

  <div id="samsung_f3" class="frame-view sb-banner">
    <img class="sb-bg" src="${samsungBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${samsungLogo}" class="logo-w" style="height:22px;" /></div>
    <div class="sb-bot">
      <div class="sb-cta-btn" style="background: #2563EB;">Pre-Order Now ▶</div>
      <h3 class="sb-headline">Official 1-Year Warranty</h3>
      <p class="sb-subline">Available at official Samsung Stores in BD</p>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       3. WALTON 4K GOOGLE TV (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="walton_f1" class="frame-view sb-banner">
    <img class="sb-bg" src="${waltonBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${waltonLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Bring the Stadium Home with Walton</h3>
      <p class="sb-subline">Bezel-Less 4K Google TV & Dolby Atmos</p>
    </div>
  </div>

  <div id="walton_f2" class="frame-view sb-banner">
    <img class="sb-bg" src="${waltonBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
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

  <div id="walton_f3" class="frame-view sb-banner">
    <img class="sb-bg" src="${waltonBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${waltonLogo}" class="logo-w" style="height:26px;" /></div>
    <div class="sb-bot">
      <div class="sb-cta-btn" style="background: #0284C7;">ওয়ালটন প্লাজায় দেখুন ▶</div>
      <h3 class="sb-headline">ফ্রি হোম ডেলিভারি ও ইন্সটলেশন</h3>
      <p class="sb-subline">সারাদেশে নিকটস্থ ওয়ালটন প্লাজায় উপলব্ধ</p>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       4. BATA PRO TURF (300×250) - 3 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="bata_f1" class="frame-view sb-banner">
    <img class="sb-bg" src="${bataBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${bataLogo}" class="logo-c" style="height:30px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">Dominate the Pitch with Bata</h3>
      <p class="sb-subline">Pro Turf Football Cleats & Speed Studs</p>
    </div>
  </div>

  <div id="bata_f2" class="frame-view sb-banner">
    <img class="sb-bg" src="${bataBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
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

  <div id="bata_f3" class="frame-view sb-banner">
    <img class="sb-bg" src="${bataBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${bataLogo}" class="logo-c" style="height:30px;" /></div>
    <div class="sb-bot">
      <div class="sb-cta-btn" style="background: #E11D48;">শপ করুন ▶</div>
      <h3 class="sb-headline">ভিজিট করুন বাতা শোরুমে</h3>
      <p class="sb-subline">অথবা অনলাইন অর্ডার করুন bata.com.bd-তে</p>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       5. NETSHORT SIDEBAR (300×250) - 2 FRAMES (Exact Cricbuzz style)
       ══════════════════════════════════════════════════════════════ -->
  <div id="netshort_f1" class="frame-view netshort-banner">
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

  <div id="netshort_f2" class="frame-view netshort-banner">
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

  <!-- ══════════════════════════════════════════════════════════════
       6. CITY BANK AMEX SIDEBAR (300×250) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="citybank_f1" class="frame-view sb-banner">
    <img class="sb-bg" src="${citybankBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${citybankLogo}" class="logo-c" style="height:26px;" /></div>
    <div class="sb-bot">
      <h3 class="sb-headline">American Express® VIP Stadium Lounge</h3>
      <p class="sb-subline">Complimentary Stadium Lounge Access & Premium Dining</p>
    </div>
  </div>

  <div id="citybank_f2" class="frame-view sb-banner">
    <img class="sb-bg" src="${citybankBg}" />
    <div class="sb-top-scrim"></div>
    <div class="sb-bot-scrim"></div>
    <div class="sb-top"><img src="${citybankLogo}" class="logo-c" style="height:26px;" /></div>
    <div class="sb-bot">
      <div class="burst-badge" style="background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);">
        <span class="burst-badge-num">★ VIP</span>
        <span class="burst-badge-text"><span>SUITE PASS</span><span>10% CASHBACK</span></span>
      </div>
      <h3 class="sb-headline">ম্যাচ টিকেটে ১০% সেভিংস</h3>
      <div class="sb-cta-btn" style="background: #0284C7;">Apply Online ▶</div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       7. BKASH HEADER (728×90) - 3 FRAMES (NO WEAK PILL CHIP!)
       ══════════════════════════════════════════════════════════════ -->
  <div id="bkash_f1" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${bkashBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${bkashLogo}" class="logo-c" style="height:32px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <h3 class="hdr-headline">Book Stadium Match Tickets on bKash</h3>
      <p class="hdr-subline">Instant e-Gate Entry · Zero Queue · Instant Ticket Delivery</p>
    </div>
  </div>

  <div id="bkash_f2" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${bkashBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${bkashLogo}" class="logo-c" style="height:32px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <div style="display:flex; align-items:center; gap:16px;">
        <div class="burst-badge" style="background: linear-gradient(135deg, #E2136E 0%, #BE185D 100%);">
          <span class="burst-badge-num">১৫%</span>
          <span class="burst-badge-text"><span>ইনস্ট্যান্ট</span><span>ক্যাশব্যাক!</span></span>
        </div>
        <div>
          <h3 class="hdr-headline">স্টেডিয়ামের প্রতিটি টিকেটে নিশ্চিত ক্যাশব্যাক</h3>
          <p class="hdr-subline">বিকাশ অ্যাপে স্পেশাল ম্যাচডে অফার উপভোগ করুন</p>
        </div>
      </div>
    </div>
  </div>

  <div id="bkash_f3" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${bkashBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${bkashLogo}" class="logo-c" style="height:32px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content" style="flex-direction:row; align-items:center; justify-content:space-between; padding-right:20px;">
      <div>
        <h3 class="hdr-headline">বিকাশ অ্যাপ দিয়ে এখনই টিকেট কাটুন</h3>
        <p class="hdr-subline">অ্যাপ ওপেন করে 'টিকেট' অপশন সিলেক্ট করুন</p>
      </div>
      <div class="sb-cta-btn" style="background: #E2136E; padding:8px 18px; font-size:13px;">টিকিট বুক করুন ▶</div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       8. DARAZ HEADER (728×90) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="daraz_f1" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${darazBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${darazLogo}" class="logo-c" style="height:26px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <h3 class="hdr-headline">11.11 Football Mega Sports Festival</h3>
      <p class="hdr-subline">Official Club Jerseys, Boots & Training Equipment</p>
    </div>
  </div>

  <div id="daraz_f2" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${darazBg}" />
    <div class="hdr-scrim"></div>
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

  <!-- ══════════════════════════════════════════════════════════════
       9. ROBI HEADER (728×90) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="robi_f1" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${robiBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${robiLogo}" class="logo-c" style="height:32px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <h3 class="hdr-headline">Robi 4.5G Superfast Sports Pass</h3>
      <p class="hdr-subline">Buffer-Free HD Live Streaming Anywhere Across BD</p>
    </div>
  </div>

  <div id="robi_f2" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${robiBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${robiLogo}" class="logo-c" style="height:32px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <div style="display:flex; align-items:center; gap:14px;">
        <div class="burst-badge" style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);">
          <span class="burst-badge-num">৳২৯</span>
          <span class="burst-badge-text"><span>আনলিমিটেড</span><span>লাইভ পাস</span></span>
        </div>
        <div>
          <h3 class="hdr-headline">কোনো বাফারিং ছাড়া সব ফুটবল ম্যাচ লাইভ!</h3>
          <p class="hdr-subline">MyRobi অ্যাপ অথবা ডায়াল করুন *4#</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       10. GRAMEENPHONE HEADER (728×90) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="gp_f1" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${gpBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${gpLogo}" class="logo-c" style="height:30px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <h3 class="hdr-headline">Grameenphone 4G Matchday Stream</h3>
      <p class="hdr-subline">Stream Every Goal in Ultra-Sharp High Definition</p>
    </div>
  </div>

  <div id="gp_f2" class="frame-view hdr-banner">
    <img class="hdr-bg" src="${gpBg}" />
    <div class="hdr-scrim"></div>
    <div class="hdr-brand-col"><img src="${gpLogo}" class="logo-c" style="height:30px;" /></div>
    <div class="hdr-divider"></div>
    <div class="hdr-content">
      <div style="display:flex; align-items:center; gap:14px;">
        <div class="burst-badge" style="background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%);">
          <span class="burst-badge-num">৫ GB</span>
          <span class="burst-badge-text"><span>স্পোর্টস প্যাক</span><span>মাত্র ৳৪৭</span></span>
        </div>
        <div>
          <h3 class="hdr-headline">MyGP অ্যাপে আনলিমিটেড লাইভ ম্যাচ স্ট্রিম!</h3>
          <p class="hdr-subline">অ্যাক্টিভ করতে ডায়াল করুন *121*47#</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       11. FOODPANDA INFEED (728×160) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="foodpanda_f1" class="frame-view inf-banner">
    <img class="inf-bg" src="${foodpandaBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${foodpandaLogo}" class="logo-c" style="height:38px; max-width:140px; object-fit:contain;" />
    </div>
    <div class="inf-divider"></div>
    <div class="inf-content">
      <h3 class="inf-headline">Half-Time Matchday Feast Delivered in 20 Mins</h3>
      <p class="inf-subline">Hot Burgers, Crispy Wings & Chilled Drinks at Your Door</p>
    </div>
  </div>

  <div id="foodpanda_f2" class="frame-view inf-banner">
    <img class="inf-bg" src="${foodpandaBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${foodpandaLogo}" class="logo-c" style="height:38px; max-width:140px; object-fit:contain;" />
    </div>
    <div class="inf-divider"></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:18px;">
      <div class="burst-badge" style="background: linear-gradient(135deg, #EC4899 0%, #DB2777 100%);">
        <span class="burst-badge-num">৫০%</span>
        <span class="burst-badge-text"><span>স্পেশাল ছাড়</span><span>CODE: MATCH50</span></span>
      </div>
      <div>
        <h3 class="inf-headline">খেলা দেখতে দেখতে গরম খাবার ডেলিভারি!</h3>
        <p class="inf-subline">ম্যাচ চলাকালে কোড MATCH50 ব্যবহারে ৫০% ডিসকাউন্ট</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       12. CHALDAL INFEED (728×160) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="chaldal_f1" class="frame-view inf-banner">
    <img class="inf-bg" src="${chaldalBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${chaldalLogo}" class="logo-c" style="height:36px;" />
    </div>
    <div class="inf-divider"></div>
    <div class="inf-content">
      <h3 class="inf-headline">Chaldal 30-Minute Game Night Grocery Delivery</h3>
      <p class="inf-subline">Cold Drinks, Crisps, Ice Creams & Midnight Snacks</p>
    </div>
  </div>

  <div id="chaldal_f2" class="frame-view inf-banner">
    <img class="inf-bg" src="${chaldalBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${chaldalLogo}" class="logo-c" style="height:36px;" />
    </div>
    <div class="inf-divider"></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:18px;">
      <div class="burst-badge" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
        <span class="burst-badge-num">৳১০০</span>
        <span class="burst-badge-text"><span>ইনস্ট্যান্ট ছাড়</span><span>GAMENIGHT</span></span>
      </div>
      <div>
        <h3 class="inf-headline">ম্যাচের দিনে স্ন্যাক্স পৌঁছাবে ৩০ মিনিটে!</h3>
        <p class="inf-subline">চালডাল অ্যাপে প্রথম ৩ অর্ডারে ফ্রি ডেলিভারি</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       13. PRAN FOODS INFEED (728×160) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="pran_f1" class="frame-view inf-banner">
    <img class="inf-bg" src="${bataBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${pranLogo}" class="logo-c" style="height:38px;" />
    </div>
    <div class="inf-divider"></div>
    <div class="inf-content">
      <h3 class="inf-headline">PRAN Matchday Crunch & Family Feast Packs</h3>
      <p class="inf-subline">Jhal Muri, Potato Crackers & Real Mango Juice</p>
    </div>
  </div>

  <div id="pran_f2" class="frame-view inf-banner">
    <img class="inf-bg" src="${bataBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${pranLogo}" class="logo-c" style="height:38px;" />
    </div>
    <div class="inf-divider"></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:18px;">
      <div class="burst-badge" style="background: linear-gradient(135deg, #16A34A 0%, #15803D 100%);">
        <span class="burst-badge-num">২০%</span>
        <span class="burst-badge-text"><span>সেভিংস</span><span>ফ্যামিলি কম্বো</span></span>
      </div>
      <div>
        <h3 class="inf-headline">প্রাণ স্ন্যাক্সে জমুক আসল ফুটবল উৎসব!</h3>
        <p class="inf-subline">নিকটস্থ সুপারশপ ও অনলাইন গ্রোসারি স্টোরে উপলব্ধ</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       14. BRAC BANK INFEED (728×160) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="brac_f1" class="frame-view inf-banner">
    <img class="inf-bg" src="${citybankBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${bracbankLogo}" class="logo-c" style="height:36px;" />
    </div>
    <div class="inf-divider"></div>
    <div class="inf-content">
      <h3 class="inf-headline">BRAC Bank Astha — Next-Gen Digital Banking</h3>
      <p class="inf-subline">Zero Fee Fund Transfers & Matchday QR Payments</p>
    </div>
  </div>

  <div id="brac_f2" class="frame-view inf-banner">
    <img class="inf-bg" src="${citybankBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <img src="${bracbankLogo}" class="logo-c" style="height:36px;" />
    </div>
    <div class="inf-divider"></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:18px;">
      <div class="burst-badge" style="background: linear-gradient(135deg, #1E3A8A 0%, #172554 100%);">
        <span class="burst-badge-num">১০%</span>
        <span class="burst-badge-text"><span>ক্যাশব্যাক</span><span>ASTHA QR PAY</span></span>
      </div>
      <div>
        <h3 class="inf-headline">স্টেডিয়াম ফুড ও মার্চেন্ডাইজে ১০% ক্যাশব্যাক</h3>
        <p class="inf-subline">আস্থা কিউআর পেমেন্টে সর্বোচ্চ সেভিংস</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       15. FHB PRO SUPPORTER INFEED (728×160) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="fhbpro_f1" class="frame-view inf-banner">
    <img class="inf-bg" src="${trophyBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <span style="font-size:26px; font-weight:900; color:#EAB308;">★ PRO</span>
    </div>
    <div class="inf-divider"></div>
    <div class="inf-content">
      <h3 class="inf-headline">Upgrade to Football Hub Bangladesh PRO</h3>
      <p class="inf-subline">100% Zero Ads · 4K 60fps Broadcast Streams & Exclusive Tactical Radar</p>
    </div>
  </div>

  <div id="fhbpro_f2" class="frame-view inf-banner">
    <img class="inf-bg" src="${trophyBg}" />
    <div class="inf-scrim"></div>
    <div class="inf-brand-col">
      <span style="font-size:26px; font-weight:900; color:#EAB308;">★ PRO</span>
    </div>
    <div class="inf-divider"></div>
    <div style="position:relative; z-index:10; display:flex; align-items:center; gap:18px;">
      <div class="burst-badge" style="background: linear-gradient(135deg, #EAB308 0%, #CA8A04 100%);">
        <span class="burst-badge-num">০টি</span>
        <span class="burst-badge-text"><span style="color:#000;">বিজ্ঞাপন</span><span style="color:#000;">4K STREAM</span></span>
      </div>
      <div>
        <h3 class="inf-headline">ম্যাচের পুরো ৯০ মিনিট উপভোগ করুন বিজ্ঞাপনহীন!</h3>
        <p class="inf-subline">আজই জয়েন করুন প্রথম মাস মাত্র ৳৯৯ টাকায়</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       16. BKASH MOBILE (320×60) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="bkash_mob_f1" class="frame-view mob-banner">
    <img class="mob-bg" src="${bkashBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content">
      <img src="${bkashLogo}" class="logo-c" style="height:24px;" />
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">বিকাশ-এ ম্যাচ টিকিট</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">সহজ বুকিং ও নো লাইন</div>
      </div>
    </div>
  </div>

  <div id="bkash_mob_f2" class="frame-view mob-banner">
    <img class="mob-bg" src="${bkashBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content" style="gap:8px;">
      <div style="background:#E2136E; color:#FFF; font-size:11px; font-weight:900; padding:3px 7px; border-radius:5px;">১৫% ক্যাশব্যাক</div>
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">স্টেডিয়াম টিকেটে ছাড়!</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">বিকাশ অ্যাপে টিকিট কাটুন ▶</div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       17. WALTON MOBILE (320×60) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="walton_mob_f1" class="frame-view mob-banner">
    <img class="mob-bg" src="${waltonBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content">
      <img src="${waltonLogo}" class="logo-w" style="height:20px;" />
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">Walton 4K Google TV</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">Stadium Matchday Experience</div>
      </div>
    </div>
  </div>

  <div id="walton_mob_f2" class="frame-view mob-banner">
    <img class="mob-bg" src="${waltonBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content" style="gap:8px;">
      <div style="background:#D97706; color:#FFF; font-size:11px; font-weight:900; padding:3px 7px; border-radius:5px;">০% কিস্তি</div>
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">৫ বছরের ফুল ওয়ারেন্টি</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">ওয়ালটন প্লাজায় দেখুন ▶</div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       18. BATA MOBILE (320×60) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="bata_mob_f1" class="frame-view mob-banner">
    <img class="mob-bg" src="${bataBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content">
      <img src="${bataLogo}" class="logo-c" style="height:22px;" />
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">Bata Pro Turf Cleats</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">Dominate The Pitch</div>
      </div>
    </div>
  </div>

  <div id="bata_mob_f2" class="frame-view mob-banner">
    <img class="mob-bg" src="${bataBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content" style="gap:8px;">
      <div style="background:#E11D48; color:#FFF; font-size:11px; font-weight:900; padding:3px 7px; border-radius:5px;">২৫% ছাড়</div>
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">নতুন ফুটবল বুট ড্রপ</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">শপ করুন bata.com.bd ▶</div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════════════
       19. GP MOBILE (320×60) - 2 FRAMES
       ══════════════════════════════════════════════════════════════ -->
  <div id="gp_mob_f1" class="frame-view mob-banner">
    <img class="mob-bg" src="${gpBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content">
      <img src="${gpLogo}" class="logo-c" style="height:22px;" />
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">GP 4G Sports Stream</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">HD Live Match Broadcast</div>
      </div>
    </div>
  </div>

  <div id="gp_mob_f2" class="frame-view mob-banner">
    <img class="mob-bg" src="${gpBg}" />
    <div class="mob-scrim"></div>
    <div class="mob-content" style="gap:8px;">
      <div style="background:#0284C7; color:#FFF; font-size:11px; font-weight:900; padding:3px 7px; border-radius:5px;">৫ GB ৳৪৭</div>
      <div>
        <div style="font-size:12px; font-weight:900; color:#FFF;">আনলিমিটেড ম্যাচ স্ট্রিম</div>
        <div style="font-size:9.5px; font-weight:700; color:#CBD5E1;">MyGP অ্যাপে যান ▶</div>
      </div>
    </div>
  </div>

</body>
</html>`;

const tempPath = path.resolve('public/ads/generated/banners_v4_template.html');
fs.writeFileSync(tempPath, html);

async function captureAll() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9252',
    '--window-size=1920,1200',
    '--disable-gpu',
    '--no-sandbox',
    '--allow-file-access-from-files'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9252/json/new', { method: 'PUT' });
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
    await new Promise(r => setTimeout(r, 2500));

    // Await all web fonts completely loaded
    await send('Runtime.evaluate', {
      expression: 'document.fonts.ready',
      awaitPromise: true
    });
    console.log('Web fonts (Hind Siliguri, Cabinet Grotesk, Plus Jakarta Sans) ready!');

    const filterArg = process.argv[2];
    const bannerConfigs = [
      // Sidebars (300×250)
      { id: 'pathao_sidebar_300x250', w: 300, h: 250, frames: ['pathao_f1', 'pathao_f2', 'pathao_f3'], durations: [2400, 2600, 2400], fallbackFrame: 1 },
      { id: 'samsung_sidebar_300x250', w: 300, h: 250, frames: ['samsung_f1', 'samsung_f2', 'samsung_f3'], durations: [2400, 2600, 2400], fallbackFrame: 1 },
      { id: 'walton_sidebar_300x250', w: 300, h: 250, frames: ['walton_f1', 'walton_f2', 'walton_f3'], durations: [2400, 2600, 2400], fallbackFrame: 1 },
      { id: 'bata_sidebar_300x250', w: 300, h: 250, frames: ['bata_f1', 'bata_f2', 'bata_f3'], durations: [2400, 2600, 2400], fallbackFrame: 1 },
      { id: 'citybank_sidebar_300x250', w: 300, h: 250, frames: ['citybank_f1', 'citybank_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'netshort_sidebar_300x250', w: 300, h: 250, frames: ['netshort_f1', 'netshort_f2'], durations: [2800, 2800], fallbackFrame: 0 },

      // Headers (728×140) — increased height for luxury billboard presence
      { id: 'bkash_header_728x90', w: 728, h: 140, frames: ['bkash_f1', 'bkash_f2', 'bkash_f3'], durations: [2400, 2600, 2400], fallbackFrame: 1 },
      { id: 'daraz_header_728x90', w: 728, h: 140, frames: ['daraz_f1', 'daraz_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'robi_header_728x90', w: 728, h: 140, frames: ['robi_f1', 'robi_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'gp_header_728x90', w: 728, h: 140, frames: ['gp_f1', 'gp_f2'], durations: [2800, 2800], fallbackFrame: 1 },

      // In-Feeds (728×160) — increased height for editorial sponsored card presence
      { id: 'foodpanda_infeed_728x110', w: 728, h: 160, frames: ['foodpanda_f1', 'foodpanda_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'chaldal_infeed_728x110', w: 728, h: 160, frames: ['chaldal_f1', 'chaldal_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'pran_infeed_728x110', w: 728, h: 160, frames: ['pran_f1', 'pran_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'bracbank_infeed_728x110', w: 728, h: 160, frames: ['brac_f1', 'brac_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'fhb_premium_infeed_728x110', w: 728, h: 160, frames: ['fhbpro_f1', 'fhbpro_f2'], durations: [2800, 2800], fallbackFrame: 1 },

      // Mobiles (320×60)
      { id: 'bkash_mobile_320x60', w: 320, h: 60, frames: ['bkash_mob_f1', 'bkash_mob_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'walton_mobile_320x60', w: 320, h: 60, frames: ['walton_mob_f1', 'walton_mob_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'bata_mobile_320x60', w: 320, h: 60, frames: ['bata_mob_f1', 'bata_mob_f2'], durations: [2800, 2800], fallbackFrame: 1 },
      { id: 'gp_mobile_320x60', w: 320, h: 60, frames: ['gp_mob_f1', 'gp_mob_f2'], durations: [2800, 2800], fallbackFrame: 1 }
    ].filter(b => !filterArg || b.id.includes(filterArg));

    for (const b of bannerConfigs) {
      console.log('Processing:', b.id);
      const frameFiles = [];
      for (let i = 0; i < b.frames.length; i++) {
        const frameId = b.frames[i];
        
        // Activate only this frame at 0,0
        await send('Runtime.evaluate', {
          expression: `
            (() => {
              document.querySelectorAll('.frame-view').forEach(el => el.classList.remove('active'));
              const target = document.getElementById("${frameId}");
              if (target) target.classList.add('active');
            })()
          `
        });

        // Small render settle
        await new Promise(r => setTimeout(r, 60));

        const shot = await send('Page.captureScreenshot', {
          format: 'png',
          clip: {
            x: 0,
            y: 0,
            width: b.w,
            height: b.h,
            scale: 2 // 2x Retina resolution
          }
        });

        const framePath = `temp_${b.id}_f${i}.png`;
        fs.writeFileSync(framePath, Buffer.from(shot.data, 'base64'));
        frameFiles.push(framePath);
      }

      // Assemble 2x Retina Animated WebP, 2x Fallback JPG and 2x GIF using Python Pillow
      const pyScript = `
from PIL import Image

files = ${JSON.stringify(frameFiles)}
durations = ${JSON.stringify(b.durations)}
imgs = [Image.open(f).convert('RGB') for f in files]

out_webp = 'public/ads/generated/${b.id}.webp'
out_jpg = 'public/ads/generated/${b.id}.jpg'
out_gif = 'public/ads/generated/${b.id}.gif'

# 1. Ultra High Quality 24-bit TrueColor Animated WebP (16.7M colors, zero banding)
imgs[0].save(
    out_webp,
    save_all=True,
    append_images=imgs[1:],
    duration=durations,
    loop=0,
    lossless=False,
    quality=92,
    method=6
)

# 2. 2x Retina Fallback JPG (quality 94)
fallback_idx = ${b.fallbackFrame}
imgs[fallback_idx].save(out_jpg, quality=94)

# 3. 2x Retina Animated GIF for legacy fallback
base = imgs[0].quantize(colors=256, method=Image.Resampling.LANCZOS)
paletted = [im.quantize(palette=base) for im in imgs]
paletted[0].save(
    out_gif,
    save_all=True,
    append_images=paletted[1:],
    duration=durations,
    loop=0,
    optimize=True
)

print('Compiled ${b.id}: 2x WebP, 2x JPG, 2x GIF ready')
`;
      fs.writeFileSync('temp_gif_build.py', pyScript);
      const py = spawn('python', ['temp_gif_build.py']);
      await new Promise(r => py.on('close', r));

      // Clean up temp PNG frames
      for (const f of frameFiles) {
        try { fs.unlinkSync(f); } catch (e) {}
      }
    }

    try { fs.unlinkSync('temp_gif_build.py'); } catch (e) {}
    console.log('SUCCESS: ALL 19 BANNERS GENERATED AS 2x ANIMATED WEBPS, JPGS & GIFS!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

captureAll().catch(console.error);
