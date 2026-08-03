/**
 * The registration conversation, as a pure state machine.
 *
 * Deliberately free of database and network calls: given the answers so far and
 * one new input, it returns the next question. That makes the whole
 * conversation — every branch, every validation message, all three languages —
 * testable without a Telegram token or a Supabase connection. The runner
 * (flow-runner.ts) is the only part that touches the outside world.
 *
 * The question set mirrors the web form exactly. If the two disagree, a parent
 * registering by chat ends up with a thinner record than one using the website,
 * and the studio finds out at the door.
 */

export type Lang = "tr" | "en" | "ru";

export type Button =
  | { label: string; data: string }
  | { label: string; url: string };

export interface BotReply {
  text: string;
  buttons?: Button[][];
}

export type Answers = Record<string, string>;

/** Callback payloads must fit Telegram's 64-byte limit, so keys stay short. */
export const CB = {
  lang: (l: Lang) => `l:${l}`,
  menuRegister: "m:reg",
  answer: (step: string, value: string) => `a:${step}:${value}`,
  skip: (step: string) => `s:${step}`,
  submit: "x:go",
  cancel: "x:no",
} as const;

const T = <A, B, C>(tr: A, en: B, ru: C) => ({ tr, en, ru });

type Loc = Record<Lang, string>;

interface Choice {
  value: string;
  label: Loc;
}

type Validator = (raw: string) => { ok: true; value: string } | { ok: false; code: ErrCode };

type ErrCode = "short" | "email" | "phone" | "date" | "long";

interface Step {
  key: string;
  kind: "text" | "choice" | "consent";
  optional?: boolean;
  choices?: Choice[];
  ask: Loc;
  example?: Loc;
  validate?: Validator;
  /** Consent steps that may not be declined (the two acknowledgements). */
  mustAccept?: boolean;
  /** Only asked when this returns true. */
  when?: (a: Answers) => boolean;
}

// ── validators ────────────────────────────────────────────────────────────

const minLen = (n: number): Validator => (raw) => {
  const value = raw.trim();
  return value.length >= n ? { ok: true, value } : { ok: false, code: "short" };
};

const maxLen = (n: number): Validator => (raw) => {
  const value = raw.trim();
  return value.length <= n ? { ok: true, value } : { ok: false, code: "long" };
};

const email: Validator = (raw) => {
  const value = raw.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 160
    ? { ok: true, value }
    : { ok: false, code: "email" };
};

const phone: Validator = (raw) => {
  const value = raw.trim();
  // Telegram's "share contact" and hand-typed numbers vary wildly in spacing
  // and punctuation; what matters is that enough digits are present.
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 20 && value.length <= 25
    ? { ok: true, value }
    : { ok: false, code: "phone" };
};

/**
 * Accepts the formats people actually type — 12.04.2018, 12/04/2018,
 * 2018-04-12 — and normalises to the ISO form the schema requires. Rejecting a
 * parent's own date format is a needless way to lose a registration.
 */
export const birthDate: Validator = (raw) => {
  const value = raw.trim();
  let y: number, m: number, d: number;

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const dmy = value.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);

  if (iso) [, y, m, d] = iso.map(Number) as [number, number, number, number];
  else if (dmy) {
    const [, dd, mm, yyyy] = dmy.map(Number) as [number, number, number, number];
    y = yyyy; m = mm; d = dd;
  } else return { ok: false, code: "date" };

  const date = new Date(Date.UTC(y, m - 1, d));
  const real =
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  const now = Date.now();
  const plausible = date.getTime() <= now && now - date.getTime() < 100 * 365.25 * 86_400_000;
  if (!real || !plausible) return { ok: false, code: "date" };

  const pad = (n: number) => String(n).padStart(2, "0");
  return { ok: true, value: `${y}-${pad(m)}-${pad(d)}` };
};

// ── choices ───────────────────────────────────────────────────────────────

