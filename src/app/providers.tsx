"use client";

import { useEffect } from "react";
import { startBackgroundSync } from "@/lib/sync";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only register the service worker in production. In dev, Next's fast
    // refresh serves new builds constantly; a cache-first SW would keep
    // returning a stale "/" that mismatches the fresh JS, forcing endless
    // reload loops.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("Service worker registration failed", err);
      });
    }
    const stop = startBackgroundSync();
    return stop;
  }, []);

  return <>{children}</>;
}
