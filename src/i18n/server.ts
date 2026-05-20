import { cookies } from "next/headers";
import type { Locale } from "./dashboard";

/** Read preferred language from the cookie (server-side only) */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value;
  if (lang === "tr" || lang === "ru") return lang;
  return "en";
}
