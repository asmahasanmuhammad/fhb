const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

async function captureNews() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9244',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1200'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9244/json/new', { method: 'PUT' });
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

    await new Promise(r => setTimeout(r, 3000));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('news_view_current.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved news_view_current.png');

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

captureNews();
