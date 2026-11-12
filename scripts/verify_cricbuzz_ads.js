const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function testAds() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9246',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9246/json/new', { method: 'PUT' });
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
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2500));

    // 1. Capture Header & Home
    const headerShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_cricbuzz_header_ad.png', Buffer.from(headerShot.data, 'base64'));
    console.log('Saved verified_cricbuzz_header_ad.png');

    // 2. Scroll to Sidebar Ad
    await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 720)' });
    await new Promise(r => setTimeout(r, 1200));

    const sidebarShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_cricbuzz_sidebar_ad.png', Buffer.from(sidebarShot.data, 'base64'));
    console.log('Saved verified_cricbuzz_sidebar_ad.png');

    // 3. Switch to Light Mode and capture
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[aria-label*="theme" i]') ||
                      document.querySelector('button[aria-label*="mode" i]') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('lucide-sun') || b.innerHTML.includes('lucide-moon'));
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const lightShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_cricbuzz_light_mode_ad.png', Buffer.from(lightShot.data, 'base64'));
    console.log('Saved verified_cricbuzz_light_mode_ad.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testAds().catch(console.error);
