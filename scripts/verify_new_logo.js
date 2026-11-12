const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

async function verifyLogo() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9234',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,950'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9234/json/new', { method: 'PUT' });
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
    await new Promise(r => setTimeout(r, 3000));

    // 1. Capture Header & Home View
    const homeShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_new_logo_header.png', Buffer.from(homeShot.data, 'base64'));
    console.log('Saved verified_new_logo_header.png');

    // 2. Scroll to Footer
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
    await new Promise(r => setTimeout(r, 1200));
    const footerShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_new_logo_footer.png', Buffer.from(footerShot.data, 'base64'));
    console.log('Saved verified_new_logo_footer.png');

    // 3. Navigate to Auth View
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In'));
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1500));
    const authShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_new_logo_auth.png', Buffer.from(authShot.data, 'base64'));
    console.log('Saved verified_new_logo_auth.png');

    // 4. Mobile Viewport Check
    await send('Emulation.setDeviceMetricsOverride', {
      width: 414,
      height: 896,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2000));
    const mobileShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_new_logo_mobile.png', Buffer.from(mobileShot.data, 'base64'));
    console.log('Saved verified_new_logo_mobile.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

verifyLogo().catch(console.error);
