"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerPicker } from "./CustomerPicker";
import { RecordedByPicker } from "./RecordedByPicker";
import { addEntry } from "@/lib/sync";
import { todayIso } from "@/lib/format";
import { CURRENCY_SYMBOL } from "@/lib/config";
import { Icon } from "./Icon";
import type { EntryType } from "@/lib/types";

export function EntryForm({ type }: { type: EntryType }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customerId, setCustomerId] = useState(searchParams.get("customer") ?? "");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [recordedBy, setRecordedBy] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = customerId && Number(amount) > 0 && recordedBy;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setError(null);
    try {
      await addEntry({
        client_id: crypto.randomUUID(),
        customer_id: customerId,
        type,
        amount: Number(amount),
        quantity: type === "sale" && quantity ? Number(quantity) : null,
        recorded_by: recordedBy,
        note: note.trim() || null,
        entry_date: date,
      });
      router.push(`/customers/${customerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong saving this entry.");
    } finally {
      setSubmitting(false);
    }
  }

  const label = "block text-xs font-semibold text-outline uppercase tracking-wider mb-1.5";
  const fieldInput =
    "w-full h-12 rounded-lg border border-outline-variant bg-surface-container-low px-3 text-sm focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold tracking-tight text-primary">
        {type === "sale" ? "Record New Sale" : "Record New Payment"}
      </h1>
      <p className="text-sm text-on-surface-variant mb-2">
        {type === "sale"
          ? "Log a delivery and add it to the customer's balance."
          : "Log a payment and reduce the customer's balance."}
      </p>

      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-5 flex flex-col gap-5">
        <div>
          <label className={label} htmlFor="amount">
            Amount
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-0 text-3xl font-bold text-on-surface-variant/40">
              {CURRENCY_SYMBOL}
            </span>
            <input
              id="amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pl-7 text-3xl font-bold text-primary placeholder:text-outline-variant focus:border-primary outline-none transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="customer">
                Customer
              </label>
            </div>
            <CustomerPicker value={customerId} onChange={setCustomerId} />
          </div>
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="text-xs font-semibold text-outline uppercase tracking-wider" htmlFor="recorded_by">
                Recorded By
              </label>
            </div>
            <RecordedByPicker value={recordedBy} onChange={setRecordedBy} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {type === "sale" && (
            <div>
              <label className={label} htmlFor="quantity">
                Quantity — optional
              </label>
              <input
                id="quantity"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className={fieldInput}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 20"
              />
            </div>
          )}
          <div className={type === "sale" ? "" : "md:col-span-2"}>
            <label className={label} htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              className={fieldInput}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={label} htmlFor="note">
            Note — optional
          </label>
          <textarea
            id="note"
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm resize-none focus:ring-2 focus:ring-primary outline-none"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-error bg-error-container/50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={!valid || submitting}
          className="w-full h-14 bg-primary text-on-primary font-semibold rounded-xl hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{submitting ? "Saving..." : type === "sale" ? "Save Sale" : "Save Payment"}</span>
          {!submitting && <Icon name="arrow_forward" className="text-lg" />}
        </button>
      </form>
    </div>
  );
}
