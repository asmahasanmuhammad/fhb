const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

async function testThemes() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9240',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,950'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9240/json/new', { method: 'PUT' });
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

    // 1. Capture Dark Mode Home
    const darkShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_theme_dark_home.png', Buffer.from(darkShot.data, 'base64'));
    console.log('Saved verified_theme_dark_home.png');

    // 2. Click the Theme Toggle button to switch to Light Theme
    const clickRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[title*="theme"], button[aria-label*="theme"]');
          if (btn) {
            btn.click();
            return { clicked: true, title: btn.getAttribute('title') };
          }
          return { clicked: false };
        })()
      `,
      returnByValue: true
    });
    console.log('Toggle click result:', clickRes.result.value);

    // Wait for theme transition
    await new Promise(r => setTimeout(r, 1500));

    // Check html classes
    const htmlClasses = await send('Runtime.evaluate', {
      expression: 'document.documentElement.className',
      returnByValue: true
    });
    console.log('HTML classes after toggle:', htmlClasses.result.value);

    // 3. Capture Light Mode Home
    const lightShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_theme_light_home.png', Buffer.from(lightShot.data, 'base64'));
    console.log('Saved verified_theme_light_home.png');

    // 4. Scroll down to inspect Transfer Radar & Tactical Pitch in Light Mode
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 900)' });
    await new Promise(r => setTimeout(r, 1200));
    const radarShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_theme_light_radar.png', Buffer.from(radarShot.data, 'base64'));
    console.log('Saved verified_theme_light_radar.png');

    // 5. Scroll down to inspect Footer in Light Mode
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
    await new Promise(r => setTimeout(r, 1200));
    const footerShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_theme_light_footer.png', Buffer.from(footerShot.data, 'base64'));
    console.log('Saved verified_theme_light_footer.png');

    // 6. Test Mobile view in Light Mode
    await send('Emulation.setDeviceMetricsOverride', {
      width: 414,
      height: 896,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
    await new Promise(r => setTimeout(r, 1000));

    // Open mobile menu to see the drawer in light mode
    await send('Runtime.evaluate', {
      expression: 'document.querySelector(\'button[aria-label="Open menu"]\')?.click()'
    });
    await new Promise(r => setTimeout(r, 1200));
    const mobileDrawerShot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_theme_light_mobile_drawer.png', Buffer.from(mobileDrawerShot.data, 'base64'));
    console.log('Saved verified_theme_light_mobile_drawer.png');

    ws.close();
  } finally {
    chrome.kill();
  }
}

testThemes().catch(console.error);
