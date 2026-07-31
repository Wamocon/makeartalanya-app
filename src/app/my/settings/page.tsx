"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { LogOut, Globe, User, Check, Loader2 } from "lucide-react";
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

  // Profile — there was no way to correct your own name or phone number.
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (!cancelled) setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      setFullName(data?.full_name ?? "");
      setPhone(data?.phone ?? "");
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Your session expired — please sign in again.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq("id", user.id);

    if (updateError) setError(updateError.message);
    else {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

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

      {/* Profile */}
      <section className="bg-white rounded-xl border border-[#F0E8EB] p-4">
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-[#DCA8B2]" />
          <span className="text-sm font-medium text-[#2D2327]">Profile</span>
        </div>

        {loaded ? (
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label htmlFor="full_name" className="text-xs font-medium text-[#9B8A8F]">
                Full name
              </label>
              <input
                id="full_name"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
                required
                maxLength={120}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[#F0E8EB] text-sm focus:outline-none focus:border-[#DCA8B2]"
              />
            </div>
            <div>
              <label htmlFor="phone" className="text-xs font-medium text-[#9B8A8F]">
                Phone (WhatsApp)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
                maxLength={25}
                placeholder="+90 5xx xxx xx xx"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[#F0E8EB] text-sm focus:outline-none focus:border-[#DCA8B2]"
              />
            </div>

            {error && <p className="text-xs text-[#E5686B]">{error}</p>}

            <button
              type="submit"
              disabled={saving || !fullName.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#DCA8B2] text-white text-sm font-medium hover:bg-[#B87A88] disabled:opacity-50 transition-colors"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saved && !saving && <Check className="w-3.5 h-3.5" />}
              {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-[#9B8A8F]">Loading…</p>
        )}
      </section>

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
