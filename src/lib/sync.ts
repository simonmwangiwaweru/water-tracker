import { supabase, isSupabaseConfigured } from "./supabase";
import { db } from "./db";
import type { Customer, Entry, FamilyMember, NewEntry } from "./types";

let syncing = false;

/** Pull the latest customers/family members/entries from Supabase into the local cache. */
export async function pullAll() {
  if (!isSupabaseConfigured) return;
  const [{ data: customers, error: customersErr }, { data: familyMembers, error: familyErr }, { data: entries, error: entriesErr }] =
    await Promise.all([
      supabase.from("customers").select("*").returns<Customer[]>(),
      supabase.from("family_members").select("*").returns<FamilyMember[]>(),
      supabase.from("entries").select("*").returns<Entry[]>(),
    ]);

  if (customersErr || familyErr || entriesErr) {
    throw customersErr ?? familyErr ?? entriesErr;
  }

  await db.transaction("rw", db.customers, db.familyMembers, db.entries, async () => {
    if (customers) await db.customers.bulkPut(customers);
    if (familyMembers) await db.familyMembers.bulkPut(familyMembers);
    if (entries) {
      // Don't clobber rows still waiting to be pushed.
      const pendingIds = new Set((await db.entries.filter((e) => !!e.pending).toArray()).map((e) => e.id));
      const toPut = entries.filter((e) => !pendingIds.has(e.id));
      await db.entries.bulkPut(toPut);
    }
  });
}

/** Push any locally-created entries that haven't made it to Supabase yet. */
export async function pushPending() {
  if (!isSupabaseConfigured) return;
  const pending = await db.entries.filter((e) => !!e.pending).toArray();
  for (const entry of pending) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pending: _pending, ...row } = entry;
    const { error } = await supabase.from("entries").upsert(row, { onConflict: "client_id" });
    if (!error) {
      await db.entries.update(entry.id, { pending: false });
    }
  }
}

/** Run a full sync cycle: push what we owe, then pull the latest shared state. */
export async function syncNow() {
  if (syncing || typeof navigator !== "undefined" && !navigator.onLine) return;
  syncing = true;
  try {
    await pushPending();
    await pullAll();
  } finally {
    syncing = false;
  }
}

export function startBackgroundSync() {
  if (typeof window === "undefined") return;

  syncNow();
  window.addEventListener("online", syncNow);
  const interval = setInterval(syncNow, 30_000);

  return () => {
    window.removeEventListener("online", syncNow);
    clearInterval(interval);
  };
}

/** Add a sale or payment. Always writes locally first so the UI never blocks on network. */
export async function addEntry(entry: NewEntry) {
  const localRow: Entry & { pending: boolean } = {
    ...entry,
    id: entry.client_id,
    created_at: new Date().toISOString(),
    pending: true,
  };
  await db.entries.put(localRow);
  // Fire-and-forget: the entry is already safe in Dexie, so a slow or failed
  // background sync must never block the caller (e.g. form navigation).
  syncNow().catch((err) => console.error("Background sync failed after addEntry", err));
}

export async function addCustomer(customer: Omit<Customer, "id" | "created_at">) {
  const id = crypto.randomUUID();
  const row: Customer = { ...customer, id, created_at: new Date().toISOString() };
  await db.customers.put(row);
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("customers").insert(row);
    if (error) {
      // Will be picked up by the next pullAll once online; keep it locally for now.
      console.error("Failed to sync new customer, will retry on next sync", error);
    }
  }
  return row;
}

export async function addFamilyMember(name: string) {
  const id = crypto.randomUUID();
  const row: FamilyMember = { id, name, created_at: new Date().toISOString() };
  await db.familyMembers.put(row);
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("family_members").insert(row);
    if (error) {
      console.error("Failed to sync new family member, will retry on next sync", error);
    }
  }
  return row;
}

export async function deleteFamilyMember(id: string) {
  await db.familyMembers.delete(id);
  if (isSupabaseConfigured) await supabase.from("family_members").delete().eq("id", id);
}

export async function deleteCustomer(id: string) {
  await db.transaction("rw", db.customers, db.entries, async () => {
    await db.customers.delete(id);
    await db.entries.where("customer_id").equals(id).delete();
  });
  // The entries FK is ON DELETE CASCADE, so removing the customer removes their entries too.
  if (isSupabaseConfigured) await supabase.from("customers").delete().eq("id", id);
}

export async function renameCustomer(id: string, name: string) {
  await db.customers.update(id, { name });
  if (isSupabaseConfigured) await supabase.from("customers").update({ name }).eq("id", id);
}
