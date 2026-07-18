"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Icon } from "./Icon";

type ToastMessage = { id: number; text: string };

const ToastContext = createContext<((text: string) => void) | null>(null);

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error("useToast must be used within ToastProvider");
  return showToast;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 inset-x-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-on-surface text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 animate-toast-in"
          >
            <Icon name="check_circle" className="text-[18px]" />
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
