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
  Banknote,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navSections = [
  {
    title: "Overview",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/today", icon: CalendarCheck, label: "Today" },
    ],
  },
  {
    title: "Classes",
    items: [
      { href: "/admin/schedule", icon: Calendar, label: "Schedule" },
      { href: "/admin/sessions", icon: CalendarCheck, label: "Sessions" },
      { href: "/admin/attendance", icon: ClipboardCheck, label: "Attendance" },
    ],
  },
  {
    title: "Clients",
    items: [
      { href: "/admin/clients", icon: Users, label: "Clients" },
      { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
      { href: "/admin/payments", icon: Banknote, label: "Payments" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/notifications", icon: Bell, label: "Notifications" },
      { href: "/admin/content", icon: FileText, label: "Content" },
      { href: "/admin/media", icon: ImageIcon, label: "Media" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B8A8F] px-3 mb-1.5">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-[#F5E6EA] text-[#B87A88] font-medium"
                          : "text-[#9B8A8F] hover:text-[#2D2327] hover:bg-[#FEFCFD]"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Language Selector - opens site preview in new window */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-[#F0E8EB] bg-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9B8A8F] mb-2">Preview Site</p>
          <div className="flex gap-1">
            {(["en", "tr", "ru"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => window.open(`/?lang=${lang}`, "_blank")}
                className="flex-1 text-center px-2 py-1.5 text-[10px] font-medium rounded-lg border border-[#F0E8EB] hover:border-[#DCA8B2] hover:bg-[#F5E6EA] text-[#9B8A8F] hover:text-[#B87A88] transition-colors cursor-pointer"
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
