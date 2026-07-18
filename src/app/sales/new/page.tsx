import { Suspense } from "react";
import { EntryForm } from "@/components/EntryForm";

export default function NewSalePage() {
  return (
    <Suspense fallback={null}>
      <EntryForm type="sale" />
    </Suspense>
  );
}
