const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

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

// ─────────────────────────────────────────────────────────────
// 20 Commercial Display Banners (Cricbuzz / Google Ads Standard)
// ─────────────────────────────────────────────────────────────
const banners = [
  // ── 1. SIDEBAR BANNERS (300×250 MPU) ──
  {
    id: 'netshort_sidebar_300x250',
    type: 'sidebar-netshort',
    bg: getBase64('public/ads/netshort_clean_crop.png'),
    logo: getBase64('public/brands/netshort.png'),
  },
  {
    id: 'samsung_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/samsung_galaxy_banner.jpg'),
    logo: getBase64('public/brands/samsung.png'),
    logoClass: 'logo-white',
    logoHeight: 22,
    badge: 'Galaxy AI is Here',
    badgeColor: '#60A5FA',
    badgeBg: 'rgba(37, 99, 235, 0.25)',
    badgeBorder: 'rgba(96, 165, 250, 0.4)',
    headline: 'Galaxy S24 Ultra',
    subline: 'Capture Every Goal in 100x Zoom',
    offer: 'Pre-Order Now · Official Warranty'
  },
  {
    id: 'walton_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/walton_tv_banner.jpg'),
    logo: getBase64('public/brands/walton.png'),
    logoClass: 'logo-white',
    logoHeight: 26,
    badge: '120Hz 4K Google TV',
    badgeColor: '#38BDF8',
    badgeBg: 'rgba(14, 165, 233, 0.25)',
    badgeBorder: 'rgba(56, 189, 248, 0.4)',
    headline: 'Bring the Stadium Home',
    subline: 'Bezel-Less 4K Display & Dolby Atmos',
    offer: '০% সহজ কিস্তি (EMI) · ৫ বছরের ওয়ারেন্টি'
  },
  {
    id: 'citybank_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/citybank_vip_lounge.jpg'),
    logo: getBase64('public/brands/citybank.png'),
    logoText: 'CITY BANK AMEX',
    logoClass: 'logo-white',
    logoHeight: 28,
    badge: 'VIP Stadium Lounge',
    badgeColor: '#FBBF24',
    badgeBg: 'rgba(217, 119, 6, 0.25)',
    badgeBorder: 'rgba(251, 191, 36, 0.4)',
    headline: 'Matchday Hospitality',
    subline: 'Exclusive Stadium Box & Fast-Track Entry',
    offer: 'American Express Platinum Card Exclusive'
  },
  {
    id: 'pathao_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/pathao_matchday.jpg'),
    logo: getBase64('public/brands/pathao.png'),
    logoClass: 'logo-white',
    logoHeight: 26,
    badge: 'Promo: FHB40 · ৪০% ছাড়',
    badgeColor: '#FF4B63',
    badgeBg: 'rgba(239, 68, 68, 0.25)',
    badgeBorder: 'rgba(255, 75, 99, 0.4)',
    headline: 'Beat Stadium Traffic',
    subline: 'Fastest Matchday Rides & Hot Snacks',
    offer: 'Download on App Store & Google Play'
  },
  {
    id: 'bata_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/bata_boots.jpg'),
    logo: getBase64('public/brands/bata.png'),
    logoClass: 'logo-color',
    logoHeight: 30,
    badge: 'New Season Drop · ২৫% ছাড়',
    badgeColor: '#FB7185',
    badgeBg: 'rgba(244, 63, 94, 0.25)',
    badgeBorder: 'rgba(251, 113, 133, 0.4)',
    headline: 'Dominate the Pitch',
    subline: 'Pro Turf Cleats · Grip & Speed Control',
    offer: 'Official Match Boots at Bata Stores'
  },
  {
    id: 'robi_sidebar_300x250',
    type: 'sidebar',
    bg: getBase64('public/ads/robi_sports_pass.jpg'),
    logo: getBase64('public/brands/robi.svg'),
    logoText: 'robi 4.5G',
    logoClass: 'logo-color',
    logoHeight: 28,
    badge: 'No. 1 High Speed Network',
    badgeColor: '#F87171',
    badgeBg: 'rgba(220, 38, 38, 0.25)',
    badgeBorder: 'rgba(248, 113, 113, 0.4)',
    headline: 'Stream Football in Ultra HD',
    subline: 'Zero Buffering · Unlimited Sports Pass',
    offer: 'মাত্র ২৯ টাকায় আনলিমিটেড লাইভ পাস'
  },

  // ── 2. HEADER BILLBOARD LEADERBOARD BANNERS (728×90) ──
  {
    id: 'bkash_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/bkash_matchday_banner.jpg'),
    logo: getBase64('public/brands/bkash.png'),
    logoClass: 'logo-white',
    logoHeight: 26,
    badge: '১৫% ইনস্ট্যান্ট ক্যাশব্যাক',
    badgeColor: '#F472B6',
    badgeBg: 'rgba(236, 72, 153, 0.25)',
    headline: 'Book Stadium Match Tickets on bKash',
    subline: 'Instant e-Gate Entry · No Queue, No Hassle'
  },
  {
    id: 'daraz_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/daraz_mega_sale.jpg'),
    logo: getBase64('public/brands/daraz.png'),
    logoClass: 'logo-color',
    logoHeight: 24,
    badge: 'Mega Sports Fest · Up to ৭০% Off',
    badgeColor: '#FB923C',
    badgeBg: 'rgba(249, 115, 22, 0.25)',
    headline: 'Official Club Jerseys, Cleats & Match Gear',
    subline: 'ফ্রি ডেলিভারি + স্পেশাল ম্যাচডে ভাউচার'
  },
  {
    id: 'gp_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/gp_stadium_stream.jpg'),
    logo: getBase64('public/brands/grameenphone.svg'),
    logoText: 'GP 4G',
    logoClass: 'logo-color',
    logoHeight: 24,
    badge: '4K Stadium Pass · Zero Buffering',
    badgeColor: '#38BDF8',
    badgeBg: 'rgba(14, 165, 233, 0.25)',
    headline: 'Stream Every Football Match in Ultra HD',
    subline: 'Bangladesh\'s Fastest & Widest 4G Network'
  },
  {
    id: 'robi_header_728x90',
    type: 'header',
    bg: getBase64('public/ads/robi_sports_pass.jpg'),
    logo: getBase64('public/brands/robi.svg'),
    logoText: 'robi 4.5G',
    logoClass: 'logo-color',
    logoHeight: 24,
    badge: 'Official Live Streaming Partner',
    badgeColor: '#F87171',
    badgeBg: 'rgba(239, 68, 68, 0.25)',
    headline: 'Watch Football Live in Full HD on robi 4.5G',
    subline: 'Unlimited Matchday Data Packs from ৳২৯'
  },

  // ── 3. IN-FEED EDITORIAL BANNERS (728×110) ──
  {
    id: 'foodpanda_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/foodpanda_feast.jpg'),
    logo: getBase64('public/brands/foodpanda.svg'),
    logoText: 'foodpanda',
    logoClass: 'logo-color',
    logoHeight: 24,
    badge: 'Code: MATCH50 · ৫০% ছাড়',
    badgeColor: '#F472B6',
    badgeBg: 'rgba(236, 72, 153, 0.25)',
    headline: 'Half-Time Matchday Feast Delivered in 20 Mins',
    subline: 'Crispy Wings, Hot Burgers & Chilled Drinks at Your Door'
  },
  {
    id: 'chaldal_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/chaldal_gamenight.jpg'),
    logo: getBase64('public/brands/chaldal.png'),
    logoClass: 'logo-white',
    logoHeight: 26,
    badge: '৩০ মিনিটে ডেলিভারি · ৳১০০ অফ',
    badgeColor: '#FBBF24',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    headline: 'Cold Drinks, Nachos & Midnight Snacks',
    subline: 'Never Miss a Second of the Game · Express 30-Min Rush'
  },
  {
    id: 'pran_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/chaldal_gamenight.jpg'),
    logo: getBase64('public/brands/pran.png'),
    logoClass: 'logo-color',
    logoHeight: 30,
    badge: 'বাংলাদেশি স্বাদ · ২০% এক্সট্রা ক্রাঞ্চ',
    badgeColor: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.25)',
    headline: 'Pran Chanachur — The Official Snack of Matchday',
    subline: 'Crispy, Spicy & Authentic Taste for Every Goal Celebration'
  },
  {
    id: 'bracbank_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/citybank_vip_lounge.jpg'),
    logo: getBase64('public/brands/bracbank.svg'),
    logoClass: 'logo-color',
    logoHeight: 26,
    badge: '০% EMI · Digital Ticketing',
    badgeColor: '#60A5FA',
    badgeBg: 'rgba(37, 99, 235, 0.25)',
    headline: 'BRAC Bank Astha — Instant Season Ticket Financing',
    subline: 'Smart Mobile Banking for Football Fans Across Bangladesh'
  },
  {
    id: 'fhb_premium_infeed_728x110',
    type: 'infeed',
    bg: getBase64('public/ads/fhb_premium_trophy.jpg'),
    logo: getBase64('public/logo.svg'),
    logoText: 'Football Hub',
    logoClass: 'logo-color',
    logoHeight: 26,
    badge: 'Official Fan Pass · 100% Ad-Free',
    badgeColor: '#FBBF24',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    headline: 'FHB Premium — 4K Stream, Tactical Radar & Zero Ads',
    subline: 'Upgrade to Unlimited Football Intelligence for Just ৳৯৯/mo'
  },

  // ── 4. MOBILE STICKY BANNERS (320×60) ──
  {
    id: 'bkash_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/bkash_matchday_banner.jpg'),
    logo: getBase64('public/brands/bkash.png'),
    logoClass: 'logo-white',
    logoHeight: 20,
    badge: '১৫% ক্যাশব্যাক',
    badgeColor: '#F472B6',
    headline: 'Matchday Tickets on bKash',
    subline: 'Instant e-Gate Entry'
  },
  {
    id: 'walton_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/walton_tv_banner.jpg'),
    logo: getBase64('public/brands/walton.png'),
    logoClass: 'logo-white',
    logoHeight: 18,
    badge: '120Hz 4K Google TV',
    badgeColor: '#38BDF8',
    headline: 'Bring the Stadium Home',
    subline: '০% EMI · ৫ বছরের ওয়ারেন্টি'
  },
  {
    id: 'bata_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/bata_boots.jpg'),
    logo: getBase64('public/brands/bata.png'),
    logoClass: 'logo-color',
    logoHeight: 22,
    badge: '২৫% ছাড়',
    badgeColor: '#FB7185',
    headline: 'Dominate the Pitch with Bata',
    subline: 'Pro Turf Cleats'
  },
  {
    id: 'gp_mobile_320x60',
    type: 'mobile',
    bg: getBase64('public/ads/gp_stadium_stream.jpg'),
    logo: getBase64('public/brands/grameenphone.svg'),
    logoText: 'GP 4G',
    logoClass: 'logo-color',
    logoHeight: 18,
    badge: 'Zero Buffering',
    badgeColor: '#38BDF8',
    headline: 'Stream Football Live in 4K',
    subline: 'GP Superfast 4G'
  }
];

function buildHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Cabinet+Grotesk:wght@700;800;900&family=Hind+Siliguri:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #06080F;
      padding: 30px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    /* ══ Google AdChoices Official Badge (Exact Cricbuzz Standard) ══ */
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
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 9.5px;
      font-weight: 700;
      color: #334155;
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .adchoices-pill svg {
      display: block;
      width: 12px;
      height: 12px;
    }

    /* Brand Logo Wrap */
    .brand-wrap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .brand-wrap img {
      object-fit: contain;
      display: block;
    }
    .brand-wrap span {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 800;
      font-size: 17px;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 8px rgba(0,0,0,0.9);
    }
    .logo-white {
      filter: brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,0.85));
    }
    .logo-color {
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.9));
    }

    /* Badge Pill */
    .badge-pill {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 9999px;
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1.2;
      backdrop-filter: blur(8px);
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      width: fit-content;
    }

    /* App Store Badges Pill */
    .store-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(0,0,0,0.65);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      padding: 3px 8px;
      color: #f1f5f9;
      font-size: 9.5px;
      font-weight: 600;
      width: fit-content;
    }

    /* ═════════════════════════════════════════════════════════════════
       1. SIDEBAR BANNER (300×250 MPU)
       ═════════════════════════════════════════════════════════════════ */
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
      border: 1px solid rgba(255,255,255,0.08);
      background: #080C16;
    }
    .banner-sidebar .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    /* Subtle localized scrims only where text appears */
    .banner-sidebar .top-scrim {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 65px;
      background: linear-gradient(to bottom, rgba(6,8,15,0.82) 0%, rgba(6,8,15,0.2) 70%, transparent 100%);
      z-index: 2;
    }
    .banner-sidebar .bottom-scrim {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 110px;
      background: linear-gradient(to top, rgba(6,8,15,0.95) 0%, rgba(6,8,15,0.7) 60%, transparent 100%);
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
    .banner-sidebar .headline {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-size: 19px;
      font-weight: 800;
      line-height: 1.15;
      color: #FFFFFF;
      letter-spacing: -0.02em;
      text-shadow: 0 2px 6px rgba(0,0,0,0.9);
    }
    .banner-sidebar .subline {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      line-height: 1.3;
      text-shadow: 0 1px 4px rgba(0,0,0,0.9);
    }
    .banner-sidebar .offer {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      font-size: 9.5px;
      font-weight: 700;
      color: #94a3b8;
      margin-top: 1px;
    }

    /* ═════════════════════════════════════════════════════════════════
       1B. NETSHORT SIDEBAR BANNER (Faithful Cricbuzz Replica)
       ═════════════════════════════════════════════════════════════════ */
    .banner-netshort {
      width: 300px;
      height: 250px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.85);
      border: 1px solid rgba(255,255,255,0.08);
      background: #0c0f1a;
      display: flex;
      flex-direction: column;
    }
    .banner-netshort .hero-crop {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ═════════════════════════════════════════════════════════════════
       2. HEADER BILLBOARD LEADERBOARD (728×90)
       ═════════════════════════════════════════════════════════════════ */
    .banner-header {
      width: 728px;
      height: 90px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 22px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.8);
      border: 1px solid rgba(255,255,255,0.08);
      background: #080C16;
    }
    .banner-header .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .banner-header .h-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.95) 0%, rgba(6,8,15,0.82) 40%, rgba(6,8,15,0.2) 65%, transparent 85%);
      z-index: 2;
    }
    .banner-header .content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 540px;
    }
    .banner-header .divider {
      width: 1px;
      height: 38px;
      background: rgba(255,255,255,0.18);
    }
    .banner-header .text-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .banner-header .headline {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-size: 17.5px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      line-height: 1.15;
      text-shadow: 0 2px 6px rgba(0,0,0,0.9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 380px;
    }
    .banner-header .subline {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #cbd5e1;
      text-shadow: 0 1px 4px rgba(0,0,0,0.8);
    }

    /* ═════════════════════════════════════════════════════════════════
       3. IN-FEED EDITORIAL BANNER (728×110)
       ═════════════════════════════════════════════════════════════════ */
    .banner-infeed {
      width: 728px;
      height: 110px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      box-shadow: 0 14px 34px rgba(0,0,0,0.8);
      border: 1px solid rgba(255,255,255,0.08);
      background: #080C16;
    }
    .banner-infeed .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .banner-infeed .h-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.95) 0%, rgba(6,8,15,0.85) 42%, rgba(6,8,15,0.15) 70%, transparent 90%);
      z-index: 2;
    }
    .banner-infeed .content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 18px;
      max-width: 550px;
    }
    .banner-infeed .divider {
      width: 1px;
      height: 48px;
      background: rgba(255,255,255,0.18);
    }
    .banner-infeed .text-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .banner-infeed .headline {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      line-height: 1.15;
      text-shadow: 0 2px 6px rgba(0,0,0,0.9);
    }
    .banner-infeed .subline {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      font-size: 11.5px;
      font-weight: 600;
      color: #cbd5e1;
      text-shadow: 0 1px 4px rgba(0,0,0,0.85);
    }

    /* ═════════════════════════════════════════════════════════════════
       4. MOBILE STICKY BANNER (320×60)
       ═════════════════════════════════════════════════════════════════ */
    .banner-mobile {
      width: 320px;
      height: 60px;
      position: relative;
      overflow: hidden;
      border-radius: 10px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.7);
      border: 1px solid rgba(255,255,255,0.08);
      background: #080C16;
    }
    .banner-mobile .bg-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
    }
    .banner-mobile .h-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(6,8,15,0.96) 0%, rgba(6,8,15,0.85) 55%, transparent 100%);
      z-index: 2;
    }
    .banner-mobile .content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 260px;
    }
    .banner-mobile .text-col {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .banner-mobile .headline {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11.5px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 170px;
    }
    .banner-mobile .subline {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #94a3b8;
    }
  </style>
</head>
<body>

<!-- SVG Definition for Google AdChoices Icon -->
<svg style="display:none;">
  <defs>
    <g id="adchoices-icon-def">
      <polygon fill="#00a4e4" points="15,0 15,15 0,0"/>
      <circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/>
      <rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/>
    </g>
  </defs>
</svg>

${banners.map((b) => {
  // Google AdChoices Badge Macro
  const adBadge = `
    <div class="adchoices-pill">
      <span class="ad-text">Ad</span>
      <svg viewBox="0 0 15 15">
        <polygon fill="#00a4e4" points="15,0 15,15 0,0"/>
        <circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/>
        <rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/>
      </svg>
    </div>
  `;

  if (b.type === 'sidebar-netshort') {
    return `
      <div id="${b.id}" class="banner-netshort">
        <img class="hero-crop" src="${b.bg}" />
        ${adBadge}
      </div>
    `;
  }

  if (b.type === 'sidebar') {
    return `
      <div id="${b.id}" class="banner-sidebar">
        <img class="bg-img" src="${b.bg}" />
        <div class="top-scrim"></div>
        <div class="bottom-scrim"></div>
        ${adBadge}

        <div class="content-top">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
        </div>

        <div class="content-bottom">
          <span class="badge-pill" style="color: ${b.badgeColor}; background: ${b.badgeBg}; border: 1px solid ${b.badgeBorder};">
            ${b.badge}
          </span>
          <h3 class="headline">${b.headline}</h3>
          <p class="subline">${b.subline}</p>
          <p class="offer">${b.offer}</p>
        </div>
      </div>
    `;
  }

  if (b.type === 'header') {
    return `
      <div id="${b.id}" class="banner-header">
        <img class="bg-img" src="${b.bg}" />
        <div class="h-scrim"></div>
        ${adBadge}

        <div class="content">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
          <div class="divider"></div>
          <div class="text-col">
            <span class="badge-pill" style="color: ${b.badgeColor}; background: ${b.badgeBg};">
              ${b.badge}
            </span>
            <h3 class="headline">${b.headline}</h3>
            <p class="subline">${b.subline}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (b.type === 'infeed') {
    return `
      <div id="${b.id}" class="banner-infeed">
        <img class="bg-img" src="${b.bg}" />
        <div class="h-scrim"></div>
        ${adBadge}

        <div class="content">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
          <div class="divider"></div>
          <div class="text-col">
            <span class="badge-pill" style="color: ${b.badgeColor}; background: ${b.badgeBg};">
              ${b.badge}
            </span>
            <h3 class="headline">${b.headline}</h3>
            <p class="subline">${b.subline}</p>
          </div>
        </div>
      </div>
    `;
  }

  if (b.type === 'mobile') {
    return `
      <div id="${b.id}" class="banner-mobile">
        <img class="bg-img" src="${b.bg}" />
        <div class="h-scrim"></div>
        ${adBadge}

        <div class="content">
          <div class="brand-wrap">
            <img class="${b.logoClass}" style="height: ${b.logoHeight}px;" src="${b.logo}" />
            ${b.logoText ? `<span>${b.logoText}</span>` : ''}
          </div>
          <div class="text-col">
            <div style="display:flex; align-items:center; gap:5px;">
              <span style="font-size: 8px; font-weight: 700; color: ${b.badgeColor};">${b.badge}</span>
            </div>
            <h4 class="headline">${b.headline}</h4>
            <p class="subline">${b.subline}</p>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}).join('')}

</body>
</html>`;
}

async function run() {
  const htmlPath = path.resolve('public/ads/generated/banners_v3_template.html');
  fs.writeFileSync(htmlPath, buildHtml());
  console.log('Saved template to', htmlPath);

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--window-size=1600,4500',
    '--disable-gpu',
    '--no-sandbox',
    '--allow-file-access-from-files',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome-debug-gen-v3'
  ]);
  
  await new Promise(r => setTimeout(r, 1500));
  
  try {
    const newRes = await fetch('http://127.0.0.1:9227/json/new', { method: 'PUT' });
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
    await new Promise(r => setTimeout(r, 3500));

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
        quality: 94,
        clip: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          scale: 2 // 2x Retina scale for ultra razor-sharp display!
        }
      });

      const outPath = path.resolve('public/ads/generated', b.id + '.jpg');
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log('Saved:', b.id + '.jpg', Buffer.from(shot.data, 'base64').length, 'bytes');
    }

    console.log('ALL 20 CRICBUZZ-GRADE FLAT BANNERS GENERATED SUCCESSFULLY!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