const RELATIONSHIP: Choice[] = [
  { value: "mother", label: T("Anne", "Mother", "Мама") },
  { value: "father", label: T("Baba", "Father", "Папа") },
  { value: "guardian", label: T("Veli / Vasi", "Guardian", "Опекун") },
];

const GENDER: Choice[] = [
  { value: "female", label: T("Kız", "Girl", "Девочка") },
  { value: "male", label: T("Erkek", "Boy", "Мальчик") },
  { value: "other", label: T("Diğer", "Other", "Другое") },
];

const BRANCH: Choice[] = [
  { value: "painting", label: T("🎨 Resim & Çizim", "🎨 Painting & Drawing", "🎨 Живопись и рисунок") },
  { value: "crafts", label: T("✂️ El Sanatları", "✂️ Applied Art & Crafts", "✂️ Прикладное творчество") },
  { value: "chess", label: T("♟ Satranç", "♟ Chess", "♟ Шахматы") },
  { value: "individual", label: T("👤 Birebir Ders", "👤 Individual lesson", "👤 Индивидуально") },
];

/** Mirrors `packages` in i18n/translations.ts. */
const PACKAGE: Choice[] = [
  { value: "single", label: T("1 ders", "1 lesson", "1 занятие") },
  { value: "pack2", label: T("2 ders", "2 lessons", "2 занятия") },
  { value: "pack4", label: T("4 ders", "4 lessons", "4 занятия") },
  { value: "pack8", label: T("8 ders ⭐", "8 lessons ⭐", "8 занятий ⭐") },
  { value: "pack12", label: T("12 ders", "12 lessons", "12 занятий") },
  { value: "pack16", label: T("16 ders", "16 lessons", "16 занятий") },
];

// ── the questions ─────────────────────────────────────────────────────────

