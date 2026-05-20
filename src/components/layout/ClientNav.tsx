"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, GraduationCap, Bell, User } from "lucide-react";

const navItems = [
  { href: "/my", icon: CalendarDays, label: "Home" },
  { href: "/my/classes", icon: GraduationCap, label: "Classes" },
  { href: "/my/notifications", icon: Bell, label: "Alerts" },
  { href: "/my/settings", icon: User, label: "Profile" },
];

export default function ClientNav({ userName, unreadCount = 0 }: { userName: string; unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#F0E8EB] z-50 safe-area-bottom">
      <div className="max-w-xl mx-auto flex items-center justify-around py-2.5 px-6">
        {navItems.map((item) => {
          const isActive = item.href === "/my" 
            ? pathname === "/my" 
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          const showBadge = item.href === "/my/notifications" && unreadCount > 0;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all ${
                isActive
                  ? "text-[#2D2327]"
                  : "text-[#9B8A8F] hover:text-[#2D2327]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-[#DCA8B2]" : ""}`} strokeWidth={isActive ? 2.5 : 1.8} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#DCA8B2] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
