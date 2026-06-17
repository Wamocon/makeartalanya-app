"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MyErrorPage({ error, reset }: Props) {
  useEffect(() => {
    console.error("[my/error]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-rose-500" />
        </div>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          We couldn&apos;t load this part of your portal. Please try again or return home.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} variant="secondary">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Link href="/my">
            <Button variant="ghost">
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
