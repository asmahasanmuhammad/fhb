const { spawn } = require('child_process');
const WebSocket = require('ws');

async function inspectImgSrcs() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9252',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1200'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9252/json/new', { method: 'PUT' });
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
          const cards = Array.from(document.querySelectorAll('button')).filter(b => b.querySelector('h3'));
          return cards.map(c => {
            const title = c.querySelector('h3')?.textContent?.trim();
            const img = c.querySelector('img');
            return {
              title: title?.slice(0, 40),
              hasImg: !!img,
              imgSrc: img ? decodeURIComponent(img.src) : null,
              naturalW: img ? img.naturalWidth : 0,
              complete: img ? img.complete : false
            };
          });
        })()
      `,
      returnByValue: true
    });

    console.log(JSON.stringify(evalRes.result.value, null, 2));

    ws.close();
  } catch (e) {
    console.error(e);
  } finally {
    chrome.kill();
  }
}

inspectImgSrcs();
