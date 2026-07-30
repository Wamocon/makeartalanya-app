import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ConciergeMount } from "@/components/ai/ConciergeMount";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Make Art Studio Alanya | Sanat Kursları · Art Courses · Курсы рисования",
  description:
    "Profesyonel resim ve çizim dersleri Alanya'da. Professional painting & drawing courses in Alanya, Turkey. Профессиональные курсы рисования в Алании.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
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
    <html lang="tr" className={`h-full ${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://vnldsyjkhofofellwuiq.supabase.co" />
        <link rel="dns-prefetch" href="https://vnldsyjkhofofellwuiq.supabase.co" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ToastProvider>{children}</ToastProvider>
        <ConciergeMount />
      </body>
    </html>
  );
}
