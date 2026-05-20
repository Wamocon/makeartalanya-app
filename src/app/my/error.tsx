"use client";

import { useEffect } from "react";

export default function MyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FDF2F4] flex items-center justify-center mb-5">
        <span className="text-2xl">😕</span>
      </div>
      <h2 className="text-lg font-semibold text-[#2D2327] mb-2">Something went wrong</h2>
      <p className="text-sm text-[#9B8A8F] max-w-xs mb-6">
        We couldn&apos;t load this page. This is usually temporary — try again.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#DCA8B2] text-white text-sm font-medium rounded-xl hover:bg-[#B87A88] transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
