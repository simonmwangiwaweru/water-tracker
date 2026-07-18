"use client";

import { isSupabaseConfigured } from "@/lib/supabase";
import { Icon } from "./Icon";

export function ConfigWarning() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="bg-error-container text-on-error-container text-xs px-3 py-2 flex items-center justify-center gap-1.5 text-center border-t border-outline-variant/30">
      <Icon name="warning" className="text-[16px] shrink-0" />
      <span>
        Supabase isn&apos;t configured yet. Copy <code>.env.local.example</code> to{" "}
        <code>.env.local</code>, fill in your project URL and anon key, then restart the app.
      </span>
    </div>
  );
}
