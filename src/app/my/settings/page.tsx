"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { LogOut, Globe, Moon, Sun, User } from "lucide-react";
import { getClientLocale, dashboardTranslations } from "@/i18n/dashboard";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

export default function MySettingsPage() {
  const router = useRouter();
  const [language, setLanguage] = useState("en");
  const [signingOut, setSigningOut] = useState(false);
  const locale = getClientLocale();
  const t = dashboardTranslations[locale].settings;

  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
  }

  function handleLanguageChange(code: string) {
    setLanguage(code);
    // Persist via cookie or profile
    document.cookie = `lang=${code};path=/;max-age=31536000`;
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-[#2D2327]">{t.title}</h1>

      {/* Language */}
      <section className="bg-white rounded-xl border border-[#F0E8EB] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-[#A9C7E5]" />
          <span className="text-sm font-medium text-[#2D2327]">{t.language}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
                language === lang.code
                  ? "bg-[#F5E6EA] border border-[#DCA8B2] text-[#2D2327] font-medium"
                  : "border border-[#F0E8EB] text-[#9B8A8F] hover:border-[#DCA8B2]"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Account */}
      <section className="bg-white rounded-xl border border-[#F0E8EB] p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-[#DCA8B2]" />
          <span className="text-sm font-medium text-[#2D2327]">{t.account}</span>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E5686B]/20 text-[#E5686B] hover:bg-[#E5686B]/5 transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">
              {signingOut ? t.signingOut : t.signOut}
            </span>
          </button>
        </div>
      </section>

      {/* App info */}
      <div className="text-center text-xs text-[#9B8A8F] pt-4">
        <p>Make Art Alanya • v1.0</p>
        <p className="mt-1">© 2024–2025 Make Art Studio</p>
      </div>
    </div>
  );
}
