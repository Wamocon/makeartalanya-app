"use client";

/**
 * KVKK registration form ("Anmeldeformular"). A parent/guardian registers a
 * child for painting, crafts or chess and gives explicit, versioned consent.
 *
 * ⚠️ The consent wording below is a sensible default; have a Turkish lawyer
 * confirm the exact KVKK aydınlatma / muvafakat text before launch.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Send } from "lucide-react";
import { packages, type Locale } from "@/i18n/translations";
import { OrbitMark } from "@/components/sections/OrbitMark";
import { PaintedBackdrop } from "@/components/sections/PaintedBackdrop";

type Relationship = "mother" | "father" | "guardian";
type Gender = "male" | "female" | "other";
type Branch = "painting" | "chess" | "crafts" | "individual";

const LOCALES: Locale[] = ["tr", "en", "ru"];

// Count-correct word for "lesson(s)" per locale (TR has no numeral inflection;
// EN is singular/plural; RU needs one/few/many forms).
const LESSON_FORMS: Record<Locale, (n: number) => string> = {
  tr: () => "ders",
  en: (n) => (n === 1 ? "lesson" : "lessons"),
  ru: (n) => {
    const r = new Intl.PluralRules("ru").select(n);
    return r === "one" ? "занятие" : r === "few" ? "занятия" : "занятий";
  },
};

function readLocale(): Locale {
  if (typeof document === "undefined") return "tr";
  const cookie = document.cookie.match(/(?:^|; )lang=([^;]*)/)?.[1];
  if (cookie && LOCALES.includes(cookie as Locale)) return cookie as Locale;
  const stored = localStorage.getItem("locale");
  if (stored && LOCALES.includes(stored as Locale)) return stored as Locale;
  return "tr";
}

const COPY: Record<Locale, {
  title: string; subtitle: string; back: string; optional: string;
  language: string;
  sections: { parent: string; child: string; enrollment: string; consent: string };
  f: Record<string, string>;
  hints: Record<"parentPhone" | "authorizedPickup" | "childHealthNotes", string>;
  rel: Record<Relationship, string>;
  gender: Record<Gender, string>;
  branch: Record<Branch, string>;
  selectPlaceholder: string;
  lessons: string; perLesson: string;
  consent: {
    notice: string;
    noticeLink: string;
    terms: string;
    termsLink: string;
    rulesLink: string;
    health: string;
    mediaIntro: string;
    mediaWebsite: string;
    mediaSocial: string;
    mediaRights: string;
  };
  submit: string; submitting: string;
  successTitle: string; successMsg: string;
  telegramCta: string; telegramHint: string;
  errGeneric: string; errNetwork: string;
}> = {
  tr: {
    title: "Kayıt Formu",
    subtitle: "Çocuğunuzu resim, el sanatları veya satranç dersine kaydedin. Bilgileriniz yalnızca kayıt ve iletişim için kullanılır.",
    back: "Ana sayfaya dön",
    optional: "isteğe bağlı",
    language: "Dil",
    sections: { parent: "Veli Bilgileri", child: "Çocuk Bilgileri", enrollment: "Ders Seçimi", consent: "Onaylar" },
    f: {
      parentName: "Ad Soyad", parentIdNo: "T.C. Kimlik / Pasaport No", relationship: "Yakınlık",
      parentEmail: "E-posta", parentPhone: "WhatsApp Telefon", parentAddress: "Adres",
      childName: "Çocuğun Adı Soyadı", childBirthDate: "Doğum Tarihi", childGender: "Cinsiyet",
      childHealthNotes: "Sağlık / alerji notları", emergencyContact: "Acil durum kişisi (ad, telefon)",
      authorizedPickup: "Çocuğu kimler alabilir (ad, yakınlık, telefon)",
      branch: "Branş", package: "Paket", message: "Mesajınız",
    },
    hints: {
      parentPhone: "Stüdyo sizinle bu numaradan WhatsApp üzerinden iletişime geçer.",
      authorizedPickup: "Çocuk yalnızca burada belirttiğiniz kişilere teslim edilir.",
      childHealthNotes: "Boş bırakabilirsiniz; kaydınızı veya ücreti etkilemez.",
    },
    rel: { mother: "Anne", father: "Baba", guardian: "Veli / Vasi" },
    gender: { male: "Erkek", female: "Kız", other: "Diğer" },
    branch: { painting: "Resim & Çizim", chess: "Satranç", crafts: "El Sanatları", individual: "Birebir Ders" },
    selectPlaceholder: "Seçiniz…",
    lessons: "ders", perLesson: "ders başına",
    consent: {
      notice: "KVKK Aydınlatma Metni'ni okudum ve kayıt talebim için hangi verilerin, hangi amaç ve hukuki sebeple işleneceği konusunda bilgilendirildim.",
      noticeLink: "Aydınlatma Metni",
      terms: "Bu formun ödeme yükümlülüğü doğurmayan bir kayıt talebi olduğunu ve hizmet koşulları ile ön bilgilendirmeyi okuduğumu kabul ediyorum.",
      termsLink: "Ön Bilgilendirme ve Hizmet Koşulları",
      rulesLink: "Katılım Sözleşmesi ve Stüdyo Kuralları",
      health: "Yazdığım sağlık/alerji notlarının çocuğumun ders güvenliği amacıyla işlenmesine açık rıza veriyorum. Bu alanı boş bırakabileceğimi biliyorum.",
      mediaIntro: "İsteğe bağlı medya izinleri — her seçim birbirinden ve kayıttan bağımsızdır:",
      mediaWebsite: "Veli/vasi sıfatıyla; benim ve/veya çocuğumun yazılı görüşlerinin, fotoğraflarının, ses ve video kayıtlarının stüdyo faaliyetlerini tanıtmak amacıyla çekilmesine/kaydedilmesine, düzenlenmesine, saklanmasına ve makeartalanya.com sitesinde yayımlanmasına açık rıza veriyorum.",
      mediaSocial: "Veli/vasi sıfatıyla; benim ve/veya çocuğumun yazılı görüşlerinin, fotoğraflarının, ses ve video kayıtlarının stüdyo faaliyetlerini tanıtmak amacıyla çekilmesine/kaydedilmesine, düzenlenmesine, saklanmasına ve stüdyonun resmi sosyal medya hesaplarında yayımlanmasına açık rıza veriyorum.",
      mediaRights: "Bu izinler tamamen gönüllüdür. Rıza vermemek kayıt veya hizmeti etkilemez. Rızamı makeartstudio.tr@gmail.com adresinden geleceğe etkili olarak istediğim zaman geri çekebilirim.",
    },
    submit: "Kaydı Gönder",
    submitting: "Gönderiliyor…",
    telegramCta: "Telegram'da bildirim al",
    telegramHint: "Dokunun; kaydınızla ilgili güncellemeleri Telegram'dan gönderelim.",
    successTitle: "Teşekkürler!",
    successMsg: "Kaydınızı aldık. Stüdyo, gün, saat ve paket detayları için en kısa sürede WhatsApp'tan sizinle iletişime geçecek.",
    errGeneric: "Kayıt gönderilemedi. Lütfen alanları kontrol edip tekrar deneyin.",
    errNetwork: "Bağlantı hatası. Lütfen tekrar deneyin.",
  },
  en: {
    title: "Registration Form",
    subtitle: "Register your child for painting, crafts or chess. Your details are used only for registration and contact.",
    back: "Back to home",
    optional: "optional",
    language: "Language",
    sections: { parent: "Parent / Guardian", child: "Child's Details", enrollment: "Class Choice", consent: "Consents" },
    f: {
      parentName: "Full name", parentIdNo: "ID / Passport no.", relationship: "Relationship",
      parentEmail: "Email", parentPhone: "WhatsApp phone", parentAddress: "Address",
      childName: "Child's full name", childBirthDate: "Date of birth", childGender: "Gender",
      childHealthNotes: "Health / allergy notes", emergencyContact: "Emergency contact (name, phone)",
      authorizedPickup: "Who may collect the child (name, relationship, phone)",
      branch: "Class", package: "Package", message: "Your message",
    },
    hints: {
      parentPhone: "The studio contacts you on this number via WhatsApp.",
      authorizedPickup: "Your child is released only to the people you name here.",
      childHealthNotes: "You may leave this blank; it does not affect your registration or the price.",
    },
    rel: { mother: "Mother", father: "Father", guardian: "Guardian" },
    gender: { male: "Boy", female: "Girl", other: "Other" },
    branch: { painting: "Painting & Drawing", chess: "Chess", crafts: "Applied Art & Crafts", individual: "Individual lesson" },
    selectPlaceholder: "Select…",
    lessons: "lessons", perLesson: "per lesson",
    consent: {
      notice: "I have read the KVKK Privacy Notice and have been informed which data is processed for my registration request, for what purposes and on which legal grounds.",
      noticeLink: "Privacy notice",
      terms: "I understand this is a non-binding registration request with no payment obligation, and I have read the pre-contract information and service terms.",
      termsLink: "Pre-contract information and service terms",
      rulesLink: "Participation agreement and studio rules",
      health: "I explicitly consent to the processing of the health/allergy notes I entered solely for my child's safety during class. I understand that I may leave this field blank.",
      mediaIntro: "Optional media permissions — each choice is independent from the other and from registration:",
      mediaWebsite: "As parent/guardian, I explicitly consent to written testimonials, photographs, audio and video recordings of me and/or my child being captured/recorded, edited, stored and published on makeartalanya.com to present the studio's activities.",
      mediaSocial: "As parent/guardian, I explicitly consent to written testimonials, photographs, audio and video recordings of me and/or my child being captured/recorded, edited, stored and published on the studio's official social-media accounts to present the studio's activities.",
      mediaRights: "These permissions are entirely voluntary. Refusal does not affect registration or service. I may withdraw consent for future use at any time by emailing makeartstudio.tr@gmail.com.",
    },
    submit: "Submit registration",
    submitting: "Submitting…",
    telegramCta: "Get updates on Telegram",
    telegramHint: "Tap to let us send you updates about this registration on Telegram.",
    successTitle: "Thank you!",
    successMsg: "We've received your registration. The studio will contact you shortly on WhatsApp to confirm days, times and package details.",
    errGeneric: "Registration failed. Please check the fields and try again.",
    errNetwork: "Network error. Please try again.",
  },
  ru: {
    title: "Форма записи",
    subtitle: "Запишите ребёнка на рисование, рукоделие или шахматы. Данные используются только для записи и связи.",
    back: "На главную",
    optional: "необязательно",
    language: "Язык",
    sections: { parent: "Родитель / опекун", child: "Данные ребёнка", enrollment: "Выбор занятия", consent: "Согласия" },
    f: {
      parentName: "Имя и фамилия", parentIdNo: "Удостоверение / паспорт", relationship: "Кем приходится",
      parentEmail: "Email", parentPhone: "Телефон WhatsApp", parentAddress: "Адрес",
      childName: "Имя и фамилия ребёнка", childBirthDate: "Дата рождения", childGender: "Пол",
      childHealthNotes: "Здоровье / аллергии", emergencyContact: "Контакт на случай экстренной ситуации (имя, телефон)",
      authorizedPickup: "Кто может забирать ребёнка (имя, кем приходится, телефон)",
      branch: "Занятие", package: "Пакет", message: "Ваше сообщение",
    },
    hints: {
      parentPhone: "Студия свяжется с вами по этому номеру в WhatsApp.",
      authorizedPickup: "Ребёнок передаётся только тем, кого вы укажете здесь.",
      childHealthNotes: "Поле можно оставить пустым — это не влияет на запись и стоимость.",
    },
    rel: { mother: "Мама", father: "Папа", guardian: "Опекун" },
    gender: { male: "Мальчик", female: "Девочка", other: "Другое" },
    branch: { painting: "Живопись и рисунок", chess: "Шахматы", crafts: "Прикладное творчество", individual: "Индивидуальное занятие" },
    selectPlaceholder: "Выберите…",
    lessons: "занятий", perLesson: "за занятие",
    consent: {
      notice: "Я прочитал(а) уведомление KVKK и проинформирован(а), какие данные, для каких целей и на каком основании обрабатываются по моей заявке.",
      noticeLink: "Уведомление о конфиденциальности",
      terms: "Я понимаю, что это необязывающая заявка без обязанности платить, и прочитал(а) преддоговорную информацию и условия услуг.",
      termsLink: "Преддоговорная информация и условия",
      rulesLink: "Договор об участии и правила студии",
      health: "Я явно соглашаюсь на обработку введённых сведений о здоровье/аллергии только для безопасности ребёнка на занятии. Поле можно оставить пустым.",
      mediaIntro: "Необязательные разрешения на материалы — каждый выбор независим от другого и от записи:",
      mediaWebsite: "Как родитель/опекун я явно соглашаюсь, чтобы письменные отзывы, фотографии, аудио- и видеозаписи со мной и/или моим ребёнком создавались, редактировались, хранились и публиковались на makeartalanya.com для представления деятельности студии.",
      mediaSocial: "Как родитель/опекун я явно соглашаюсь, чтобы письменные отзывы, фотографии, аудио- и видеозаписи со мной и/или моим ребёнком создавались, редактировались, хранились и публиковались в официальных аккаунтах студии в социальных сетях для представления деятельности студии.",
      mediaRights: "Эти разрешения полностью добровольны. Отказ не влияет на запись или услуги. Согласие на дальнейшее использование можно отозвать в любое время по адресу makeartstudio.tr@gmail.com.",
    },
    submit: "Отправить заявку",
    submitting: "Отправка…",
    telegramCta: "Получать обновления в Telegram",
    telegramHint: "Нажмите, чтобы мы присылали обновления по этой заявке в Telegram.",
    successTitle: "Спасибо!",
    successMsg: "Мы получили вашу заявку. Студия свяжется с вами в WhatsApp, чтобы подтвердить дни, время и детали пакета.",
    errGeneric: "Не удалось отправить. Проверьте поля и попробуйте снова.",
    errNetwork: "Ошибка сети. Попробуйте ещё раз.",
  },
};

const emptyForm = {
  parentName: "", parentIdNo: "", parentRelationship: "" as Relationship | "",
  parentEmail: "", parentPhone: "", parentAddress: "",
  childName: "", childBirthDate: "", childGender: "" as Gender | "",
  childHealthNotes: "", emergencyContact: "", authorizedPickup: "",
  branch: "" as Branch | "", packageId: "", message: "",
  privacyNoticeAccepted: false, termsAccepted: false, consentHealth: false,
  consentMediaWebsite: false, consentMediaSocial: false,
};

export function RegistrationForm() {
  const [locale, setLocale] = useState<Locale>("tr");
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [telegramLink, setTelegramLink] = useState<string | null>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => setLocale(readLocale()), []);
  useEffect(() => {
    if (done) successHeadingRef.current?.focus();
  }, [done]);

  const t = COPY[locale];

  function switchLocale(l: Locale) {
    setLocale(l);
    localStorage.setItem("locale", l);
    document.cookie = `lang=${l};path=/;max-age=31536000;SameSite=Lax`;
    window.dispatchEvent(new CustomEvent("localechange", { detail: l }));
  }

  // Mirrors registrationSchema so the button disables instead of the server
  // rejecting a filled-in form. The required set is the paper questionnaire's.
  const canSubmit =
    !loading &&
    form.parentName.trim().length >= 2 &&
    form.parentPhone.trim().length >= 7 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail.trim()) &&
    form.childName.trim().length >= 2 &&
    /^\d{4}-\d{2}-\d{2}$/.test(form.childBirthDate) &&
    form.emergencyContact.trim().length >= 3 &&
    form.authorizedPickup.trim().length >= 2 &&
    !!form.branch &&
    form.privacyNoticeAccepted &&
    form.termsAccepted &&
    (!form.childHealthNotes.trim() || form.consentHealth);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, preferredLanguage: locale }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        telegramLink?: string | null;
      };
      if (!res.ok || !data.ok) {
        setError(data.error || t.errGeneric);
        setLoading(false);
        return;
      }
      setTelegramLink(data.telegramLink ?? null);
      setDone(true);
      setForm({ ...emptyForm });
    } catch {
      setError(t.errNetwork);
      setLoading(false);
    }
  }

  return (
    <main className="public-v2 relative min-h-screen overflow-hidden bg-[#fff8f5]">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="painted-section painted-section--lilac h-full">
          <PaintedBackdrop tone="lilac" flow="right" composition="palette" />
        </div>
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* header */}
        <div className="mb-10 flex items-center justify-between rounded-full border border-white/70 bg-white/75 px-4 py-3 shadow-[0_18px_60px_rgba(52,25,88,0.12)] backdrop-blur-xl sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t.back}
          </Link>
          <div className="flex gap-1 glass rounded-full p-1" role="group" aria-label={t.language}>
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => switchLocale(l)}
                aria-pressed={l === locale}
                className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                  l === locale
                    ? "bg-[linear-gradient(135deg,#ff3d76,#7559d9)] text-white shadow-md"
                    : "text-[var(--muted)] hover:bg-white hover:text-[var(--foreground)]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {done ? (
          <div className="mx-auto max-w-2xl rounded-[2.25rem] border border-white/80 bg-white/85 p-8 text-center shadow-[0_30px_100px_rgba(52,25,88,0.18)] backdrop-blur-xl sm:p-12">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#dffbea,#c8f1ff)] shadow-inner">
              <Check className="w-8 h-8 text-emerald-500" aria-hidden="true" />
            </div>
            <h1
              ref={successHeadingRef}
              tabIndex={-1}
              className="text-2xl font-bold text-[var(--foreground)] mb-2 focus:outline-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.successTitle}
            </h1>
            <p className="text-[var(--muted)] leading-relaxed">{t.successMsg}</p>

            {/* A Telegram bot may not message anyone first. Tapping this sends
                "/start <token>" from the parent, which is what lets the studio
                reply — so this button is the opt-in, not a decoration. */}
            {telegramLink && (
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#229ED9] px-7 py-3.5 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {t.telegramCta}
              </a>
            )}
            {telegramLink && (
              <p className="mt-3 text-sm text-[var(--muted)]">{t.telegramHint}</p>
            )}

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#ff3d76,#7559d9)] px-7 py-3.5 font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {t.back}
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-14">
            <aside className="lg:sticky lg:top-10 lg:pt-6">
              <OrbitMark className="mb-6 text-[#f23f73]" />
              <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-[#ce2b62]">Make Art · Studio Alanya</p>
              <h1 className="max-w-xl text-5xl font-bold leading-[0.92] tracking-[-0.045em] text-[var(--foreground)] sm:text-6xl lg:text-7xl" style={{ fontFamily: "var(--font-display)" }}>
                {t.title}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[var(--foreground)]/70 sm:text-lg">{t.subtitle}</p>

              <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">
                {[t.sections.parent, t.sections.child, t.sections.enrollment, t.sections.consent].map((label, index) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/70 bg-white/60 p-4 shadow-[0_14px_40px_rgba(61,31,95,0.08)] backdrop-blur-md"
                  >
                    <span className="mb-2 block text-xs font-black tracking-[0.22em] text-[#c72f68]">0{index + 1}</span>
                    <span className="text-sm font-bold text-[var(--foreground)]">{label}</span>
                  </div>
                ))}
              </div>
            </aside>

            <form onSubmit={handleSubmit} className="space-y-6" aria-busy={loading}>
              {/* Parent */}
              <Section title={t.sections.parent} index="01" tone="aqua">
                <Field label={t.f.parentName} required>
                  <input required value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} className={inputCls} placeholder="Ayşe Yılmaz" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={t.f.relationship} hint={t.optional}>
                    <select value={form.parentRelationship} onChange={(e) => setForm({ ...form, parentRelationship: e.target.value as Relationship })} className={inputCls}>
                      <option value="">{t.selectPlaceholder}</option>
                      {(Object.keys(t.rel) as Relationship[]).map((k) => (
                        <option key={k} value={k}>{t.rel[k]}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t.f.parentIdNo} hint={t.optional}>
                    <input value={form.parentIdNo} onChange={(e) => setForm({ ...form, parentIdNo: e.target.value })} className={inputCls} />
                  </Field>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={t.f.parentPhone} required note={t.hints.parentPhone}>
                    <input required type="tel" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} className={inputCls} placeholder="+90 5xx xxx xx xx" />
                  </Field>
                  <Field label={t.f.parentEmail} required>
                    <input required type="email" value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} className={inputCls} />
                  </Field>
                </div>
                <Field label={t.f.parentAddress} hint={t.optional}>
                  <input value={form.parentAddress} onChange={(e) => setForm({ ...form, parentAddress: e.target.value })} className={inputCls} />
                </Field>
              </Section>

              {/* Child */}
              <Section title={t.sections.child} index="02" tone="rose">
                <Field label={t.f.childName} required>
                  <input required value={form.childName} onChange={(e) => setForm({ ...form, childName: e.target.value })} className={inputCls} />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={t.f.childBirthDate} required>
                    <input required type="date" value={form.childBirthDate} onChange={(e) => setForm({ ...form, childBirthDate: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label={t.f.childGender} hint={t.optional}>
                    <select value={form.childGender} onChange={(e) => setForm({ ...form, childGender: e.target.value as Gender })} className={inputCls}>
                      <option value="">{t.selectPlaceholder}</option>
                      {(Object.keys(t.gender) as Gender[]).map((k) => (
                        <option key={k} value={k}>{t.gender[k]}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label={t.f.emergencyContact} required>
                  <input required value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className={inputCls} />
                </Field>
                <Field label={t.f.authorizedPickup} required note={t.hints.authorizedPickup}>
                  <textarea required rows={2} value={form.authorizedPickup} onChange={(e) => setForm({ ...form, authorizedPickup: e.target.value })} className={`${inputCls} resize-none`} />
                </Field>
                <Field label={t.f.childHealthNotes} hint={t.optional} note={t.hints.childHealthNotes}>
                  <textarea rows={2} value={form.childHealthNotes} onChange={(e) => setForm({ ...form, childHealthNotes: e.target.value })} className={`${inputCls} resize-none`} />
                </Field>
              </Section>

              {/* Enrollment */}
              <Section title={t.sections.enrollment} index="03" tone="amber">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={t.f.branch} required>
                    <select required value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value as Branch })} className={inputCls}>
                      <option value="">{t.selectPlaceholder}</option>
                      {(Object.keys(t.branch) as Branch[]).map((k) => (
                        <option key={k} value={k}>{t.branch[k]}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t.f.package} hint={t.optional}>
                    <select value={form.packageId} onChange={(e) => setForm({ ...form, packageId: e.target.value })} className={inputCls}>
                      <option value="">{t.selectPlaceholder}</option>
                      {packages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.lessons} {LESSON_FORMS[locale](p.lessons)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label={t.f.message} hint={t.optional}>
                  <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputCls} resize-none`} />
                </Field>
              </Section>

              {/* Consents */}
              <Section title={t.sections.consent} index="04" tone="lilac">
                <Consent checked={form.privacyNoticeAccepted} onChange={(v) => setForm({ ...form, privacyNoticeAccepted: v })} required>
                  {t.consent.notice}{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--pink-dark)] underline hover:text-[var(--pink)]"
                  >
                    {t.consent.noticeLink}
                  </Link>
                </Consent>
                <Consent checked={form.termsAccepted} onChange={(v) => setForm({ ...form, termsAccepted: v })} required>
                  {t.consent.terms}{" "}
                  <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-[var(--pink-dark)] underline hover:text-[var(--pink)]">
                    {t.consent.termsLink}
                  </Link>
                  {" · "}
                  <Link href="/rules" target="_blank" rel="noopener noreferrer" className="text-[var(--pink-dark)] underline hover:text-[var(--pink)]">
                    {t.consent.rulesLink}
                  </Link>
                </Consent>
                {form.childHealthNotes.trim() && (
                  <Consent checked={form.consentHealth} onChange={(v) => setForm({ ...form, consentHealth: v })} required>
                    {t.consent.health}
                  </Consent>
                )}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--pink-light)]/25 p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{t.consent.mediaIntro}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{t.consent.mediaRights}</p>
                  </div>
                  <Consent checked={form.consentMediaWebsite} onChange={(v) => setForm({ ...form, consentMediaWebsite: v })}>
                    {t.consent.mediaWebsite}
                  </Consent>
                  <Consent checked={form.consentMediaSocial} onChange={(v) => setForm({ ...form, consentMediaSocial: v })}>
                    {t.consent.mediaSocial}
                  </Consent>
                  <Link href="/privacy#media-consent" target="_blank" rel="noopener noreferrer" className="inline-flex text-xs font-medium text-[var(--pink-dark)] underline hover:text-[var(--pink)]">
                    {t.consent.noticeLink}
                  </Link>
                </div>
              </Section>

              {error && (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50/90 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(115deg,#ff3f76_0%,#ff8a24_42%,#7258d7_100%)] py-4 text-base font-bold text-white shadow-[0_18px_45px_rgba(197,48,104,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(106,72,197,0.32)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {loading ? t.submitting : t.submit}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3.5 text-base text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-all placeholder:text-black/30 focus-visible:border-[#df4c7b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#f36b96]/15";

type SectionTone = "aqua" | "rose" | "amber" | "lilac";

const SECTION_STYLES: Record<SectionTone, string> = {
  aqua: "border-cyan-200/80 bg-[linear-gradient(145deg,rgba(231,252,255,0.94),rgba(255,255,255,0.82))]",
  rose: "border-rose-200/80 bg-[linear-gradient(145deg,rgba(255,235,242,0.95),rgba(255,255,255,0.84))]",
  amber: "border-amber-200/80 bg-[linear-gradient(145deg,rgba(255,246,215,0.96),rgba(255,255,255,0.84))]",
  lilac: "border-violet-200/80 bg-[linear-gradient(145deg,rgba(243,235,255,0.96),rgba(255,255,255,0.84))]",
};

function Section({ title, index, tone, children }: { title: string; index: string; tone: SectionTone; children: React.ReactNode }) {
  return (
    <section className={`relative space-y-4 overflow-hidden rounded-[2rem] border p-5 shadow-[0_24px_70px_rgba(61,31,95,0.11)] backdrop-blur-xl sm:p-7 ${SECTION_STYLES[tone]}`}>
      <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-[linear-gradient(90deg,#20b8cc,#ff477d,#ff9f24,#7559d9)]" aria-hidden="true" />
      <div className="mb-1 flex items-center justify-between gap-4">
        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--foreground)]">{title}</h2>
        <span className="text-xs font-black tracking-[0.2em] text-[#c72f68]">{index}</span>
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, hint, note, children }: { label: string; required?: boolean; hint?: string; note?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-[var(--foreground)]/65">
        {label} {required && <span className="text-[var(--pink-dark)]">*</span>}
        {hint && <span className="font-normal normal-case"> ({hint})</span>}
      </span>
      {children}
      {note && <span className="mt-1.5 block text-xs font-normal leading-relaxed text-[var(--foreground)]/50">{note}</span>}
    </label>
  );
}

function Consent({ checked, onChange, required, children }: { checked: boolean; onChange: (v: boolean) => void; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-white/80 bg-white/[0.58] p-4 transition-colors hover:bg-white/[0.82]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required={required}
        className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[#d43f72]"
      />
      <span className="text-sm leading-relaxed text-[var(--foreground)]/85">
        {children} {required && <span className="text-[var(--pink-dark)]">*</span>}
      </span>
    </label>
  );
}
