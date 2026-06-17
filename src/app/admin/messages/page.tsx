import { Suspense } from "react";
import MessagesClient from "./MessagesClient";
import Spinner from "@/components/ui/Spinner";

export default function AdminMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <Spinner className="text-[var(--pink)]" />
        </div>
      }
    >
      <MessagesClient />
    </Suspense>
  );
}
