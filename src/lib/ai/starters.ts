import type { Locale } from "@/i18n/translations";

// Client-safe suggested opening questions (verified TR/EN/RU).
export const STARTERS: Record<Locale, string[]> = {
  tr: [
    "Hangi dersler var? Resim ve satranç nasıl işliyor?",
    "Çocuğum için ücretsiz deneme dersi alabilir miyim?",
    "Ders paketleri ve fiyatları neler?",
    "Neredesiniz ve ders saatleriniz nedir?",
  ],
  en: [
    "What classes do you offer? How do painting and chess work?",
    "Can my child try a free trial lesson?",
    "What are your lesson packages and prices?",
    "Where are you located and what are your hours?",
  ],
  ru: [
    "Какие есть занятия? Как проходят рисование и шахматы?",
    "Можно записать ребёнка на бесплатное пробное занятие?",
    "Какие есть пакеты занятий и цены?",
    "Где вы находитесь и какие часы работы?",
  ],
};
