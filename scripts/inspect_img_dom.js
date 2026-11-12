const { spawn } = require('child_process');
const WebSocket = require('ws');

async function inspectElements() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9251',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1200'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9251/json/new', { method: 'PUT' });
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

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const allImgs = Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('news'));
          return allImgs.map(img => {
            const rect = img.getBoundingClientRect();
            const cs = window.getComputedStyle(img);
            const parent = img.parentElement;
            return {
              src: img.src.split('?')[0],
              naturalW: img.naturalWidth,
              naturalH: img.naturalHeight,
              complete: img.complete,
              opacity: cs.opacity,
              zIndex: cs.zIndex,
              rect: { w: rect.width, h: rect.height, top: Math.round(rect.top), left: Math.round(rect.left) },
              parentClass: parent ? parent.className : '',
              parentStyle: parent ? parent.getAttribute('style') : ''
            };
          });
        })()
      `,
      returnByValue: true
    });

    console.log(JSON.stringify(evalRes, null, 2));

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

inspectElements();
