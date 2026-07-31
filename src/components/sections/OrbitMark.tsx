interface OrbitMarkProps {
  className?: string;
}

export function OrbitMark({ className = "" }: OrbitMarkProps) {
  return (
    <span className={`relative block size-12 ${className}`} aria-hidden="true">
      <span className="absolute inset-[5px] rounded-full border border-current/28" />
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-current/24" />
      <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      <span className="absolute right-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-current" />
    </span>
  );
}
