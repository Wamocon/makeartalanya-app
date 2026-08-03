"use client";

import Link from "next/link";
import { COMPANY, RULES_VERSION } from "@/lib/legal";
import { internalHandbook } from "@/i18n/handbook-internal";
import { useAdminLocale } from "@/components/admin/AdminLocaleProvider";
import { HandbookSections, HandbookToc } from "@/components/handbook/HandbookBody";
import { PrintButton } from "@/components/handbook/PrintButton";

/**
 * The internal manual follows the dashboard language, not the public `lang`
 * cookie — staff who run the panel in English should not get a Turkish manual
 * because a visitor's cookie says so. That locale lives in React context, which
 * is why this page is a client component.
 */
export default function InternalHandbookClient() {
  const { locale } = useAdminLocale();
  const t = internalHandbook[locale] ?? internalHandbook.en;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/admin" className="inline-flex text-sm text-[var(--pink-dark)] hover:underline">
          ← {t.back}
        </Link>
        <PrintButton label={t.printLabel} />
      </div>

      <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)] sm:p-9 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header>
          <p className="inline-flex rounded-full bg-[var(--blue)]/15 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--foreground)] print:bg-transparent print:px-0">
            {t.subtitle}
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{t.title}</h1>
          <p className="mt-4 text-xs text-[var(--muted)]">
            {t.updated}: {COMPANY.lastUpdated} · {RULES_VERSION}
          </p>
        </header>

        <p className="mt-7 rounded-2xl bg-[var(--pink-light)]/55 p-4 text-sm leading-relaxed print:bg-transparent print:px-0">
          {t.intro}
        </p>

        <div className="mt-10 gap-12 lg:grid lg:grid-cols-[15rem_1fr] lg:items-start">
          <div className="mb-10 lg:sticky lg:top-24 lg:mb-0">
            <HandbookToc sections={t.sections} label={t.contents} />
          </div>
          <HandbookSections sections={t.sections} />
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-[var(--border)] pt-5 text-sm print:hidden">
          <Link href="/handbook" className="text-[var(--pink-dark)] underline">
            /handbook
          </Link>
          <Link href="/rules" className="text-[var(--pink-dark)] underline">
            /rules
          </Link>
          <Link href="/privacy" className="text-[var(--pink-dark)] underline">
            /privacy
          </Link>
          <Link href="/admin/registrations" className="text-[var(--pink-dark)] underline">
            /admin/registrations
          </Link>
        </div>
      </article>
    </div>
  );
}
