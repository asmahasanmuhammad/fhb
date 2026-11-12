const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function testWide() {
  // Test at 1920x1080 (standard full desktop resolution matching user's screen)
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9261',
    '--window-size=1920,1080',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9261/json/new', { method: 'PUT' });
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
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3500));

    // 1920x1080 shot
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_wide_1920_dark.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_wide_1920_dark.png');

    // Also 1600x1050
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1600,
      height: 1050,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await new Promise(r => setTimeout(r, 1000));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_wide_1600_dark.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_wide_1600_dark.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testWide().catch(console.error);
