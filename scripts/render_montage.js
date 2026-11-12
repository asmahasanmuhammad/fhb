const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const dir = path.resolve('public/ads/generated');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #0b0f19; color: white; font-family: sans-serif; padding: 20px; }
  .grid { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
  .card { background: #131b2e; padding: 10px; border-radius: 8px; border: 1px solid #23314d; }
  .title { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
  img { display: block; border-radius: 6px; }
</style>
</head>
<body>
  <h2>All 19 Current Generated Commercial Banners</h2>
  <div class="grid">
    ${files.map(f => {
      const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
      return `
      <div class="card">
        <div class="title">${f}</div>
        <img src="data:image/jpeg;base64,${b64}" />
      </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

const tempHtml = path.resolve('temp_montage.html');
fs.writeFileSync(tempHtml, html);

async function captureMontage() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9245',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1600,2400'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  try {
    const res = await fetch('http://127.0.0.1:9245/json/new', { method: 'PUT' });
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
    const fileUrl = 'file:///' + tempHtml.replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 1500));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\all_banners_montage.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved all_banners_montage.png');
    ws.close();
  } finally {
    chrome.kill();
    if (fs.existsSync(tempHtml)) fs.unlinkSync(tempHtml);
  }
}
captureMontage();
