"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { CalendarDays, GraduationCap, Bell, User, Globe } from "lucide-react";

const navItems = [
  { href: "/my", icon: CalendarDays, label: "Home" },
  { href: "/my/classes", icon: GraduationCap, label: "Classes" },
  { href: "/my/notifications", icon: Bell, label: "Alerts" },
  { href: "/my/settings", icon: User, label: "Profile" },
];

const LANGUAGES = [
  { code: "en", flag: "🇬🇧" },
  { code: "tr", flag: "🇹🇷" },
  { code: "ru", flag: "🇷🇺" },
];

export default function ClientNav({ userName, unreadCount = 0 }: { userName: string; unreadCount?: number }) {
  const pathname = usePathname();
  const [lang, setLang] = useState("en");
  const [showLang, setShowLang] = useState(false);

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((c) => c.startsWith("lang="));
    if (cookie) setLang(cookie.split("=")[1]);
  }, []);

  function handleLangChange(code: string) {
    setLang(code);
    document.cookie = `lang=${code};path=/;max-age=31536000`;
    setShowLang(false);
    window.location.reload();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#F0E8EB] z-50 safe-area-bottom">
      {/* Language popup */}
      {showLang && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-[#F0E8EB] rounded-xl shadow-lg p-2 flex gap-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLangChange(l.code)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                lang === l.code
                  ? "bg-[#F5E6EA] font-medium"
                  : "hover:bg-[#FAFAFA]"
              }`}
            >
              {l.flag}
            </button>
          ))}
        </div>
      )}
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
        {/* Language toggle */}
        <button
          onClick={() => setShowLang(!showLang)}
          className="relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all text-[#9B8A8F] hover:text-[#2D2327]"
        >
          <Globe className="w-5 h-5" strokeWidth={1.8} />
          <span className="text-[10px] font-medium">{lang.toUpperCase()}</span>
        </button>
      </div>
    </nav>
  );
}
