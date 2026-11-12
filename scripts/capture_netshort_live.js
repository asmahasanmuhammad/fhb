const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function shotNetShort() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9248',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  try {
    const res = await fetch('http://127.0.0.1:9248/json/new', { method: 'PUT' });
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
    await new Promise(r => setTimeout(r, 2000));
    
    // Set sidebar image directly to netshort to verify live in DOM
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('sidebar'));
          if (imgs.length > 0) {
            imgs[0].src = '/ads/generated/netshort_sidebar_300x250.jpg';
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));

    await send('Runtime.evaluate', { expression: 'window.scrollBy(0, 720)' });
    await new Promise(r => setTimeout(r, 1000));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\verified_netshort_sidebar_live.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved verified_netshort_sidebar_live.png');
    ws.close();
  } finally {
    chrome.kill();
  }
}
shotNetShort();
