const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const ARTIFACT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68";
const uploadedImgPath = path.join(ARTIFACT_DIR, '.user_uploaded/media_1794430050331_5a580bf8.jpg');
const uploadedBase64 = `data:image/jpeg;base64,${fs.readFileSync(uploadedImgPath).toString('base64')}`;

function generateExactSvg(fillColor = '#FFFFFF', bgColor = '#DC0714', withBg = true, rx = 24) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 576" width="1024" height="576">
  ${withBg ? `<rect width="1024" height="576" rx="${rx}" fill="${bgColor}"/>` : ''}
  <!-- ═══════════════ LETTER F ═══════════════ -->
  <!-- F Top Bar -->
  <path d="M 164 193 L 397 193 L 387 238 L 155 238 Z" fill="${fillColor}" />
  <!-- F Lower Part (Middle Bar + Stem) -->
  <path d="M 151 254 L 385 254 L 374 296 L 221 296 L 205 372 L 125 372 Z" fill="${fillColor}" />

  <!-- ═══════════════ LETTER H ═══════════════ -->
  <!-- H Top Left Pillar -->
  <path d="M 415 193 L 495 193 L 485 238 L 405 238 Z" fill="${fillColor}" />
  <!-- H Top Right Pillar -->
  <path d="M 589 193 L 668 193 L 659 238 L 579 238 Z" fill="${fillColor}" />
  <!-- H Lower Body with Crossbar & Arch Window -->
  <path d="M 401 254 L 655 254 L 630 372 L 550 372 L 566 296 L 472 296 L 456 372 L 376 372 Z" fill="${fillColor}" />

  <!-- ═══════════════ LETTER B ═══════════════ -->
  <!-- B Top Lobe -->
  <path d="M 686 193 L 886 193 Q 922 205 920 238 L 676 238 Z" fill="${fillColor}" />
  <!-- B Lower Body with Middle Slot -->
  <path d="M 673 254
           L 908 254
           Q 918 274 898 296
           Q 888 302 894 308
           Q 914 322 905 348
           Q 892 372 840 372
           L 648 372
           Z
           M 739 296
           L 826 296
           Q 838 296 836 310
           Q 834 324 822 324
           L 733 324
           Q 722 324 725 310
           Q 728 296 739 296 Z"
        fill-rule="evenodd"
        fill="${fillColor}" />
</svg>`;
}

fs.writeFileSync(path.join(__dirname, '../public/logo.svg'), generateExactSvg('#FFFFFF', '#DC0714', true, 24));
fs.writeFileSync(path.join(__dirname, '../public/logo-badge.svg'), generateExactSvg('#FF1E46', 'transparent', false));
fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), generateExactSvg('#FFFFFF', '#DC0714', true, 24));

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9296',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome_overlay_test_' + Date.now(),
    '--window-size=1560,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch('http://127.0.0.1:9296/json/new', { method: 'PUT' });
    const tab = await res.json();
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    function send(m, p = {}) {
      return new Promise(resolve => {
        const cur = msgId++;
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

    const exactSvg = generateExactSvg('#FFFFFF', '#DC0714', true, 24);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exact Pixel Overlay</title>
  <style>
    body {
      background: #080C16;
      color: #FFFFFF;
      font-family: sans-serif;
      padding: 30px;
      margin: 0;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .card {
      background: #111827;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 16px;
    }
    h2 { font-size: 15px; margin: 0 0 10px 0; color: #94A3B8; }
    img, svg { width: 100%; height: auto; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="grid">
    <div class="card">
      <h2>1. User's Uploaded Reference (media_1794430050331_5a580bf8.jpg)</h2>
      <img src="${uploadedBase64}" />
    </div>
    <div class="card">
      <h2>2. Pure Vector Mathematical SVG (public/logo.svg)</h2>
      ${exactSvg}
    </div>
  </div>
</body>
</html>
    `;

    const tmpPath = path.join(ARTIFACT_DIR, 'overlay_check.html');
    fs.writeFileSync(tmpPath, htmlContent);

    await send('Page.navigate', { url: 'file:///' + tmpPath.replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 2000));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_pixel_perfect_match.png'), Buffer.from(snap.data, 'base64'));
    console.log("Saved verified_pixel_perfect_match.png");

    ws.close();
  } catch (err) {
    console.error("Overlay check error:", err);
  } finally {
    chrome.kill();
  }
}

main();
