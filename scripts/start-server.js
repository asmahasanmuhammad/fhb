// scripts/start-server.js
const { spawn } = require("child_process");
const path = require("path");

console.log("[fhb-server] Starting Football Hub Bangladesh Server Suite...");

const nextBin = path.resolve(__dirname, "../node_modules/next/dist/bin/next");
const syncScript = path.resolve(__dirname, "real-match-sync.js");

let nextChild = null;
let syncChild = null;
let isShuttingDown = false;

function startNext() {
  if (isShuttingDown) return;

  console.log("[fhb-server] Spawning Next.js production server on port 3000...");
  nextChild = spawn(process.execPath, [nextBin, "start", "-p", "3000"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, NODE_ENV: "production", PORT: "3000" },
    stdio: ["ignore", "inherit", "inherit"],
  });

  nextChild.on("error", (err) => {
    console.error(`[fhb-server] Next.js process error: ${err.message}`);
  });

  nextChild.on("exit", (code, signal) => {
    console.log(`[fhb-server] Next.js exited (code: ${code}, signal: ${signal})`);
    if (!isShuttingDown) {
      console.log("[fhb-server] Auto-recovering Next.js in 2 seconds...");
      setTimeout(startNext, 2000);
    }
  });
}

function startSync() {
  if (isShuttingDown) return;

  console.log("[fhb-server] Spawning Real Football Data Background Sync Worker...");
  syncChild = spawn(process.execPath, [syncScript, "--daemon"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env },
    stdio: ["ignore", "inherit", "inherit"],
  });

  syncChild.on("error", (err) => {
    console.error(`[fhb-server] Sync worker process error: ${err.message}`);
  });

  syncChild.on("exit", (code, signal) => {
    console.log(`[fhb-server] Sync worker exited (code: ${code}, signal: ${signal})`);
    if (!isShuttingDown) {
      console.log("[fhb-server] Auto-recovering Sync worker in 5 seconds...");
      setTimeout(startSync, 5000);
    }
  });
}

function cleanup() {
  isShuttingDown = true;
  if (nextChild) nextChild.kill();
  if (syncChild) syncChild.kill();
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

process.on("uncaughtException", (err) => {
  console.error("[fhb-server] Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[fhb-server] Unhandled rejection:", reason);
});

startNext();
// Give Next.js a couple seconds to bind, then start background sync
setTimeout(startSync, 2000);
