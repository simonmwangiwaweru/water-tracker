import { Suspense } from "react";
import { EntryForm } from "@/components/EntryForm";

export default function NewPaymentPage() {
  return (
    <Suspense fallback={null}>
      <EntryForm type="payment" />
    </Suspense>
  );
}
