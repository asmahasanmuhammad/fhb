// scripts/supervisor.js
// Master Supervisor: Runs and keeps alive Next.js (port 3000) and Live-Service (port 3003)
const { spawn } = require("child_process");
const path = require("path");

console.log("[supervisor] Starting FHB Master Services Supervisor...");

const ROOT = path.resolve(__dirname, "..");
const NEXT_BIN = path.resolve(ROOT, "node_modules/next/dist/bin/next");
const LIVE_BIN = path.resolve(ROOT, "mini-services/live-service/index.js");

let nextProc = null;
let liveProc = null;
let isExiting = false;

function startNext() {
  if (isExiting) return;
  console.log("[supervisor] Launching Next.js on port 3000...");
  nextProc = spawn(process.execPath, [NEXT_BIN, "start", "-p", "3000"], {
    cwd: ROOT,
    env: { ...process.env, NODE_ENV: "production", PORT: "3000" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  nextProc.stdout.on("data", (d) => {
    const s = d.toString().trim();
    if (s) console.log(`[next] ${s}`);
  });

  nextProc.stderr.on("data", (d) => {
    const s = d.toString().trim();
    if (s) console.error(`[next:err] ${s}`);
  });

  nextProc.on("exit", (code, signal) => {
    console.warn(`[supervisor] Next.js exited with code ${code}, signal ${signal}`);
    if (!isExiting) {
      console.log("[supervisor] Restarting Next.js in 2s...");
      setTimeout(startNext, 2000);
    }
  });
}

function startLive() {
  if (isExiting) return;
  console.log("[supervisor] Launching Live-Service on port 3003...");
  liveProc = spawn(process.execPath, [LIVE_BIN], {
    cwd: ROOT,
    env: { ...process.env, PORT: "3003" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  liveProc.stdout.on("data", (d) => {
    const s = d.toString().trim();
    if (s) console.log(`[live] ${s}`);
  });

  liveProc.stderr.on("data", (d) => {
    const s = d.toString().trim();
    if (s) console.error(`[live:err] ${s}`);
  });

  liveProc.on("exit", (code, signal) => {
    console.warn(`[supervisor] Live-Service exited with code ${code}, signal ${signal}`);
    if (!isExiting) {
      console.log("[supervisor] Restarting Live-Service in 2s...");
      setTimeout(startLive, 2000);
    }
  });
}

// Start both
startNext();
startLive();

// Periodic heartbeat so logs never go silent (keeps powershell daemon alive)
setInterval(() => {
  const nextAlive = nextProc && !nextProc.killed && nextProc.exitCode === null;
  const liveAlive = liveProc && !liveProc.killed && liveProc.exitCode === null;
  console.log(`[supervisor:heartbeat ${new Date().toISOString()}] Next.js (3000): ${nextAlive ? "OK" : "DOWN"} | Live (3003): ${liveAlive ? "OK" : "DOWN"}`);
}, 30000);

process.on("SIGINT", () => {
  isExiting = true;
  if (nextProc) nextProc.kill();
  if (liveProc) liveProc.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  isExiting = true;
  if (nextProc) nextProc.kill();
  if (liveProc) liveProc.kill();
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  console.error("[supervisor] Uncaught exception:", err?.message || err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[supervisor] Unhandled rejection:", reason);
});
