/**
 * JSON-LD structured data for SEO.
 * Helps Google show rich results (business info, courses, location).
 */

export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://makeartalanya.com",
    name: "Make Art Studio Alanya",
    description: "Professional painting & drawing courses in Alanya, Turkey. Art classes for all ages in Turkish, English, and Russian.",
    url: "https://makeartalanya.com",
    logo: "https://makeartalanya.com/logo.jpg",
    image: "https://makeartalanya.com/logo.jpg",
    telephone: "+90",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Alanya",
      addressRegion: "Antalya",
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 36.5437,
      longitude: 31.9994,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$",
    sameAs: [],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Art Courses",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Course",
            name: "Drawing & Painting Classes",
            description: "Professional art instruction for all skill levels",
            provider: { "@type": "Organization", name: "Make Art Studio Alanya" },
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
