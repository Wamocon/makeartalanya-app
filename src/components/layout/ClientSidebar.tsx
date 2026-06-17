"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CalendarDays,
  GraduationCap,
  Bell,
  User,
  CreditCard,
  Users,
  LogOut,
  Globe,
  MessageSquare,
} from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
];

interface NavLabels {
  dashboard: string;
  myClasses: string;
  subscriptions: string;
  children: string;
  notifications: string;
  settings: string;
  browseSchedule: string;
  [key: string]: string;
}

interface ClientSidebarProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string | null;
  unreadCount: number;
  chatUnreadCount: number;
  navLabels: NavLabels;
}

export default function ClientSidebar({ userName, userEmail, avatarUrl, unreadCount, chatUnreadCount, navLabels }: ClientSidebarProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState("en");

  const navItems = [
    { href: "/my", icon: CalendarDays, label: navLabels.dashboard, exact: true },
    { href: "/my/classes", icon: GraduationCap, label: navLabels.myClasses },
    { href: "/my/subscriptions", icon: CreditCard, label: navLabels.subscriptions },
    { href: "/my/children", icon: Users, label: navLabels.children },
    { href: "/my/messages", icon: MessageSquare, label: navLabels.messages ?? "Messages" },
    { href: "/my/notifications", icon: Bell, label: navLabels.notifications },
    { href: "/my/settings", icon: User, label: navLabels.settings },
  ];

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((c) => c.startsWith("lang="));
    if (cookie) setLang(cookie.split("=")[1]);
  }, []);

  function handleLangChange(code: string) {
    setLang(code);
    document.cookie = `lang=${code};path=/;max-age=31536000`;
    window.location.reload();
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#F0E8EB] flex flex-col z-40">
      {/* Logo/Brand */}
      <div className="px-6 py-5 border-b border-[#F0E8EB]">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.jpg"
            alt="Make Art Studio"
            width={40}
            height={40}
            className="rounded-xl object-contain mix-blend-multiply"
            style={{ width: "auto", height: 40 }}
            priority
          />
          <div>
            <span className="text-sm font-bold text-[#2D2327] tracking-tight">Make Art</span>
            <span className="text-[10px] text-[#9B8A8F] block -mt-0.5">Alanya Studio</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          const notifBadge = item.href === "/my/notifications" && unreadCount > 0;
          const chatBadge = item.href === "/my/messages" && chatUnreadCount > 0;
          const badgeCount = notifBadge ? unreadCount : chatBadge ? chatUnreadCount : 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[var(--pink-light)] to-white text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--foreground)]"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-white shadow-sm" : "bg-[var(--background)] group-hover:bg-white"}`}>
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-[var(--pink-dark)]" : "text-[var(--muted)] group-hover:text-[var(--pink-dark)]"}`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </div>
              <span className="flex-1">{item.label}</span>
              {(notifBadge || chatBadge) && (
                <span className="min-w-[1.25rem] h-5 px-1 bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {badgeCount > 9 ? "9+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Schedule link */}
      <div className="px-3 pb-3">
        <Link
          href="/schedule"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#A9C7E5] hover:bg-[#EFF6FF] transition-all"
        >
          <CalendarDays className="w-4.5 h-4.5" strokeWidth={1.8} />
          <span>{navLabels.browseSchedule}</span>
        </Link>
      </div>

      {/* Language Switcher */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#9B8A8F]" />
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLangChange(l.code)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
                lang === l.code
                  ? "bg-[#F5E6EA] text-[#2D2327] font-medium"
                  : "text-[#9B8A8F] hover:bg-[#FAFAFA]"
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User card */}
      <div className="border-t border-[var(--border)] px-4 py-4">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-gradient-to-r from-[var(--pink-light)]/50 to-[var(--blue-light)]/30 border border-[var(--border)]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--pink)]/40 to-[var(--blue)]/40 flex items-center justify-center shrink-0 border border-white/60">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-[var(--foreground)]">
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{userName}</p>
            <p className="text-[11px] text-[var(--muted)] truncate">{userEmail}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="p-2 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-white/60 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
