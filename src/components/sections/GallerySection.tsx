import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const PLACEHOLDER_ITEMS = [
  { id: 1, label: "Akrilik · Acrylic · Акрил" },
  { id: 2, label: "Yağlı boya · Oil · Масло" },
  { id: 3, label: "Suluboya · Watercolor · Акварель" },
  { id: 4, label: "Karakalem · Pencil · Карандаш" },
  { id: 5, label: "Pastel · Pastel · Пастель" },
  { id: 6, label: "Karışık teknik · Mixed · Смешанная" },
];

async function getGalleryImages(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase.storage.from("gallery").list("", {
      limit: 24,
      sortBy: { column: "created_at", order: "desc" },
    });
    if (!data || data.length === 0) return [];
    return data
      .filter((f) => f.name !== ".emptyFolderPlaceholder")
      .map((f) => supabase.storage.from("gallery").getPublicUrl(f.name).data.publicUrl);
  } catch {
    return [];
  }
}

interface GalleryProps {
  t: {
    gallery: { badge: string; headline: string };
  };
}

export default async function GallerySection({ t }: GalleryProps) {
  const images = await getGalleryImages();
  const hasRealImages = images.length > 0;

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="section-badge justify-center">{t.gallery.badge}</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
            {t.gallery.headline.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "block text-[var(--pink-dark)]" : "block"}>
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {hasRealImages
            ? images.map((url, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl overflow-hidden relative group"
                >
                  <Image
                    src={url}
                    alt={`Gallery image ${i + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))
            : PLACEHOLDER_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer"
                  style={{
                    background: `linear-gradient(${120 + item.id * 40}deg, var(--pink-light), var(--blue-light))`,
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="text-4xl mb-2">🎨</div>
                    <div className="text-xs text-[var(--muted)] font-medium">{item.label}</div>
                  </div>
                </div>
              ))}
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-8">
          <a
            href="https://instagram.com/make_art.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-[var(--pink-dark)] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            @make_art.tr
          </a>
        </p>
      </div>
    </section>
  );
}
