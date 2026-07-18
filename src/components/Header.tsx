import Link from "next/link";
import { Icon } from "./Icon";
import { SyncStatus } from "./SyncStatus";
import { ConfigWarning } from "./ConfigWarning";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant">
      <div className="flex items-center justify-between px-4 h-16 max-w-2xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-on-surface">
          <Icon name="waves" className="text-2xl text-primary" />
          <span className="font-bold text-lg tracking-tight">Water Debts</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="font-semibold text-on-surface hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/reports" className="text-on-surface-variant hover:text-primary transition-colors">
            Reports
          </Link>
          <Link href="/settings" className="text-on-surface-variant hover:text-primary transition-colors">
            Settings
          </Link>
        </nav>
      </div>
      <ConfigWarning />
      <SyncStatus />
    </header>
  );
}
