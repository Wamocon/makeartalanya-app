import { cn } from "@/lib/utils";

/**
 * The concierge mark is a tiny artist's seal: a loaded brush sweeping across
 * a palette. It deliberately avoids the generic robot/support-bubble look and
 * remains readable at launcher, header and message-avatar sizes.
 */
export function ConciergeAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fffaf2] text-[#241c1d]",
        className,
      )}
    >
      <svg viewBox="0 0 64 64" className="size-full" fill="none">
        <circle cx="32" cy="32" r="30" fill="#FFF9F0" stroke="currentColor" strokeWidth="2" />
        <path
          d="M18 42.5c2.8 5.2 8.1 8.3 14.1 8.3 8.9 0 16.1-7.1 16.1-15.8 0-3.4-1.1-6.6-3.1-9.2-2.8-3.6-8.5-2.7-10.1 1.6-.7 1.9-2.4 3.2-4.4 3.4-3.9.3-7.2 1.7-9.7 4.1"
          fill="#F7EDE4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="40.8" cy="32" r="2.5" fill="#8CB8D9" />
        <circle cx="42.4" cy="39.3" r="2.5" fill="#D9A13A" />
        <circle cx="35.6" cy="44" r="2.5" fill="#E86D87" />
        <path
          d="M18.5 43.4c2.7-.6 5-2.2 6.5-4.6 1.1-1.8 1.5-3.6 1.1-5.5l-5.6 1.2-4.2 5.1c-.9 1.1.7 4.1 2.2 3.8Z"
          fill="#E86D87"
        />
        <path
          d="m22.7 34.1 4.2 3.8L47.8 14c1.2-1.4 3.3-1.5 4.6-.3 1.3 1.2 1.4 3.2.2 4.5L30.3 40.7l-4.6-4.2-3-2.4Z"
          fill="#241C1D"
        />
        <path d="m46.3 15.8 4.3 3.8" stroke="#FFF9F0" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M15.8 45.3c3.8-.3 7.4-2.1 9.8-5"
          stroke="#241C1D"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
