"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { adminTranslations, type AdminLocale } from "@/i18n/admin-translations";

type AdminLocaleContextType = {
  locale: AdminLocale;
  setLocale: (l: AdminLocale) => void;
  t: typeof adminTranslations["en"];
};

const AdminLocaleContext = createContext<AdminLocaleContextType>({
  locale: "en",
  setLocale: () => {},
  t: adminTranslations.en,
});

export function useAdminLocale() {
  return useContext(AdminLocaleContext);
}

export default function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AdminLocale>("en");

  useEffect(() => {
    const stored = localStorage.getItem("admin-locale");
    if (stored && ["en", "tr", "ru"].includes(stored)) {
      setLocaleState(stored as AdminLocale);
    }
  }, []);

  const setLocale = (l: AdminLocale) => {
    setLocaleState(l);
    localStorage.setItem("admin-locale", l);
  };

  const t = adminTranslations[locale];

  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </AdminLocaleContext.Provider>
  );
}
