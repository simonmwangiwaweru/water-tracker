"use client";

import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Icon } from "./Icon";

export function SyncStatus() {
  const [online, setOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const pendingCount = useLiveQuery(() => db.entries.filter((e) => !!e.pending).count(), []) ?? 0;

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online && pendingCount === 0) return null;

  return (
    <div
      className={`text-xs px-3 py-2 flex items-center justify-center gap-1.5 font-medium border-t ${
        online
          ? "bg-secondary-container text-on-secondary-container border-outline-variant/30"
          : "bg-surface-container-low text-on-surface-variant border-outline-variant/30"
      }`}
    >
      <Icon name={online ? "sync" : "cloud_off"} className="text-[16px]" />
      {online
        ? `Syncing ${pendingCount} entr${pendingCount === 1 ? "y" : "ies"}...`
        : `Offline — will sync later${pendingCount ? ` (${pendingCount} waiting)` : ""}`}
    </div>
  );
}
