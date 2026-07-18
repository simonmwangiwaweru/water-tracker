"use client";

import { useState } from "react";
import { useFamilyMembers } from "@/lib/hooks";
import { addFamilyMember } from "@/lib/sync";
import { Icon } from "./Icon";

export function RecordedByPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const members = useFamilyMembers();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  if (adding) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
          placeholder="Your name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="button"
          className="rounded-lg bg-primary text-on-primary px-3 py-2.5 text-sm font-semibold disabled:opacity-50"
          disabled={!newName.trim()}
          onClick={async () => {
            const member = await addFamilyMember(newName.trim());
            onChange(member.name);
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
          Who&apos;s logging this?
        </option>
        {members?.map((m) => (
          <option key={m.id} value={m.name}>
            {m.name}
          </option>
        ))}
        <option value="__new__">+ Add my name...</option>
      </select>
      <Icon
        name="expand_more"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline text-xl pointer-events-none"
      />
    </div>
  );
}
