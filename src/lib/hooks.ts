"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import type { CustomerWithBalance } from "./types";
import { OVERDUE_DAYS } from "./config";

export function useCustomersWithBalances() {
  return useLiveQuery(async () => {
    const [customers, entries] = await Promise.all([db.customers.toArray(), db.entries.toArray()]);

    const byCustomer = new Map<string, typeof entries>();
    for (const entry of entries) {
      const list = byCustomer.get(entry.customer_id) ?? [];
      list.push(entry);
      byCustomer.set(entry.customer_id, list);
    }

    const now = Date.now();
    const result: CustomerWithBalance[] = customers.map((customer) => {
      const customerEntries = (byCustomer.get(customer.id) ?? []).sort((a, b) =>
        a.entry_date.localeCompare(b.entry_date)
      );

      let balance = 0;
      let lastEntryDate: string | null = null;
      let oldestUnpaidDate: string | null = null;

      for (const e of customerEntries) {
        balance += e.type === "sale" ? e.amount : -e.amount;
        if (!lastEntryDate || e.entry_date > lastEntryDate) lastEntryDate = e.entry_date;
      }

      // Oldest unpaid sale: walk sales oldest-first, track how much of the
      // running debt has since been paid off, first sale still outstanding wins.
      const sales = customerEntries.filter((e) => e.type === "sale");
      const totalPayments = customerEntries
        .filter((e) => e.type === "payment")
        .reduce((sum, e) => sum + e.amount, 0);
      let paidBudget = totalPayments;
      for (const sale of sales) {
        if (paidBudget >= sale.amount) {
          paidBudget -= sale.amount;
        } else {
          oldestUnpaidDate = sale.entry_date;
          break;
        }
      }

      return { ...customer, balance, lastEntryDate, oldestUnpaidDate };
    });

    return result
      .map((c) => ({
        ...c,
        isOverdue:
          !!c.oldestUnpaidDate &&
          c.balance > 0 &&
          (now - new Date(c.oldestUnpaidDate).getTime()) / 86_400_000 > OVERDUE_DAYS,
      }))
      .sort((a, b) => {
        if (a.balance <= 0 && b.balance <= 0) return 0;
        if (a.balance <= 0) return 1;
        if (b.balance <= 0) return -1;
        return b.balance - a.balance;
      });
  }, []);
}

export function useCustomer(customerId: string) {
  const customers = useAllCustomers();
  if (customers === undefined) return undefined; // still loading
  return customers.find((c) => c.id === customerId) ?? null; // null = not found
}

export function useCustomerEntries(customerId: string) {
  return useLiveQuery(
    () => db.entries.where("customer_id").equals(customerId).sortBy("entry_date"),
    [customerId]
  );
}

export function useAllCustomers() {
  return useLiveQuery(() => db.customers.orderBy("name").toArray(), []);
}

export function useFamilyMembers() {
  return useLiveQuery(() => db.familyMembers.orderBy("name").toArray(), []);
}
