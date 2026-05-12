import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make Art Studio Alanya | Sanat Kursları · Art Courses · Курсы рисования",
  description:
    "Profesyonel resim ve çizim dersleri Alanya'da. Professional painting & drawing courses in Alanya, Turkey. Профессиональные курсы рисования в Алании.",
  keywords: [
    "art studio alanya",
    "sanat kursu alanya",
    "рисование аланья",
    "painting courses turkey",
    "make art studio",
  ],
  openGraph: {
    title: "Make Art Studio Alanya",
    description: "Tüm yaşlar için sanat kursları · Art courses for all ages · Курсы для всех возрастов",
    url: "https://makeartalanya.com",
    siteName: "Make Art Studio",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
