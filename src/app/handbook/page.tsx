import Link from "next/link";
import { getLocale } from "@/i18n/server";
import { COMPANY, RULES_VERSION } from "@/lib/legal";
import { handbook } from "@/i18n/handbook";
import { LegalLangSwitcher } from "@/components/legal/LegalLangSwitcher";
import { HandbookSections, HandbookToc } from "@/components/handbook/HandbookBody";
import { HandbookVideo } from "@/components/handbook/HandbookVideo";
import { PrintButton } from "@/components/handbook/PrintButton";

export const metadata = {
  title: "Aile El Kitabı · Family Handbook · Справочник | Make Art Studio Alanya",
  description:
    "Make Art Studio Alanya hakkında bilmeniz gereken her şey: dersler, kayıt süreci, paketler, abonman kuralları, cayma hakkı ve veri haklarınız.",
};

/**
 * The family handbook.
 *
 * Deliberately a page rather than a downloadable PDF: the operational rules it
 * summarises come from /rules, and a PDF in circulation cannot be corrected once
 * a rule changes. The print button covers the handout case from the same source.
 *
 * Carries the same RULES_VERSION marker as /rules, because that is the document
 * this one summarises — a reader comparing the two should be able to see at a
 * glance whether they are looking at the same generation of the rules.
 */
export default async function HandbookPage() {
  const locale = await getLocale();
  const t = handbook[locale] ?? handbook.tr;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6 print:bg-white print:py-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/" className="inline-flex text-sm text-[var(--pink-dark)] hover:underline">
            ← {t.back}
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton label={t.printLabel} />
            <LegalLangSwitcher current={locale} />
          </div>
        </div>

        <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-9 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header>
            <p className="section-badge print:hidden">Make Art Studio Alanya</p>
            <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em] sm:text-4xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">{t.subtitle}</p>
            <p className="mt-4 text-xs text-[var(--muted)]">
              {t.updated}: {COMPANY.lastUpdated} · {RULES_VERSION}
            </p>
          </header>

          {/* Video first, then the written text it summarises. The recording is
              the fast path; the text below stays the complete and binding one. */}
          <HandbookVideo locale={locale} />

          <p className="mt-8 rounded-2xl bg-[var(--pink-light)]/55 p-4 text-sm leading-relaxed print:bg-transparent print:px-0">
            {t.intro}
          </p>

          {/* Sidebar on desktop, a plain block above the text on mobile. */}
          <div className="mt-10 gap-12 lg:grid lg:grid-cols-[15rem_1fr] lg:items-start">
            <div className="mb-10 lg:sticky lg:top-8 lg:mb-0">
              <HandbookToc sections={t.sections} label={t.contents} />
            </div>
            <HandbookSections sections={t.sections} />
          </div>

          <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--border)] pt-5 text-sm print:hidden">
            <Link href="/kayit" className="text-[var(--pink-dark)] underline">
              /kayit
            </Link>
            <Link href="/rules" className="text-[var(--pink-dark)] underline">
              /rules
            </Link>
            <Link href="/privacy" className="text-[var(--pink-dark)] underline">
              /privacy
            </Link>
            <Link href="/terms" className="text-[var(--pink-dark)] underline">
              /terms
            </Link>
            <Link href="/cookies" className="text-[var(--pink-dark)] underline">
              /cookies
            </Link>
            <Link href="/imprint" className="text-[var(--pink-dark)] underline">
              /imprint
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
