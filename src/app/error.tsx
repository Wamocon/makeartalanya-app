"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to external service in production (Sentry, etc.)
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-[#FDF2F4] flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-[#2D2327] mb-2">Something went wrong</h1>
        <p className="text-sm text-[#9B8A8F] mb-6">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-[#DCA8B2] text-white text-sm font-medium rounded-xl hover:bg-[#B87A88] transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
