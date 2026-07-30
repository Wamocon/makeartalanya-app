import { cn } from "@/lib/utils";

/**
 * The Make Art Studio concierge mark: a friendly artist's palette with three
 * paint dabs on a soft pink-to-blue brand disc. Reads warm and creative at any
 * size (launcher, header, message).
 */
export function ConciergeAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      <svg viewBox="0 0 48 48" className="size-full" fill="none">
        <circle cx="24" cy="24" r="24" fill="url(#mac_disc)" />
        {/* soft top light */}
        <circle cx="24" cy="24" r="24" fill="url(#mac_glow)" />
        {/* palette body */}
        <path
          d="M24 12c7.7 0 14 4.9 14 11 0 4-3.3 6.2-6.6 6.2-2 0-3.2-.8-4.4-.8-1 0-1.8.7-1.8 1.8 0 .8.5 1.4.5 2.4 0 2-1.9 3.2-4 3.2-7.2 0-13.7-5.9-13.7-13C8 17.4 15.5 12 24 12Z"
          fill="#ffffff"
        />
        {/* thumb hole */}
        <circle cx="24.5" cy="30.4" r="2.3" fill="url(#mac_disc)" />
        {/* paint dabs */}
        <circle cx="16.6" cy="21.4" r="2.2" fill="#E8A0B0" />
        <circle cx="23" cy="18.4" r="2.2" fill="#8CB8D9" />
        <circle cx="29.6" cy="20.6" r="2.2" fill="#F3B24A" />
        <defs>
          <linearGradient id="mac_disc" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E8A0B0" />
            <stop offset="1" stopColor="#8CB8D9" />
          </linearGradient>
          <radialGradient id="mac_glow" cx="0.5" cy="0.26" r="0.72" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </span>
  );
}
