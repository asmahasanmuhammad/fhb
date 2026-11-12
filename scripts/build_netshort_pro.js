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

const logoBase64 = getBase64('public/brands/netshort.png');
const poster2 = getBase64('public/brands/netshort_poster_2.jpg');
const poster3 = getBase64('public/brands/netshort_poster_3.jpg');
const poster4 = getBase64('public/brands/netshort_poster_4.jpg');
const peopleOnly = getBase64('public/ads/netshort_people_only.png');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&family=Playfair+Display:ital,wght@1,900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080F; padding: 40px; display: flex; gap: 30px; font-family: 'Plus Jakarta Sans', sans-serif; }

    .banner-netshort-pro {
      width: 300px;
      height: 250px;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      background: #0f1322;
      box-shadow: 0 16px 36px rgba(0,0,0,0.85);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Google AdChoices Badge */
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

    /* Top Lifestyle & App Callout Section */
    .top-half {
      position: relative;
      height: 144px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 10px 10px 0;
      background: linear-gradient(135deg, #181d2e 0%, #0e1220 100%);
    }
    .people-crop {
      height: 100%;
      width: 140px;
      object-fit: cover;
      object-position: left top;
      filter: contrast(1.1) brightness(1.05);
      mask-image: linear-gradient(to right, black 75%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, black 75%, transparent 100%);
    }

    .callout-box {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 7px;
      padding-top: 10px;
    }

    /* Search bar mockup */
    .search-bar {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      border-radius: 9999px;
      padding: 3px 10px 3px 5px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.45);
    }
    .search-bar img {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      display: block;
    }
    .search-bar span {
      font-size: 11px;
      font-weight: 800;
      color: #EF4444;
      letter-spacing: -0.01em;
    }

    /* FREE DRAMAS Pill */
    .free-dramas-pill {
      background: linear-gradient(135deg, #F59E0B 0%, #EC4899 100%);
      color: #FFFFFF;
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 13.5px;
      font-weight: 900;
      padding: 4px 12px;
      border-radius: 9999px;
      box-shadow: 0 4px 14px rgba(236,72,153,0.5);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    /* Store Badges Row */
    .store-badges {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .store-tag {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: rgba(0,0,0,0.85);
      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 4px;
      padding: 2.5px 6px;
      font-size: 7.5px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 0.02em;
    }

    /* Bottom Posters Showcase */
    .bottom-half {
      height: 106px;
      position: relative;
      z-index: 10;
      background: #080B14;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      padding: 5px 8px 6px;
    }
    .poster-item {
      position: relative;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.6);
      background: #1e293b;
    }
    .poster-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .poster-title {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 2px 3px;
      background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%);
      font-size: 7px;
      font-weight: 800;
      color: #f1f5f9;
      text-shadow: 0 1px 2px #000;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  </style>
</head>
<body>

  <!-- Recreated NetShort 300x250 Banner -->
  <div id="netshort_pro" class="banner-netshort-pro">
    <div class="adchoices-pill">
      <span class="ad-text">Ad</span>
      <svg viewBox="0 0 15 15">
        <polygon fill="#00a4e4" points="15,0 15,15 0,0"/>
        <circle cx="11.5" cy="4" r="1.1" fill="#ffffff"/>
        <rect x="10.8" y="6.5" width="1.4" height="4.2" rx="0.4" fill="#ffffff"/>
      </svg>
    </div>

    <div class="top-half">
      <img class="people-crop" src="${peopleOnly}" />

      <div class="callout-box">
        <div class="search-bar">
          <img src="${logoBase64}" />
          <span>NetShort</span>
        </div>
        <div class="free-dramas-pill">FREE DRAMAS</div>
        <div class="store-badges">
          <div class="store-tag">&#63743; App Store</div>
          <div class="store-tag">&#9654; Google Play</div>
        </div>
      </div>
    </div>

    <div class="bottom-half">
      <div class="poster-item">
        <img src="${poster2}" style="object-position: center top;" />
        <div class="poster-title">The Billionaire</div>
      </div>
      <div class="poster-item">
        <img src="${poster3}" style="object-position: right top;" />
        <div class="poster-title">Racing God</div>
      </div>
      <div class="poster-item">
        <img src="${poster4}" style="object-position: left center;" />
        <div class="poster-title">Sniper Hero</div>
      </div>
      <div class="poster-item">
        <img src="${poster2}" style="object-position: center bottom;" />
        <div class="poster-title">Revenge</div>
      </div>
    </div>
  </div>

</body>
</html>`;

const outHtml = path.resolve('public/ads/generated/netshort_pro_test.html');
fs.writeFileSync(outHtml, html);

async function capture() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--window-size=1200,800',
    '--disable-gpu',
    '--no-sandbox',
    '--allow-file-access-from-files'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  try {
    const res = await fetch('http://127.0.0.1:9229/json/new', { method: 'PUT' });
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
    const fileUrl = 'file:///' + outHtml.replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 2000));

    const rectRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById("netshort_pro");
          const r = el.getBoundingClientRect();
          return { x: r.left, y: r.top, width: r.width, height: r.height };
        })()
      `,
      returnByValue: true
    });
    const rect = rectRes.result.value;

    const shot = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 94,
      clip: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        scale: 2
      }
    });

    const outPath = path.resolve('public/ads/generated/netshort_sidebar_300x250.jpg');
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved ultra-clean high-res netshort_sidebar_300x250.jpg');
    ws.close();
  } finally {
    chrome.kill();
  }
}
capture().catch(console.error);
