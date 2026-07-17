export type EntryType = "sale" | "payment";

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  created_at: string;
}

export interface Entry {
  id: string;
  client_id: string | null;
  customer_id: string;
  type: EntryType;
  amount: number;
  quantity: number | null;
  recorded_by: string;
  note: string | null;
  entry_date: string;
  created_at: string;
}

export type NewEntry = Omit<Entry, "id" | "created_at"> & {
  client_id: string;
};

export interface CustomerWithBalance extends Customer {
  balance: number;
  lastEntryDate: string | null;
  oldestUnpaidDate: string | null;
}