export const STEPS: Step[] = [
  {
    key: "parentName",
    kind: "text",
    validate: minLen(2),
    ask: T("Veli (anne/baba) ad ve soyadınız nedir?", "What is your full name (parent/guardian)?", "Как вас зовут (родитель/опекун)?"),
    example: T("Ayşe Yılmaz", "Ayşe Yılmaz", "Айше Йылмаз"),
  },
  {
    key: "parentRelationship",
    kind: "choice",
    choices: RELATIONSHIP,
    ask: T("Çocuğa yakınlığınız nedir?", "What is your relationship to the child?", "Кем вы приходитесь ребёнку?"),
  },
  {
    key: "parentPhone",
    kind: "text",
    validate: phone,
    ask: T("WhatsApp numaranız nedir? Stüdyo sizinle bu numaradan iletişime geçecek.", "What is your WhatsApp number? The studio will contact you there.", "Ваш номер WhatsApp? Студия свяжется с вами по нему."),
    example: T("+90 532 123 45 67", "+90 532 123 45 67", "+90 532 123 45 67"),
  },
  {
    key: "parentEmail",
    kind: "text",
    validate: email,
    ask: T("E-posta adresiniz nedir? Kayıt onayını buraya göndereceğiz.", "What is your email address? We'll send the confirmation there.", "Ваш e-mail? Туда придёт подтверждение записи."),
    example: T("ayse@ornek.com", "ayse@example.com", "aishe@primer.com"),
  },
  {
    key: "parentIdNo",
    kind: "text",
    optional: true,
    validate: maxLen(40),
    ask: T("T.C. kimlik veya pasaport numaranız (isteğe bağlı).", "Your ID or passport number (optional).", "Номер удостоверения или паспорта (необязательно)."),
    example: T("12345678901", "12345678901", "12345678901"),
  },
  {
    key: "parentAddress",
    kind: "text",
    optional: true,
    validate: maxLen(300),
    ask: T("Adresiniz (isteğe bağlı).", "Your address (optional).", "Ваш адрес (необязательно)."),
    example: T("Mahmutlar Mah., Barbaros Cad. No 10, Alanya", "Mahmutlar Mah., Barbaros Cad. No 10, Alanya", "Махмутлар, ул. Барбарос 10, Аланья"),
  },
  {
    key: "childName",
    kind: "text",
    validate: minLen(2),
    ask: T("Çocuğunuzun adı ve soyadı nedir?", "What is your child's full name?", "Имя и фамилия ребёнка?"),
    example: T("Elif Yılmaz", "Elif Yılmaz", "Элиф Йылмаз"),
  },
  {
    key: "childBirthDate",
    kind: "text",
    validate: birthDate,
    ask: T("Çocuğunuzun doğum tarihi nedir?", "What is your child's date of birth?", "Дата рождения ребёнка?"),
    example: T("12.04.2018", "12.04.2018", "12.04.2018"),
  },
  {
    key: "childGender",
    kind: "choice",
    choices: GENDER,
    ask: T("Çocuğunuzun cinsiyeti nedir?", "What is your child's gender?", "Пол ребёнка?"),
  },
  {
    key: "emergencyContact",
    kind: "text",
    validate: minLen(3),
    ask: T("Acil durumda aranacak kişi (ad ve telefon).", "Emergency contact (name and phone).", "Контакт для экстренной связи (имя и телефон)."),
    example: T("Babaanne Fatma, +90 532 987 65 43", "Grandmother Fatma, +90 532 987 65 43", "Бабушка Фатма, +90 532 987 65 43"),
  },
  {
    key: "authorizedPickup",
    kind: "text",
    validate: minLen(2),
    ask: T("Çocuğu ders sonunda kimler alabilir? Çocuk yalnızca bu kişilere teslim edilir.", "Who may collect the child after class? Your child is released only to these people.", "Кто может забирать ребёнка после занятия? Ребёнок передаётся только этим людям."),
    example: T("Anne; babaanne Fatma +90 532 987 65 43", "Mother; grandmother Fatma +90 532 987 65 43", "Мама; бабушка Фатма +90 532 987 65 43"),
  },
  {
    key: "childHealthNotes",
    kind: "text",
    optional: true,
    validate: maxLen(500),
    ask: T(
      "Bilmemiz gereken sağlık durumu veya alerji var mı? (isteğe bağlı — boş bırakabilirsiniz)",
      "Any health conditions or allergies we should know about? (optional — you may skip)",
      "Есть ли особенности здоровья или аллергии? (необязательно — можно пропустить)",
    ),
    example: T("Fıstık alerjisi", "Peanut allergy", "Аллергия на арахис"),
  },
  {
    key: "consentHealth",
    kind: "consent",
    mustAccept: true,
    when: (a) => Boolean(a.childHealthNotes?.trim()),
    ask: T(
      "Sağlık bilgisi özel nitelikli kişisel veridir. Yazdığınız notun yalnızca çocuğunuzun ders güvenliği için işlenmesine açık rıza veriyor musunuz? Rıza vermek istemezseniz notu kaldırabilirsiniz.",
      "Health information is special-category personal data. Do you explicitly consent to the note being processed solely for your child's safety during class? If you'd rather not, you can remove the note.",
      "Сведения о здоровье — специальная категория данных. Даёте ли вы явное согласие на обработку заметки только для безопасности ребёнка на занятии? Если нет, заметку можно удалить.",
    ),
  },
  {
    key: "branch",
    kind: "choice",
    choices: BRANCH,
    ask: T("Hangi derse katılmak istiyorsunuz?", "Which class would you like to join?", "На какое занятие вы хотите записаться?"),
  },
  {
    key: "packageId",
    kind: "choice",
    choices: PACKAGE,
    ask: T(
      "Hangi paketi tercih edersiniz? Kesin fiyat ve gün/saat stüdyo tarafından ayrıca teyit edilir.",
      "Which package would you prefer? The exact price and schedule are confirmed separately by the studio.",
      "Какой пакет предпочитаете? Точную цену и расписание студия подтвердит отдельно.",
    ),
  },
  {
    key: "message",
    kind: "text",
    optional: true,
    validate: maxLen(1000),
    ask: T("Eklemek istediğiniz bir not var mı? (isteğe bağlı)", "Anything else you'd like to add? (optional)", "Хотите что-то добавить? (необязательно)"),
    example: T("Hafta sonu saatleri bizim için daha uygun.", "Weekend times suit us better.", "Нам удобнее выходные."),
  },
  {
    key: "privacyNoticeAccepted",
    kind: "consent",
    mustAccept: true,
    ask: T(
      "KVKK Aydınlatma Metni'ni okudunuz mu? Hangi verilerin, hangi amaç ve hukuki sebeple işlendiğini açıklar.",
      "Have you read the KVKK Privacy Notice? It explains what data is processed, for what purpose and on what legal basis.",
      "Вы прочитали уведомление KVKK? В нём указано, какие данные обрабатываются, с какой целью и на каком основании.",
    ),
  },
  {
    key: "termsAccepted",
    kind: "consent",
    mustAccept: true,
    ask: T(
      "Bu kaydın ödeme yükümlülüğü doğurmayan bir talep olduğunu ve Katılım Sözleşmesi ile Stüdyo Kuralları'nı okuduğunuzu onaylıyor musunuz?",
      "Do you confirm this is a non-binding request with no payment obligation, and that you've read the Participation Agreement and Studio Rules?",
      "Подтверждаете ли вы, что это необязывающая заявка без обязанности платить, и что вы прочитали договор об участии и правила студии?",
    ),
  },
  {
    key: "consentMediaWebsite",
    kind: "consent",
    ask: T(
      "İsteğe bağlı: Çocuğunuzun fotoğraf/videolarının makeartalanya.com sitesinde yayımlanmasına izin veriyor musunuz? Vermemeniz kaydı veya ücreti etkilemez.",
      "Optional: may we publish photos/videos of your child on makeartalanya.com? Declining does not affect your registration or price.",
      "Необязательно: разрешаете публиковать фото/видео ребёнка на makeartalanya.com? Отказ не влияет на запись и стоимость.",
    ),
  },
  {
    key: "consentMediaSocial",
    kind: "consent",
    ask: T(
      "İsteğe bağlı: Peki stüdyonun resmi sosyal medya hesaplarında yayımlanmasına? Bu ayrı bir tercihtir.",
      "Optional: and on the studio's official social-media accounts? This is a separate choice.",
      "Необязательно: а в официальных аккаунтах студии в соцсетях? Это отдельный выбор.",
    ),
  },
];

