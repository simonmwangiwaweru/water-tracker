import { CURRENCY_SYMBOL } from "./config";

export function formatMoney(amount: number) {
  const sign = amount < 0 ? "-" : "";
  return `${sign}${CURRENCY_SYMBOL}${Math.abs(amount).toFixed(2)}`;
}

export function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
