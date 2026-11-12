const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68";

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9301',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome_espn_' + Date.now(),
    '--window-size=1560,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch('http://127.0.0.1:9301/json/new', { method: 'PUT' });
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

    // 1. Desktop Header
    console.log("Navigating to home page (desktop)...");
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_espn_style_header.png'), Buffer.from(snap1.data, 'base64'));
    console.log("Saved verified_espn_style_header.png");

    // 2. Mobile View
    console.log("Testing mobile view (390x844)...");
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2500));

    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_espn_style_mobile.png'), Buffer.from(snap2.data, 'base64'));
    console.log("Saved verified_espn_style_mobile.png");

    // 3. Reset to desktop and check Footer
    await send('Emulation.clearDeviceMetricsOverride');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2000));
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, document.body.scrollHeight);` });
    await new Promise(r => setTimeout(r, 1200));

    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_espn_style_footer.png'), Buffer.from(snap3.data, 'base64'));
    console.log("Saved verified_espn_style_footer.png");

    // 4. Auth View
    console.log("Testing auth page...");
    await send('Page.navigate', { url: 'http://localhost:3000/?view=auth' });
    await new Promise(r => setTimeout(r, 2500));

    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_espn_style_auth.png'), Buffer.from(snap4.data, 'base64'));
    console.log("Saved verified_espn_style_auth.png");

    console.log("All ESPN-style verification screenshots captured successfully!");
    ws.close();
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    chrome.kill();
  }
}

main();
