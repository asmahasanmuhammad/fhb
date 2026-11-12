const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function verifyTypography() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9258',
    '--window-size=1600,1050',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9258/json/new', { method: 'PUT' });
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

    // 1. Desktop PC View - Dark Mode
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_typography_pc_dark.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_typography_pc_dark.png');

    // 2. Scroll down to see in-feed banner & news cards
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 650, behavior: "instant" })' });
    await new Promise(r => setTimeout(r, 1500));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_typography_pc_infeed.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_typography_pc_infeed.png');

    // 3. Switch to Light Mode
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 0, behavior: "instant" })' });
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const themeBtn = btns.find(b => b.getAttribute('aria-label')?.includes('mode') || b.textContent.includes('Theme') || b.querySelector('svg.lucide-sun') || b.querySelector('svg.lucide-moon'));
        if (themeBtn) themeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 1500));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_typography_pc_light.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_typography_pc_light.png');

    // 4. Mobile Viewport (390 x 844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: 0, behavior: "instant" })' });
    await new Promise(r => setTimeout(r, 1500));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_typography_mobile.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_typography_mobile.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

verifyTypography().catch(console.error);
