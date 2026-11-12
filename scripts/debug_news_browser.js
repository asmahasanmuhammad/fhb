const { spawn } = require('child_process');
const WebSocket = require('ws');

async function debugNews() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9248',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1200'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9248/json/new', { method: 'PUT' });
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

    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Log.entryAdded') {
        console.log('[BROWSER LOG]', msg.params.entry);
      }
      if (msg.method === 'Network.responseReceived') {
        const res = msg.params.response;
        if (res.status >= 400 || res.url.includes('_next/image') || res.url.includes('/news/')) {
          console.log(`[NET ${res.status}] ${res.url.slice(0, 80)}`);
        }
      }
    });

    await send('Network.enable');
    await send('Log.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 2000));

    // Click "News" in nav
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button, a')).find(b => b.textContent.trim().toLowerCase() === 'news');
          if (btn) btn.click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 4000));

    // Inspect image elements in DOM
    const domRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            currentSrc: img.currentSrc
          }));
          return JSON.stringify(imgs);
        })()
      `,
      returnByValue: true
    });

    console.log('DOM Images:', JSON.parse(domRes.value));

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

debugNews();
