"use client";

import { useEffect, useRef, useState } from "react";
import { Download, MonitorSmartphone, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavInstallButtonProps {
  className?: string;
  label?: string;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

/**
 * Permanent "Download app" button for the navigation bar. On browsers that
 * support it (Chrome/Edge/Android) it fires the native install prompt. On
 * devices without install prompts (desktop Safari, some Linux browsers) it
 * opens a short guide instead, so the button always does something useful.
 */
export function NavInstallButton({ className, label = "Install" }: NavInstallButtonProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [installed, setInstalled] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
    };
    const onInstalled = () => {
      setInstalled(true);
      setShowGuide(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleClick = async () => {
    const evt = promptRef.current;
    if (evt) {
      try {
        await evt.prompt();
        await evt.userChoice;
      } catch {
        // Prompt blocked — fall through to the guide instead of silently failing
      } finally {
        promptRef.current = null;
      }
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Download the JAL-SURAKSHA app"
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700",
          className
        )}
      >
        <Download className="h-4 w-4" />
        {installed ? "Installed" : label}
      </button>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isIOS() ? <Smartphone className="h-5 w-5" /> : <MonitorSmartphone className="h-5 w-5" />}
              Install JAL-SURAKSHA
            </DialogTitle>
            <DialogDescription>
              {isIOS()
                ? "Add JAL-SURAKSHA to your Home Screen for an app-like experience."
                : "Add JAL-SURAKSHA to your device. Use your browser's install/download command, or look for an install icon in the address bar."}
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm text-foreground">
            {isIOS() ? (
              <>
                <li className="flex gap-2.5">
                  <span className="font-number flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    1
                  </span>
                  Tap the Share button in Safari.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-number flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    2
                  </span>
                  Tap &quot;Add to Home Screen&quot;.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-number flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    3
                  </span>
                  Confirm, then launch JAL-SURAKSHA from your Home Screen.
                </li>
              </>
            ) : (
              <>
                <li className="flex gap-2.5">
                  <span className="font-number flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    1
                  </span>
                  Open the browser menu (⋮ or ≡).
                </li>
                <li className="flex gap-2.5">
                  <span className="font-number flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    2
                  </span>
                  Choose &quot;Install app&quot; or &quot;Add to Home Screen&quot;.
                </li>
                <li className="flex gap-2.5">
                  <span className="font-number flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    3
                  </span>
                  Launch it from the Home Screen or app drawer.
                </li>
              </>
            )}
          </ol>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}