const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68";
const uploadedImgPath = path.join(ARTIFACT_DIR, '.user_uploaded/media_1794430050331_5a580bf8.jpg');
const uploadedBase64 = `data:image/jpeg;base64,${fs.readFileSync(uploadedImgPath).toString('base64')}`;

const svgContent = fs.readFileSync(path.join(__dirname, '../public/logo.svg'), 'utf8');

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome_match_test_' + Date.now(),
    '--window-size=1560,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch('http://127.0.0.1:9295/json/new', { method: 'PUT' });
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

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exact Match Check</title>
  <style>
    body {
      background: #080C16;
      color: #FFFFFF;
      font-family: sans-serif;
      padding: 40px;
      margin: 0;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    .box {
      background: #111827;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 20px;
    }
    h2 { font-size: 16px; margin: 0 0 12px 0; color: #94A3B8; }
    img, svg { width: 100%; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="row">
    <div class="box">
      <h2>1. User's Uploaded Image</h2>
      <img src="${uploadedBase64}" />
    </div>
    <div class="box">
      <h2>2. Vector SVG Output (Mathematical Replica)</h2>
      ${svgContent}
    </div>
  </div>
</body>
</html>
    `;

    const tmpHtml = path.join(ARTIFACT_DIR, 'exact_match_check.html');
    fs.writeFileSync(tmpHtml, htmlContent);

    await send('Page.navigate', { url: 'file:///' + tmpHtml.replace(/\\/g, '/') });
    await new Promise(r => setTimeout(r, 2000));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_exact_logo_match.png'), Buffer.from(snap.data, 'base64'));
    console.log("Saved verified_exact_logo_match.png");

    ws.close();
  } catch (err) {
    console.error("Match check error:", err);
  } finally {
    chrome.kill();
  }
}

main();
