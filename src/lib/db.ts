import Dexie, { type EntityTable } from "dexie";
import type { Customer, Entry, FamilyMember } from "./types";

// Local-first cache. Reads render from here; writes land here immediately
// so the UI never blocks on network. A `pending` flag marks rows created
// offline that still need to be pushed to Supabase.
export interface LocalEntry extends Entry {
  pending?: boolean;
}

class WaterTrackerDB extends Dexie {
  customers!: EntityTable<Customer, "id">;
  familyMembers!: EntityTable<FamilyMember, "id">;
  entries!: EntityTable<LocalEntry, "id">;

  constructor() {
    super("water-tracker");
    this.version(1).stores({
      customers: "id, name",
      familyMembers: "id, name",
      entries: "id, client_id, customer_id, entry_date, pending",
    });
  }
}

export const db = new WaterTrackerDB();
