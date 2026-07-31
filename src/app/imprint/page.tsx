import Link from "next/link";
import { getLocale } from "@/i18n/server";
import { COMPANY } from "@/lib/legal";

export const metadata = {
  title: "Künye · Imprint | Make Art Studio Alanya",
};

const COPY = {
  tr: {
    back: "Ana sayfaya dön",
    title: "Künye",
    updated: "Son güncelleme",
    company: "Şirket",
    legalName: "Ticaret ünvanı",
    seat: "Kayıtlı merkez",
    atelier: "Atölye adresi",
    tax: "Vergi",
    taxOffice: "Vergi dairesi",
    taxNumber: "Vergi kimlik numarası",
    mersis: "MERSİS numarası",
    registry: "Ticaret sicil numarası",
    director: "Şirket müdürü",
    contact: "İletişim",
    phone: "Telefon",
    email: "E-posta",
    note: "Atölyemizi ziyaret etmek isterseniz lütfen Sahil Caddesi'ndeki adresi kullanın. Kayıtlı merkez adresi yalnızca resmî yazışmalar içindir.",
  },
  en: {
    back: "Back to homepage",
    title: "Imprint",
    updated: "Last updated",
    company: "Company",
    legalName: "Registered name",
    seat: "Registered seat",
    atelier: "Atelier address",
    tax: "Tax",
    taxOffice: "Tax office",
    taxNumber: "Tax identification number",
    mersis: "MERSİS number",
    registry: "Trade registry number",
    director: "Managing director",
    contact: "Contact",
    phone: "Phone",
    email: "Email",
    note: "If you are visiting the atelier, use the Sahil Caddesi address. The registered seat is for official correspondence only.",
  },
  ru: {
    back: "Вернуться на главную",
    title: "Выходные данные",
    updated: "Последнее обновление",
    company: "Компания",
    legalName: "Юридическое наименование",
    seat: "Юридический адрес",
    atelier: "Адрес студии",
    tax: "Налоговые данные",
    taxOffice: "Налоговая инспекция",
    taxNumber: "Идентификационный номер налогоплательщика",
    mersis: "Номер MERSİS",
    registry: "Номер в торговом реестре",
    director: "Директор",
    contact: "Контакты",
    phone: "Телефон",
    email: "Электронная почта",
    note: "Если вы едете в студию, используйте адрес на Sahil Caddesi. Юридический адрес предназначен только для официальной переписки.",
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[13rem_1fr] sm:gap-4">
      <dt className="font-medium text-[var(--foreground)]">{label}</dt>
      <dd className="text-[var(--muted)]">{children}</dd>
    </div>
  );
}

export default async function ImprintPage() {
  const locale = await getLocale();
  const t = COPY[locale] ?? COPY.en;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--pink-dark)] hover:underline mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t.back}
        </Link>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-sm text-[var(--muted)] mb-8">
            {t.updated}: {COMPANY.lastUpdated}
          </p>

          <div className="space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="font-semibold mb-3 text-[var(--foreground)]">{t.company}</h2>
              <dl className="space-y-3">
                <Row label={t.legalName}>{COMPANY.legalName}</Row>
                <Row label={t.atelier}>
                  {COMPANY.atelier.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </Row>
                <Row label={t.seat}>
                  {COMPANY.registeredSeat.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </Row>
                {COMPANY.managingDirector && (
                  <Row label={t.director}>{COMPANY.managingDirector}</Row>
                )}
              </dl>
              <p className="mt-3 text-[var(--muted)]">{t.note}</p>
            </section>

            <section>
              <h2 className="font-semibold mb-3 text-[var(--foreground)]">{t.tax}</h2>
              <dl className="space-y-3">
                <Row label={t.taxOffice}>{COMPANY.taxOffice}</Row>
                <Row label={t.taxNumber}>{COMPANY.taxNumber}</Row>
                {COMPANY.mersisNo && <Row label={t.mersis}>{COMPANY.mersisNo}</Row>}
                {COMPANY.tradeRegistryNo && (
                  <Row label={t.registry}>{COMPANY.tradeRegistryNo}</Row>
                )}
              </dl>
            </section>

            <section>
              <h2 className="font-semibold mb-3 text-[var(--foreground)]">{t.contact}</h2>
              <dl className="space-y-3">
                <Row label={t.phone}>
                  <a
                    href={`tel:${COMPANY.phoneHref}`}
                    className="text-[var(--pink-dark)] hover:underline"
                  >
                    {COMPANY.phone}
                  </a>
                </Row>
                <Row label={t.email}>
                  <a
                    href={`mailto:${COMPANY.email}`}
                    className="text-[var(--pink-dark)] hover:underline"
                  >
                    {COMPANY.email}
                  </a>
                </Row>
                <Row label="Instagram">
                  <a
                    href={`https://instagram.com/${COMPANY.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--pink-dark)] hover:underline"
                  >
                    @{COMPANY.instagram}
                  </a>
                </Row>
              </dl>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