// ── copy ──────────────────────────────────────────────────────────────────

const ERRORS: Record<ErrCode, Loc> = {
  short: T("Bu biraz kısa görünüyor. Lütfen tekrar yazar mısınız?", "That looks too short. Could you write it again?", "Слишком коротко. Напишите, пожалуйста, ещё раз."),
  long: T("Bu biraz uzun oldu. Lütfen kısaltır mısınız?", "That's a bit long. Could you shorten it?", "Слишком длинно. Сократите, пожалуйста."),
  email: T("Bu bir e-posta adresine benzemiyor.", "That doesn't look like an email address.", "Это не похоже на адрес e-mail."),
  phone: T("Bu bir telefon numarasına benzemiyor.", "That doesn't look like a phone number.", "Это не похоже на номер телефона."),
  date: T("Tarihi anlayamadım. Gün.Ay.Yıl olarak yazar mısınız?", "I couldn't read that date. Could you write it as DD.MM.YYYY?", "Не удалось распознать дату. Напишите в формате ДД.ММ.ГГГГ."),
};

export const UI = {
  example: T("Örnek", "Example", "Пример"),
  skip: T("⏭ Atla", "⏭ Skip", "⏭ Пропустить"),
  yes: T("✅ Evet", "✅ Yes", "✅ Да"),
  no: T("❌ Hayır", "❌ No", "❌ Нет"),
  accept: T("✅ Okudum, kabul ediyorum", "✅ I've read it and accept", "✅ Прочитал(а) и принимаю"),
  readNotice: T("📄 Aydınlatma Metni", "📄 Privacy Notice", "📄 Уведомление"),
  readRules: T("📄 Sözleşme ve Kurallar", "📄 Agreement & Rules", "📄 Договор и правила"),
  mustAccept: T(
    "Bu onay olmadan kaydı tamamlayamıyorum. Dilerseniz /iptal yazıp çıkabilirsiniz.",
    "I can't complete the registration without this confirmation. You can type /cancel to stop.",
    "Без этого подтверждения я не могу завершить запись. Можно отправить /cancel, чтобы выйти.",
  ),
  healthDeclined: T(
    "Anlaşıldı — sağlık notunu kaldırdım ve kayda eklemeyeceğim.",
    "Understood — I've removed the health note and won't include it.",
    "Понятно — я удалил(а) заметку о здоровье и не буду её сохранять.",
  ),
  chooseButton: T(
    "Lütfen aşağıdaki düğmelerden birini seçin.",
    "Please choose one of the buttons below.",
    "Пожалуйста, выберите один из вариантов ниже.",
  ),
  review: T("Bilgilerinizi kontrol edin:", "Please check your details:", "Проверьте, пожалуйста, ваши данные:"),
  submit: T("✅ Kaydı gönder", "✅ Submit registration", "✅ Отправить заявку"),
  cancel: T("❌ Vazgeç", "❌ Cancel", "❌ Отменить"),
  cancelled: T(
    "Kayıt iptal edildi. Yeniden başlamak için /start yazın.",
    "Registration cancelled. Send /start to begin again.",
    "Запись отменена. Отправьте /start, чтобы начать заново.",
  ),
  notSet: T("—", "—", "—"),
} as const;

