interface LocationProps {
  t: {
    location: { badge: string; headline: string; address: string; hours: string };
  };
}

export default function LocationSection({ t }: LocationProps) {
  return (
    <section id="contact" className="py-20 sm:py-28" style={{ background: "var(--pink-light)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="section-badge justify-center">{t.location.badge}</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
            {t.location.headline}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--border)] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--pink-light)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--pink-dark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-[var(--foreground)] mb-1">
                    Make Art Studio
                  </div>
                  <div className="text-sm text-[var(--muted)]">{t.location.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--blue-light)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--blue-dark)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-[var(--muted)]">{t.location.hours}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--pink-light)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--pink-dark)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <div>
                  <a
                    href="https://instagram.com/make_art.tr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--pink-dark)] hover:underline font-medium"
                  >
                    @make_art.tr
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Map placeholder */}
          <div
            className="rounded-3xl overflow-hidden border border-[var(--border)] min-h-48 flex items-center justify-center bg-white shadow-sm"
          >
            {/* TODO: Replace with real Google Maps embed or Leaflet.js after address confirmed */}
            <div className="text-center p-8">
              <div className="text-5xl mb-3">🗺️</div>
              <p className="text-sm text-[var(--muted)]">Alanya, Antalya</p>
              <a
                href="https://maps.google.com/?q=Alanya+Antalya+Turkey"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs text-[var(--pink-dark)] hover:underline"
              >
                Google Maps →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
