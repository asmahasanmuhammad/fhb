"use client";

import { useEffect, useState } from "react";
import { Download, X, Share2, PlusSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check if already installed / running in standalone mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone) return; // No prompt if already installed

    // Check if dismissed recently (cooldown 3 days)
    const dismissedAt = localStorage.getItem("fhbd_pwa_dismissed");
    if (dismissedAt && Date.now() - parseInt(dismissedAt, 10) < 3 * 864e5) {
      return;
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|OPiOS/.test(ua);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      // Delay iOS hint slightly so it doesn't obstruct initial load
      const t = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(t);
    }

    // 4. Android / Chrome beforeinstallprompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 3 seconds before displaying prompt for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // App installed event
    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide((v) => !v);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIosGuide(false);
    localStorage.setItem("fhbd_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        aria-label="Install App Banner"
        className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-[90] overflow-hidden rounded-xl border border-white/15 bg-card/95 dark:bg-[#0c101d]/95 backdrop-blur-xl p-3.5 shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e30206] p-1.5 shadow-md shadow-red-950/40">
            <img
              src="/logos/fhbd-badge.png"
              alt="FHBD Logo"
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-[13.5px] font-bold text-foreground leading-tight">
              Install FHBD App
            </h4>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground leading-snug truncate">
              Fast live scores &amp; news on your home screen
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-[7px] bg-[#e30206] px-3 text-[12px] font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Install
          </button>

          <button
            onClick={handleDismiss}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground/80 hover:bg-white/10 hover:text-foreground transition-colors"
            aria-label="Close install prompt"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        {/* iOS Guided Install Instructions */}
        {isIos && showIosGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 border-t border-border/60 pt-2.5 text-[12px] text-foreground/85 space-y-1.5"
          >
            <p className="font-semibold text-primary">To install on iPhone / iPad:</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>1. Tap Safari&apos;s Share button</span>
              <Share2 className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>2. Select &ldquo;Add to Home Screen&rdquo;</span>
              <PlusSquare className="h-4 w-4 text-primary" />
            </div>
          </motion.div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
