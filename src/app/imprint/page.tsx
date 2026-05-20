import Link from "next/link";

export const metadata = {
  title: "Imprint | Make Art Studio Alanya",
};

export default function ImprintPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--pink-dark)] hover:underline mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to homepage
        </Link>

        <div className="bg-white border border-[var(--border)] rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Imprint</h1>
          <p className="text-sm text-[var(--muted)] mb-6">Last updated: 12 May 2026</p>

          <section className="space-y-4 text-sm leading-relaxed text-[var(--muted)]">
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">Service Provider</h2>
              <p>Make Art Studio</p>
              <p>Mahmutlar Mahallesi, Sahil Caddesi 165E</p>
              <p>Alanya, Antalya, Turkey</p>
            </div>

            <div>
              <h2 className="font-semibold text-[var(--foreground)]">Contact</h2>
              <p>Phone: <a href="tel:+905516745515" className="text-[var(--pink-dark)] hover:underline">+90 551 674 55 15</a></p>
              <p>Email: info@makeartalanya.com</p>
              <p>Instagram: <a href="https://instagram.com/make_art.tr" target="_blank" rel="noopener noreferrer" className="text-[var(--pink-dark)] hover:underline">@make_art.tr</a></p>
            </div>

            <div>
              <h2 className="font-semibold text-[var(--foreground)]">Responsible Person</h2>
              <p>To be completed by the studio owner</p>
            </div>

            <p className="font-semibold text-[var(--foreground)]">
              Note: This imprint template must be legally reviewed and completed with official company details.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
