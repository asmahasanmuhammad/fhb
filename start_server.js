const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('server.log', 'a');
const err = fs.openSync('server.log', 'a');

const p = spawn('node', ['node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
  detached: true,
  stdio: ['ignore', out, err]
});

p.unref();
console.log('Server started detached with PID:', p.pid);
