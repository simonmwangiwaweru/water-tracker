"use client";

import { useState } from "react";
import Link from "next/link";
import { useCustomersWithBalances } from "@/lib/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { Icon } from "@/components/Icon";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function DashboardPage() {
  const customers = useCustomersWithBalances();
  const [query, setQuery] = useState("");

  const totalOwed = customers?.reduce((sum, c) => sum + Math.max(c.balance, 0), 0) ?? 0;
  const filtered = customers?.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex flex-col justify-between h-28">
          <span className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
            Total outstanding
          </span>
          <span className="text-3xl font-bold tracking-tight text-primary">{formatMoney(totalOwed)}</span>
        </div>
        <div className="bg-primary-container rounded-xl p-4 shadow-sm h-28 flex flex-col items-center justify-center text-center">
          <span className="text-on-primary-container text-xs font-semibold uppercase tracking-wider mb-1">
            Customers
          </span>
          <span className="text-on-primary text-xl font-bold">{customers?.length ?? 0}</span>
        </div>
      </div>

      <div className="relative">
        <Icon
          name="search"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none"
        />
        <input
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          placeholder="Search customers"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-low">
          <h2 className="font-semibold text-on-surface">Customers</h2>
          <Link href="/payments/new" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">
            + Add Payment
          </Link>
        </div>

        <div className="divide-y divide-outline-variant/30">
          {customers === undefined && <p className="text-on-surface-variant text-sm p-4">Loading...</p>}
          {customers?.length === 0 && (
            <p className="text-on-surface-variant text-sm p-4">
              No customers yet.{" "}
              <Link href="/sales/new" className="text-primary underline">
                Add your first sale
              </Link>{" "}
              to get started.
            </p>
          )}
          {customers && customers.length > 0 && filtered?.length === 0 && (
            <p className="text-on-surface-variant text-sm p-4">No customers match &quot;{query}&quot;.</p>
          )}
          {filtered?.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant text-on-surface-variant text-sm font-semibold">
                  {initials(c.name) || <Icon name="person" className="text-lg" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-on-surface truncate">{c.name}</span>
                    {c.isOverdue && (
                      <span className="shrink-0 bg-error/10 text-error px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        Overdue
                      </span>
                    )}
                  </div>
                  <span className="text-on-surface-variant text-xs">
                    {c.lastEntryDate ? `Last activity ${formatDate(c.lastEntryDate)}` : "No activity yet"}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span
                  className={`block font-bold ${
                    c.balance > 0 ? "text-error" : c.balance < 0 ? "text-secondary" : "text-on-surface-variant"
                  }`}
                >
                  {c.balance === 0 ? "Paid up" : formatMoney(Math.abs(c.balance))}
                </span>
                {c.balance < 0 && (
                  <span className="inline-block bg-secondary text-secondary-container px-2 rounded-full text-[10px] font-bold uppercase mt-0.5">
                    Credit
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/sales/new"
        className="fixed bottom-24 md:bottom-6 right-6 w-16 h-16 bg-primary-container text-on-primary rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform z-40"
        aria-label="Add sale"
      >
        <Icon name="add" className="text-3xl" />
      </Link>
    </div>
  );
}
