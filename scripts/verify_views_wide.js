const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function testViews() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9263',
    '--window-size=1920,1080',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9263/json/new', { method: 'PUT' });
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

    // 1. Standings
    await send('Page.navigate', { url: 'http://localhost:3000/?view=standings' });
    await new Promise(r => setTimeout(r, 2500));
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_wide_standings.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_wide_standings.png');

    // 2. News
    await send('Page.navigate', { url: 'http://localhost:3000/?view=news' });
    await new Promise(r => setTimeout(r, 2500));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_wide_news.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_wide_news.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testViews().catch(console.error);
