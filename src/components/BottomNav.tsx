"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const items = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/reports", label: "Reports", icon: "analytics" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-surface-container-lowest border-t border-outline-variant flex items-stretch">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${
              active ? "text-on-surface" : "text-on-surface-variant"
            }`}
          >
            <Icon
              name={item.icon}
              className={`text-xl ${active ? "bg-secondary-container text-on-secondary-container rounded-full px-3 py-1" : ""}`}
            />
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
