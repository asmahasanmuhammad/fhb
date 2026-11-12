const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function testScreenshots() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9253',
    '--window-size=1600,1050',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:9253/json/new', { method: 'PUT' });
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
    await new Promise(r => setTimeout(r, 3000));

    // Dark Mode View
    let shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_live_animated_dark.png', Buffer.from(shot.data, 'base64'));

    // Wait 3 seconds to see banner animation frame change
    await new Promise(r => setTimeout(r, 3000));
    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_live_animated_dark_t2.png', Buffer.from(shot.data, 'base64'));

    // Switch to Light Mode
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label="Toggle theme"], button[title*="theme" i], button:has(svg.lucide-sun), button:has(svg.lucide-moon)');
          if (btn) btn.click();
          else document.documentElement.classList.remove('dark');
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/brain/a176efc7-08f3-4d5e-9b01-ff03bfc40e68/verified_live_animated_light.png', Buffer.from(shot.data, 'base64'));

    // Also take a close-up crop of the sidebar banner and header banner
    const evalRects = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const ads = Array.from(document.querySelectorAll('img')).filter(img => img.src.includes('/ads/generated/'));
          return ads.map(img => {
            const r = img.getBoundingClientRect();
            return { src: img.src, x: r.left, y: r.top, width: r.width, height: r.height };
          });
        })()
      `,
      returnByValue: true
    });
    console.log('Detected ad elements on live page:', evalRects.result.value);

    console.log('Captured verification screenshots successfully.');
    ws.close();
  } finally {
    chrome.kill();
  }
}

testScreenshots().catch(console.error);
