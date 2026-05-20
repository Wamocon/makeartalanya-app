"use client";

import { useGsapScrollAnimations } from "@/hooks/useGsapAnimations";

export default function GsapProvider({ children }: { children: React.ReactNode }) {
  useGsapScrollAnimations();
  return <>{children}</>;
}