const LABELS: Record<string, Loc> = {
  parentName: T("Veli", "Parent", "Родитель"),
  parentRelationship: T("Yakınlık", "Relationship", "Кем приходится"),
  parentPhone: T("WhatsApp", "WhatsApp", "WhatsApp"),
  parentEmail: T("E-posta", "Email", "E-mail"),
  parentIdNo: T("Kimlik no", "ID no.", "Документ"),
  parentAddress: T("Adres", "Address", "Адрес"),
  childName: T("Çocuk", "Child", "Ребёнок"),
  childBirthDate: T("Doğum tarihi", "Date of birth", "Дата рождения"),
  childGender: T("Cinsiyet", "Gender", "Пол"),
  emergencyContact: T("Acil durum", "Emergency", "Экстренный контакт"),
  authorizedPickup: T("Alabilecek kişiler", "May collect", "Кто забирает"),
  childHealthNotes: T("Sağlık notu", "Health note", "Здоровье"),
  branch: T("Ders", "Class", "Занятие"),
  packageId: T("Paket", "Package", "Пакет"),
  message: T("Not", "Note", "Заметка"),
  consentMediaWebsite: T("Web sitesi izni", "Website permission", "Разрешение сайт"),
  consentMediaSocial: T("Sosyal medya izni", "Social-media permission", "Разрешение соцсети"),
};

// ── helpers ───────────────────────────────────────────────────────────────

export function stepByKey(key: string): Step | undefined {
  return STEPS.find((s) => s.key === key);
}

/** The next question that applies, given what has been answered so far. */
export function nextStep(answers: Answers, afterKey?: string): Step | null {
  const start = afterKey ? STEPS.findIndex((s) => s.key === afterKey) + 1 : 0;
  for (let i = start; i < STEPS.length; i++) {
    const step = STEPS[i];
    if (!step.when || step.when(answers)) return step;
  }
  return null;
}

