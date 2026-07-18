"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomer, useCustomerEntries } from "@/lib/hooks";
import { formatDate, formatMoney } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { useToast } from "@/components/Toast";
import { deleteCustomer } from "@/lib/sync";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const showToast = useToast();
  const customer = useCustomer(id);
  const entries = useCustomerEntries(id);

  const balance =
    entries?.reduce((sum, e) => sum + (e.type === "sale" ? e.amount : -e.amount), 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors w-fit"
        >
          <Icon name="arrow_back" className="text-lg" />
          All customers
        </Link>
        {customer && (
          <button
            className="flex items-center gap-1.5 text-sm font-semibold text-error"
            onClick={() => {
              if (confirm(`Delete ${customer.name} and all their entries? This can't be undone.`)) {
                deleteCustomer(id);
                showToast(`${customer.name} deleted`);
                router.push("/");
              }
            }}
          >
            <Icon name="delete" className="text-lg" />
            Delete
          </button>
        )}
      </div>

      {customer === undefined && <p className="text-on-surface-variant text-sm">Loading...</p>}
      {customer === null && <p className="text-on-surface-variant text-sm">Customer not found.</p>}

      {customer && (
        <>
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-on-surface">{customer.name}</h1>
                {customer.phone && <p className="text-sm text-on-surface-variant mt-0.5">{customer.phone}</p>}
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                  Current Balance
                </p>
                <p
                  className={`text-3xl font-bold tracking-tight ${
                    balance > 0 ? "text-error" : balance < 0 ? "text-secondary" : "text-on-surface-variant"
                  }`}
                >
                  {balance === 0 ? "Paid up" : formatMoney(Math.abs(balance))}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/sales/new?customer=${id}`}
                className="bg-primary text-on-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Icon name="add_shopping_cart" className="text-lg" />
                Add Sale
              </Link>
              <Link
                href={`/payments/new?customer=${id}`}
                className="bg-transparent border border-outline text-on-surface px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-surface-variant active:scale-95 transition-transform"
              >
                <Icon name="payments" className="text-lg" />
                Add Payment
              </Link>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-on-surface-variant px-1">History</h2>
            {entries?.length === 0 && (
              <p className="text-on-surface-variant text-sm px-1">No entries yet for this customer.</p>
            )}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm divide-y divide-outline-variant/30">
              {[...(entries ?? [])].reverse().map((e) => (
                <div key={e.id} className="p-4 flex items-start gap-3">
                  <div
                    className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      e.type === "sale"
                        ? "bg-error-container text-error"
                        : "bg-secondary-container text-on-secondary-container"
                    }`}
                  >
                    <Icon name={e.type === "sale" ? "shopping_bag" : "check_circle"} className="text-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium text-on-surface">
                          {e.type === "sale" ? "Sale" : "Payment"}
                          {e.quantity ? ` · ${e.quantity} units` : ""}
                          {e.pending && <span className="text-secondary text-xs ml-2">(syncing)</span>}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {formatDate(e.entry_date)} · {e.recorded_by}
                        </p>
                      </div>
                      <p className={`font-bold shrink-0 ${e.type === "sale" ? "text-error" : "text-secondary"}`}>
                        {e.type === "sale" ? "+" : "-"}
                        {formatMoney(e.amount)}
                      </p>
                    </div>
                    {e.note && (
                      <div className="mt-2 bg-surface-container-low rounded px-2.5 py-1.5 border-l-2 border-outline-variant">
                        <p className="text-xs text-on-surface-variant italic">{e.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
