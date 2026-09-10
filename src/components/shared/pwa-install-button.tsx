"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const dismissed = useRef(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      if (dismissed.current) return;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
    } catch {
      // Prompt blocked or failed — silently dismiss
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    dismissed.current = true;
  };

  if (!showBanner || !deferredPrompt) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-3 z-50 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-3 pr-4 shadow-xl"
      )}
    >
      <button
        type="button"
        onClick={handleInstall}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
        aria-label="Install JAL-SURAKSHA app"
      >
        <Download className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">Install App</p>
        <p className="text-xs text-slate-500">Add JAL-SURAKSHA to your home screen</p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="ml-2 shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