function choiceLabel(step: Step, value: string, lang: Lang): string | null {
  return step.choices?.find((c) => c.value === value)?.label[lang] ?? null;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://makeartalanya.com";

/** Renders the prompt for a step, with its example and buttons. */
export function prompt(step: Step, lang: Lang, index: number, total: number): BotReply {
  const lines = [`<b>${index}/${total}</b> · ${step.ask[lang]}`];
  if (step.example) {
    lines.push("", `<i>${UI.example[lang]}: ${step.example[lang]}</i>`);
  }

  const buttons: Button[][] = [];

  if (step.kind === "choice" && step.choices) {
    for (const choice of step.choices) {
      buttons.push([{ label: choice.label[lang], data: CB.answer(step.key, choice.value) }]);
    }
  }

  if (step.kind === "consent") {
    if (step.key === "privacyNoticeAccepted") {
      buttons.push([{ label: UI.readNotice[lang], url: `${SITE}/privacy` }]);
      buttons.push([{ label: UI.accept[lang], data: CB.answer(step.key, "yes") }]);
    } else if (step.key === "termsAccepted") {
      buttons.push([{ label: UI.readRules[lang], url: `${SITE}/rules` }]);
      buttons.push([{ label: UI.accept[lang], data: CB.answer(step.key, "yes") }]);
    } else {
      buttons.push([
        { label: UI.yes[lang], data: CB.answer(step.key, "yes") },
        { label: UI.no[lang], data: CB.answer(step.key, "no") },
      ]);
    }
  }

  if (step.optional) {
    buttons.push([{ label: UI.skip[lang], data: CB.skip(step.key) }]);
  }

  return { text: lines.join("\n"), buttons: buttons.length ? buttons : undefined };
}

/** Position of a step among those that will actually be asked. */
export function progress(step: Step, answers: Answers): { index: number; total: number } {
  const applicable = STEPS.filter((s) => !s.when || s.when(answers));
  const index = applicable.findIndex((s) => s.key === step.key) + 1;
  return { index: Math.max(index, 1), total: applicable.length };
}

export function askFor(step: Step, lang: Lang, answers: Answers): BotReply {
  const { index, total } = progress(step, answers);
  return prompt(step, lang, index, total);
}

/** The review shown before submitting. */
export function summary(answers: Answers, lang: Lang): BotReply {
  const lines = [`<b>${UI.review[lang]}</b>`, ""];

  for (const step of STEPS) {
    if (step.kind === "consent" && step.key !== "consentMediaWebsite" && step.key !== "consentMediaSocial") {
      continue;
    }
    const label = LABELS[step.key];
    if (!label) continue;

    const raw = answers[step.key] ?? "";
    let shown: string;

    if (step.kind === "consent") shown = raw === "yes" ? UI.yes[lang] : UI.no[lang];
    else if (step.kind === "choice") shown = choiceLabel(step, raw, lang) ?? UI.notSet[lang];
    else shown = raw.trim() || UI.notSet[lang];

    lines.push(`<b>${label[lang]}:</b> ${escape(shown)}`);
  }

  return {
    text: lines.join("\n"),
    buttons: [
      [{ label: UI.submit[lang], data: CB.submit }],
      [{ label: UI.cancel[lang], data: CB.cancel }],
    ],
  };
}

function escape(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── the transition ────────────────────────────────────────────────────────

export type Input =
  | { kind: "text"; text: string }
  | { kind: "choice"; step: string; value: string }
  | { kind: "skip"; step: string };

export type Advance =
  | { status: "ask"; answers: Answers; step: Step; replies: BotReply[] }
  | { status: "review"; answers: Answers; replies: BotReply[] }
  | { status: "retry"; answers: Answers; step: Step; replies: BotReply[] };

/**
 * Applies one input to the conversation.
 *
 * Never throws and never mutates its arguments; an invalid answer produces a
 * "retry" with an explanation rather than dropping the parent out of the flow.
 */
export function advance(current: Step, answers: Answers, input: Input, lang: Lang): Advance {
  const next = { ...answers };
  const before: BotReply[] = [];

  // A stale button from an earlier question — the parent scrolled up and
  // tapped it. Ignore the value rather than writing it to the wrong field.
  if (input.kind !== "text" && input.step !== current.key) {
    return { status: "retry", answers, step: current, replies: [askFor(current, lang, answers)] };
  }

  if (input.kind === "skip") {
    if (!current.optional) {
      return {
        status: "retry",
        answers,
        step: current,
        replies: [{ text: UI.mustAccept[lang] }, askFor(current, lang, answers)],
      };
    }
    next[current.key] = "";
  } else if (input.kind === "choice") {
    if (current.kind === "consent") {
      const accepted = input.value === "yes";
      if (!accepted && current.mustAccept) {
        // Declining the health consent is a legitimate answer: drop the note
        // and move on. The two acknowledgements have no such escape hatch.
        if (current.key === "consentHealth") {
          next.childHealthNotes = "";
          next[current.key] = "no";
          before.push({ text: UI.healthDeclined[lang] });
        } else {
          return {
            status: "retry",
            answers,
            step: current,
            replies: [{ text: UI.mustAccept[lang] }, askFor(current, lang, answers)],
          };
        }
      } else {
        next[current.key] = accepted ? "yes" : "no";
      }
    } else {
      const known = current.choices?.some((c) => c.value === input.value);
      if (!known) {
        return { status: "retry", answers, step: current, replies: [askFor(current, lang, answers)] };
      }
      next[current.key] = input.value;
    }
  } else {
    // Free text. Buttons-only steps say so rather than storing prose.
    if (current.kind !== "text") {
      return {
        status: "retry",
        answers,
        step: current,
        replies: [{ text: UI.chooseButton[lang] }, askFor(current, lang, answers)],
      };
    }

    const typed = input.text.trim();
    if (current.optional && isSkipWord(typed)) {
      next[current.key] = "";
    } else {
      const result = current.validate ? current.validate(typed) : ({ ok: true, value: typed } as const);
      if (!result.ok) {
        return {
          status: "retry",
          answers,
          step: current,
          replies: [{ text: `⚠️ ${ERRORS[result.code][lang]}` }, askFor(current, lang, answers)],
        };
      }
      next[current.key] = result.value;
    }
  }

  const following = nextStep(next, current.key);
  if (!following) {
    return { status: "review", answers: next, replies: [...before, summary(next, lang)] };
  }
  return {
    status: "ask",
    answers: next,
    step: following,
    replies: [...before, askFor(following, lang, next)],
  };
}

const SKIP_WORDS = new Set(["skip", "atla", "geç", "gec", "пропустить", "пропуск", "-", "yok", "нет", "none", "no"]);

function isSkipWord(text: string): boolean {
  return SKIP_WORDS.has(text.toLowerCase());
}

/**
 * Turns collected answers into the payload registrationSchema validates.
 * Optional answers are empty strings, which the schema accepts as "not given".
 */
export function toRegistrationInput(answers: Answers, lang: Lang) {
  return {
    parentName: answers.parentName ?? "",
    parentIdNo: answers.parentIdNo ?? "",
    parentRelationship: answers.parentRelationship ?? "",
    parentEmail: answers.parentEmail ?? "",
    parentPhone: answers.parentPhone ?? "",
    parentAddress: answers.parentAddress ?? "",
    childName: answers.childName ?? "",
    childBirthDate: answers.childBirthDate ?? "",
    childGender: answers.childGender ?? "",
    childHealthNotes: answers.childHealthNotes ?? "",
    emergencyContact: answers.emergencyContact ?? "",
    authorizedPickup: answers.authorizedPickup ?? "",
    branch: answers.branch ?? "",
    packageId: answers.packageId ?? "",
    preferredLanguage: lang,
    message: answers.message ?? "",
    privacyNoticeAccepted: answers.privacyNoticeAccepted === "yes",
    termsAccepted: answers.termsAccepted === "yes",
    consentHealth: answers.consentHealth === "yes",
    consentMediaWebsite: answers.consentMediaWebsite === "yes",
    consentMediaSocial: answers.consentMediaSocial === "yes",
  };
}
