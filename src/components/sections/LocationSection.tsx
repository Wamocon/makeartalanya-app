interface LocationProps {
  t: {
    location: { badge: string; headline: string; address: string; phone: string; hours: string };
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <a href="tel:+905516745515" className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--pink-dark)] transition-colors">
                    {t.location.phone}
                  </a>
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
            </div>
          </div>

          {/* Google Maps embed */}
          <div className="rounded-3xl overflow-hidden border border-[var(--border)] shadow-sm min-h-64">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3189.123456789!2d32.0833!3d36.5441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14dbb4c1b7a8e1e1%3A0x1!2sMake+Art+Studio%2C+Sahil+Caddesi+165E%2C+Mahmutlar%2C+Alanya!5e0!3m2!1str!2str!4v1715000000000!5m2!1str!2str"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "280px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Make Art Studio Location"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
