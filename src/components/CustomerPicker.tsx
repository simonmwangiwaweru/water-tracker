"use client";

import { useState } from "react";
import { useAllCustomers } from "@/lib/hooks";
import { addCustomer } from "@/lib/sync";
import { Icon } from "./Icon";

export function CustomerPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (customerId: string) => void;
}) {
  const customers = useAllCustomers();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
          placeholder="Customer name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="button"
          className="rounded-lg bg-primary text-on-primary px-3 py-2.5 text-sm font-semibold disabled:opacity-50"
          disabled={!newName.trim()}
          onClick={async () => {
            const customer = await addCustomer({ name: newName.trim(), phone: null });
            onChange(customer.id);
            setAdding(false);
            setNewName("");
          }}
        >
          Add
        </button>
        <button
          type="button"
          className="rounded-lg border border-outline-variant px-3 py-2.5 text-sm text-on-surface-variant"
          onClick={() => setAdding(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        className="w-full h-12 rounded-lg border border-outline-variant bg-surface-container-low pl-3 pr-9 text-sm focus:ring-2 focus:ring-primary outline-none appearance-none"
        value={value}
        onChange={(e) => {
          if (e.target.value === "__new__") {
            setAdding(true);
          } else {
            onChange(e.target.value);
          }
        }}
      >
        <option value="" disabled>
          Select a customer
        </option>
        {customers?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value="__new__">+ Add new customer...</option>
      </select>
      <Icon
        name="expand_more"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none"
      />
    </div>
  );
}
