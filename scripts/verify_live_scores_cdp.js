const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68";

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9288',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome_live_test_' + Date.now(),
    '--window-size=1560,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch('http://127.0.0.1:9288/json/new', { method: 'PUT' });
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

    // 1. Visit Live Scores view
    console.log("Navigating to Live Scores view (/?view=scores)...");
    await send('Page.navigate', { url: 'http://localhost:3000/?view=scores' });
    await new Promise(r => setTimeout(r, 3000));

    // Capture initial live score view
    const snap1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_live_scores_initial.png'), Buffer.from(snap1.data, 'base64'));
    console.log("Saved verified_live_scores_initial.png");

    // 2. Wait 8 seconds for live service ticks (minute advance & events)
    console.log("Waiting 8 seconds for live minute ticking and dynamic score updates...");
    await new Promise(r => setTimeout(r, 8000));

    const snap2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_live_scores_ticking.png'), Buffer.from(snap2.data, 'base64'));
    console.log("Saved verified_live_scores_ticking.png");

    // 3. Click Sync Real Matches button
    console.log("Clicking 'Sync Real Matches' button...");
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const syncBtn = btns.find(b => b.textContent && b.textContent.includes('Sync Real Matches'));
        if (syncBtn) {
          syncBtn.click();
          return true;
        }
        return false;
      })()`
    });

    await new Promise(r => setTimeout(r, 4500));
    const snap3 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_live_scores_synced.png'), Buffer.from(snap3.data, 'base64'));
    console.log("Saved verified_live_scores_synced.png");

    // 4. Visit Home page to verify top ticker, hero match live tick, and live banner
    console.log("Navigating to Home page (http://localhost:3000)...");
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 3000));

    const snap4 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_home_live_sync.png'), Buffer.from(snap4.data, 'base64'));
    console.log("Saved verified_home_live_sync.png");

    console.log("All real-time live score screenshots captured successfully!");
    ws.close();
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    chrome.kill();
  }
}

main();
