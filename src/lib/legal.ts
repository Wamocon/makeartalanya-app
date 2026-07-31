export const PRIVACY_NOTICE_VERSION = "2026-07-v2";
export const TERMS_VERSION = "2026-07-v1";
export const COOKIE_NOTICE_VERSION = "2026-07-v1";
export const AI_NOTICE_VERSION = "2026-07-v1";

export const COMPANY = {
  legalName: "Make Art Resim Atölyesi Turizm ve Ticaret Limited Şirketi",
  registeredSeat: [
    "Mahmutlar Mah., 226 Nolu Sk.",
    "Yazar Group Apt., Yazar Apt 2 No: 4/C",
    "07070 Alanya / Antalya",
  ],
  atelier: ["Mahmutlar Mah., Sahil Caddesi 165E", "07070 Alanya / Antalya"],
  taxOffice: "Alanya",
  taxNumber: "6111825733",
  mersisNo: process.env.NEXT_PUBLIC_COMPANY_MERSIS_NO?.trim() || null,
  tradeRegistryNo: process.env.NEXT_PUBLIC_COMPANY_TRADE_REGISTRY_NO?.trim() || null,
  managingDirector: process.env.NEXT_PUBLIC_COMPANY_DIRECTOR?.trim() || null,
  phone: "+90 551 674 55 15",
  phoneHref: "+905516745515",
  email: "makeartstudio.tr@gmail.com",
  instagram: "make_art.tr",
  website: "https://makeartalanya.com",
  lastUpdated: "31.07.2026",
} as const;
