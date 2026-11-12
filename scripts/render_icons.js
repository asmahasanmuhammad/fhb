const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

async function renderIcons() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless',
    '--remote-debugging-port=9232',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=600,600'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const newRes = await fetch('http://127.0.0.1:9232/json/new', { method: 'PUT' });
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
    const svgPath = path.resolve('public/logo.svg');
    const fileUrl = 'file:///' + svgPath.replace(/\\/g, '/');
    await send('Page.navigate', { url: fileUrl });
    await new Promise(r => setTimeout(r, 1000));

    // Render 512x512
    await send('Emulation.setDeviceMetricsOverride', {
      width: 512,
      height: 512,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 500));

    const shot512 = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path.resolve('public/logo-512.png'), Buffer.from(shot512.data, 'base64'));
    fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), Buffer.from(shot512.data, 'base64'));
    fs.writeFileSync(path.resolve('public/icon.png'), Buffer.from(shot512.data, 'base64'));
    console.log('Rendered 512x512 PNGs');

    // Render 64x64 favicon
    await send('Emulation.setDeviceMetricsOverride', {
      width: 64,
      height: 64,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 500));
    const shot64 = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
    fs.writeFileSync(path.resolve('public/favicon.png'), Buffer.from(shot64.data, 'base64'));
    // write to favicon.ico as well
    fs.writeFileSync(path.resolve('public/favicon.ico'), Buffer.from(shot64.data, 'base64'));
    fs.writeFileSync(path.resolve('src/app/favicon.ico'), Buffer.from(shot64.data, 'base64'));
    console.log('Rendered favicon PNG & ICO');

    ws.close();
  } finally {
    chrome.kill();
  }
}

renderIcons().catch(console.error);
