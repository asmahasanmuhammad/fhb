const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const ARTIFACT_DIR = "C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68";

async function main() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9299',
    '--user-data-dir=C:\\Users\\Administrator\\AppData\\Local\\Temp\\chrome_light_' + Date.now(),
    '--window-size=1560,1100',
    '--disable-gpu',
    '--no-sandbox'
  ]);
  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch('http://127.0.0.1:9299/json/new', { method: 'PUT' });
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
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2500));

    // Toggle theme to light via clicking the theme toggle button or class
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      })()`
    });
    await new Promise(r => setTimeout(r, 1200));

    const snap = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_live_light_theme_logo.png'), Buffer.from(snap.data, 'base64'));
    console.log("Saved verified_live_light_theme_logo.png");

    ws.close();
  } catch (err) {
    console.error("Light theme test error:", err);
  } finally {
    chrome.kill();
  }
}

main();
