"use client";

import { useState } from "react";
import { useAllCustomers, useFamilyMembers } from "@/lib/hooks";
import {
  addCustomer,
  addFamilyMember,
  deleteCustomer,
  deleteFamilyMember,
  renameCustomer,
} from "@/lib/sync";
import { useToast } from "@/components/Toast";

const rowClass =
  "bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 flex items-center justify-between shadow-sm";
const inputClass =
  "flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none";
const addButtonClass = "rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold tracking-tight text-primary">Settings</h1>
      <FamilyMembersSection />
      <CustomersSection />
    </div>
  );
}

function FamilyMembersSection() {
  const members = useFamilyMembers();
  const [name, setName] = useState("");
  const showToast = useToast();

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-sm font-semibold text-on-surface-variant px-1">Family members</h2>
      <p className="text-xs text-on-surface-variant px-1 -mt-1.5">
        These names show up in the &quot;recorded by&quot; dropdown when logging a sale or payment.
      </p>
      {members?.map((m) => (
        <div key={m.id} className={rowClass}>
          <span className="text-on-surface font-medium">{m.name}</span>
          <button
            className="text-sm font-semibold text-error"
            onClick={() => {
              if (confirm(`Remove ${m.name}?`)) {
                deleteFamilyMember(m.id);
                showToast(`${m.name} removed`);
              }
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await addFamilyMember(name.trim());
          showToast(`${name.trim()} added`);
          setName("");
        }}
      >
        <input
          className={inputClass}
          placeholder="Add a family member"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={addButtonClass}>Add</button>
      </form>
    </section>
  );
}

function CustomersSection() {
  const customers = useAllCustomers();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const showToast = useToast();

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-sm font-semibold text-on-surface-variant px-1">Customers</h2>
      {customers?.map((c) =>
        editingId === c.id ? (
          <div key={c.id} className={`${rowClass} gap-2`}>
            <input
              autoFocus
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
            />
            <button
              className="text-sm font-semibold text-primary"
              onClick={async () => {
                if (editingName.trim()) {
                  await renameCustomer(c.id, editingName.trim());
                  showToast(`Renamed to ${editingName.trim()}`);
                }
                setEditingId(null);
              }}
            >
              Save
            </button>
            <button className="text-sm text-on-surface-variant" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        ) : (
          <div key={c.id} className={rowClass}>
            <span className="text-on-surface font-medium">{c.name}</span>
            <div className="flex gap-4 text-sm">
              <button
                className="font-semibold text-primary"
                onClick={() => {
                  setEditingId(c.id);
                  setEditingName(c.name);
                }}
              >
                Rename
              </button>
              <button
                className="font-semibold text-error"
                onClick={() => {
                  if (confirm(`Delete ${c.name} and all their entries? This can't be undone.`)) {
                    deleteCustomer(c.id);
                    showToast(`${c.name} deleted`);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )
      )}
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await addCustomer({ name: name.trim(), phone: null });
          showToast(`${name.trim()} added`);
          setName("");
        }}
      >
        <input
          className={inputClass}
          placeholder="Add a customer"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={addButtonClass}>Add</button>
      </form>
    </section>
  );
}
