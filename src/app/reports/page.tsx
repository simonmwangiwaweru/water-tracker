"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { useCustomersWithBalances } from "@/lib/hooks";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function startOfWeekIso() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day;
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  return start.toISOString().slice(0, 10);
}

function startOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export default function ReportsPage() {
  const entries = useLiveQuery(() => db.entries.toArray(), []);
  const customers = useCustomersWithBalances();

  const weekStart = startOfWeekIso();
  const monthStart = startOfMonthIso();

  const sales = entries?.filter((e) => e.type === "sale") ?? [];
  const payments = entries?.filter((e) => e.type === "payment") ?? [];

  const soldThisWeek = sales.filter((e) => e.entry_date >= weekStart).reduce((s, e) => s + e.amount, 0);
  const soldThisMonth = sales.filter((e) => e.entry_date >= monthStart).reduce((s, e) => s + e.amount, 0);
  const totalOutstanding = customers?.reduce((s, c) => s + Math.max(c.balance, 0), 0) ?? 0;
  const totalCollected = payments.reduce((s, e) => s + e.amount, 0);

  const topDebtors = [...(customers ?? [])].filter((c) => c.balance > 0).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-primary">Reports</h1>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Sold this week" value={formatMoney(soldThisWeek)} />
        <Stat label="Sold this month" value={formatMoney(soldThisMonth)} />
        <Stat label="Total outstanding" value={formatMoney(totalOutstanding)} highlight="red" />
        <Stat label="Total collected" value={formatMoney(totalCollected)} highlight="secondary" />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-on-surface-variant px-1">Top debtors</h2>
        {topDebtors.length === 0 && (
          <p className="text-on-surface-variant text-sm px-1">Nobody owes anything right now.</p>
        )}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm divide-y divide-outline-variant/30">
          {topDebtors.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="p-4 flex items-center gap-3 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-9 h-9 shrink-0 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant text-on-surface-variant text-xs font-semibold">
                {initials(c.name)}
              </div>
              <span className="font-medium text-on-surface flex-1 truncate">{c.name}</span>
              <span className="text-error font-bold">{formatMoney(c.balance)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "red" | "secondary";
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
      <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">{label}</div>
      <div
        className={`text-xl font-bold tracking-tight ${
          highlight === "red" ? "text-error" : highlight === "secondary" ? "text-secondary" : "text-on-surface"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
