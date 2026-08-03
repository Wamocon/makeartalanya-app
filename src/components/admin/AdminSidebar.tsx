"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Users,
  CreditCard,
  Bell,
  Settings,
  FileText,
  Image as ImageIcon,
  ClipboardCheck,
  ClipboardList,
  Banknote,
  BookOpen,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useAdminLocale } from "./AdminLocaleProvider";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import type { AdminLocale } from "@/i18n/admin-translations";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, setLocale, t } = useAdminLocale();
  const { notifications: notifUnread, chat: chatUnread } = useUnreadCounts();

  const navSections = [
    {
      title: t.sidebar.overview,
      items: [
        { href: "/admin", icon: LayoutDashboard, label: t.sidebar.dashboard },
        { href: "/admin/today", icon: CalendarCheck, label: t.sidebar.today },
      ],
    },
    {
      title: t.sidebar.classes,
      items: [
        { href: "/admin/schedule", icon: Calendar, label: t.sidebar.schedule },
        { href: "/admin/sessions", icon: CalendarCheck, label: t.sidebar.sessions },
        { href: "/admin/attendance", icon: ClipboardCheck, label: t.sidebar.attendance },
      ],
    },
    {
      title: t.sidebar.clients,
      items: [
        { href: "/admin/registrations", icon: ClipboardList, label: t.sidebar.registrations },
        { href: "/admin/clients", icon: Users, label: t.sidebar.clients },
        { href: "/admin/subscriptions", icon: CreditCard, label: t.sidebar.subscriptions },
        { href: "/admin/payments", icon: Banknote, label: t.sidebar.payments },
      ],
    },
    {
      title: t.sidebar.system,
      items: [
        { href: "/admin/messages", icon: MessageSquare, label: t.sidebar.messages ?? "Messages" },
        { href: "/admin/notifications", icon: Bell, label: t.sidebar.notifications },
        { href: "/admin/content", icon: FileText, label: t.sidebar.content },
        { href: "/admin/media", icon: ImageIcon, label: t.sidebar.media },
        { href: "/admin/settings", icon: Settings, label: t.sidebar.settings },
        { href: "/admin/handbook", icon: BookOpen, label: t.sidebar.handbook },
      ],
    },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm border border-[#F0E8EB]"
      >
        <Menu className="w-5 h-5 text-[#2D2327]" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-[#F0E8EB] z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#F0E8EB]">
          <Link href="/admin" className="flex items-center gap-2">
            <NextImage src="/logo.jpg" alt="MakeArt" width={120} height={40} className="object-contain" style={{ height: 32, width: "auto" }} priority />
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5E6EA] text-[#B87A88] font-medium">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-[#9B8A8F] hover:text-[#2D2327]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-5 overflow-y-auto h-[calc(100%-4rem-4rem)]">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] px-3 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  const badgeCount =
                    item.href === "/admin/notifications" ? notifUnread :
                    item.href === "/admin/messages" ? chatUnread : 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[var(--pink-light)] to-white text-[var(--foreground)] shadow-[var(--shadow-sm)]"
                          : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--foreground)]"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? "bg-white shadow-sm" : "bg-[var(--background)] group-hover:bg-white"}`}>
                        <Icon className={`w-4 h-4 ${isActive ? "text-[var(--pink-dark)]" : "text-[var(--muted)] group-hover:text-[var(--pink-dark)]"}`} />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {badgeCount > 0 && (
                        <span className="min-w-[1.25rem] h-5 px-1 bg-gradient-to-r from-[var(--pink-dark)] to-[var(--pink)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                          {badgeCount > 9 ? "9+" : badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-[#F0E8EB] bg-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B8A8F] mb-2">{t.sidebar.language}</p>
          <div className="flex gap-1">
            {(["en", "tr", "ru"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLocale(lang as AdminLocale)}
                className={`flex-1 text-center px-2 py-1.5 text-[10px] font-medium rounded-lg border transition-colors cursor-pointer ${
                  locale === lang
                    ? "border-[#DCA8B2] bg-[#F5E6EA] text-[#B87A88]"
                    : "border-[#F0E8EB] hover:border-[#DCA8B2] hover:bg-[#F5E6EA] text-[#9B8A8F] hover:text-[#B87A88]"
                }`}
              >
                {lang === "en" ? "🇬🇧 EN" : lang === "tr" ? "🇹🇷 TR" : "🇷🇺 RU"}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
