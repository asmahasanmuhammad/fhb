const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9230',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,900'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9230/json/new', { method: 'PUT' });
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
    const htmlFile = path.resolve('scripts/logo_preview2.html');
    const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 2000));

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true
    });

    const targetArtifact = 'C:\\Users\\Administrator\\.gemini\\antigravity\\brain\\a176efc7-08f3-4d5e-9b01-ff03bfc40e68\\fhb_logo_selection.png';
    fs.writeFileSync(targetArtifact, Buffer.from(shot.data, 'base64'));
    console.log('Artifact captured to:', targetArtifact);

    ws.close();
  } finally {
    chrome.kill();
  }
}

capture().catch(console.error);
