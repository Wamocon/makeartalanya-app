/**
 * Records the trilingual walkthrough videos embedded at the top of /handbook.
 *
 * One recording per locale rather than one recording with subtitle tracks: the
 * site itself is trilingual, so a Russian-speaking parent should watch the
 * Russian interface, not read captions over a Turkish one.
 *
 *   node scripts/record-walkthrough.mjs                    # all three locales
 *   node scripts/record-walkthrough.mjs tr                 # just one
 *   BASE_URL=http://localhost:3000 node scripts/...        # override target
 *
 * ⚠️ Two deliberate limits, because .env.local points at the live Supabase
 * project:
 *   1. The admin dashboard is never visited — it holds real client records,
 *      including children's names.
 *   2. The registration form is filled but NEVER submitted. Submitting would
 *      write a junk row to the production `registrations` table and fire the
 *      email + Telegram alerts to the studio.
 * Both limits are load-bearing. Do not "improve" this script by removing them.
 *
 * Output: public/video/walkthrough-<locale>.webm + walkthrough-<locale>.jpg
 * Playwright's bundled ffmpeg only ships the VP8 encoder, so WebM is the only
 * format available here. If an MP4 is ever needed, transcode with a real ffmpeg.
 */

import { chromium } from "@playwright/test";
import { mkdir, readdir, rename, rm, stat, glob } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public", "video");
const TMP_DIR = path.join(process.cwd(), ".playwright-video-tmp");
const SIZE = { width: 1280, height: 720 };

/** Obviously fake demo data — nothing here resembles a real family. */
const DEMO = {
  parentName: "Ayşe Yılmaz",
  parentId: "10000000000",
  phone: "+90 555 000 00 00",
  email: "ornek@example.com",
  address: "Mahmutlar Mah., Alanya",
  childName: "Deniz Yılmaz",
  birthDate: "2016-04-12",
  emergency: "Mehmet Yılmaz · +90 555 000 00 01",
};

const COPY = {
  tr: {
    demoBadge: "ÖRNEK VERİ",
    steps: {
      intro: "Make Art Studio Alanya — Mahmutlar'da deniz kenarında sanat atölyesi.",
      offer: "Resim, uygulamalı sanat, satranç ve bireysel dersler. En fazla 8 kişilik gruplar.",
      packages: "Dersler tek tek veya paket hâlinde alınır: 1, 2, 4, 8, 12 veya 16 ders.",
      price: "Ücretler vergiler dâhil, Türk lirası olarak ve kayıttan önce bildirilir.",
      how: "Kayıt 4 adımda: paket seçin, randevu alın, stüdyoya gelin, eserinizi yaratın.",
      gallery: "Galeride öğrencilerimizin çalışmalarını görebilirsiniz.",
      location: "Sahil Caddesi 165E · Pazartesi – Cumartesi 10:00 – 20:00",
      toForm: "Şimdi kayıt formunu birlikte dolduralım.",
      formIntro: "Form dört bölümden oluşur: veli, çocuk, kayıt ve onaylar.",
      parent: "1. Veli bilgileri: ad soyad, telefon ve e-posta.",
      phone: "Stüdyo sizinle bu WhatsApp numarasından iletişime geçer.",
      child: "2. Çocuk bilgileri: ad soyad ve doğum tarihi.",
      pickup: "Çocuğu kimlerin alabileceğini yazın — yalnızca bu kişilere teslim edilir.",
      health: "Sağlık ve alerji alanı isteğe bağlıdır. Boş bırakabilirsiniz.",
      healthConsent: "Doldurursanız, yalnızca bunun için ayrı bir onay kutusu açılır.",
      enroll: "3. Branş ve paket seçimi.",
      consents: "4. Zorunlu olan iki onay: Aydınlatma Metni ve ön bilgilendirme.",
      media: "Fotoğraf izinleri isteğe bağlıdır — web sitesi ve sosyal medya ayrı ayrı.",
      optional: "Vermezseniz kaydınız, çocuğunuzun yeri veya ücret etkilenmez.",
      noSubmit: "Bu bir tanıtım videosudur, form gönderilmiyor. Gerçek kayıtta «Kaydı Gönder»e basın.",
      after: "Kaydınızı aldıktan sonra stüdyo WhatsApp'tan gün, saat ve paketi netleştirir.",
      handbook: "Tüm ayrıntılar — abonman, cayma hakkı, iade, haklarınız — aşağıdaki metinde.",
      outro: "Sorularınız için: +90 551 674 55 15 · makeartstudio.tr@gmail.com",
    },
  },
  en: {
    demoBadge: "DEMO DATA",
    steps: {
      intro: "Make Art Studio Alanya — an art atelier by the sea in Mahmutlar.",
      offer: "Painting, applied art, chess and individual lessons. Groups of up to 8.",
      packages: "Lessons are sold singly or as packages: 1, 2, 4, 8, 12 or 16 lessons.",
      price: "Prices include taxes, are quoted in Turkish lira, and are given before you register.",
      how: "Registration in 4 steps: choose a package, book a slot, come in, create your art.",
      gallery: "The gallery shows work made by our students.",
      location: "Sahil Avenue 165E · Monday – Saturday 10:00 – 20:00",
      toForm: "Now let's fill in the registration form together.",
      formIntro: "The form has four parts: parent, child, enrolment and consents.",
      parent: "1. Parent details: full name, phone and email.",
      phone: "The studio contacts you on this WhatsApp number.",
      child: "2. Child details: full name and date of birth.",
      pickup: "Name who may collect the child — they are released to nobody else.",
      health: "The health and allergy field is optional. You may leave it empty.",
      healthConsent: "If you do fill it in, a separate consent box appears just for that.",
      enroll: "3. Choose the class and the package.",
      consents: "4. Two required confirmations: the privacy notice and the pre-contract information.",
      media: "Photo permissions are optional — website and social media are separate.",
      optional: "Refusing them changes nothing about your registration, place or price.",
      noSubmit: "This is a demo, so the form is not submitted. In a real registration, press Submit.",
      after: "Once we have your request, the studio settles day, time and package on WhatsApp.",
      handbook: "Every detail — subscription, withdrawal, refunds, your rights — is in the text below.",
      outro: "Questions? +90 551 674 55 15 · makeartstudio.tr@gmail.com",
    },
  },
  ru: {
    demoBadge: "ПРИМЕР ДАННЫХ",
    steps: {
      intro: "Make Art Studio в Алании — художественная студия у моря в Махмутларе.",
      offer: "Живопись, прикладное творчество, шахматы и индивидуальные занятия. Группы до 8 человек.",
      packages: "Занятия можно брать по одному или пакетом: 1, 2, 4, 8, 12 или 16 занятий.",
      price: "Цены с учётом налогов, в турецких лирах, и сообщаются до записи.",
      how: "Запись за 4 шага: выбрать пакет, записаться, прийти в студию, создать работу.",
      gallery: "В галерее — работы наших учеников.",
      location: "Береговой проспект 165E · Понедельник – Суббота 10:00 – 20:00",
      toForm: "Теперь заполним форму записи вместе.",
      formIntro: "Форма состоит из четырёх частей: родитель, ребёнок, запись и согласия.",
      parent: "1. Данные родителя: имя и фамилия, телефон и email.",
      phone: "Студия свяжется с вами по этому номеру WhatsApp.",
      child: "2. Данные ребёнка: имя, фамилия и дата рождения.",
      pickup: "Укажите, кто может забирать ребёнка — другим его не передадут.",
      health: "Поле о здоровье и аллергиях необязательное. Его можно оставить пустым.",
      healthConsent: "Если вы его заполните, появится отдельная галочка согласия именно для этого.",
      enroll: "3. Выберите занятие и пакет.",
      consents: "4. Два обязательных подтверждения: уведомление KVKK и преддоговорная информация.",
      media: "Разрешения на фото необязательны — сайт и соцсети отмечаются отдельно.",
      optional: "Отказ ничего не меняет ни в записи, ни в месте ребёнка, ни в цене.",
      noSubmit: "Это демонстрация, форма не отправляется. При настоящей записи нажмите «Отправить».",
      after: "После получения заявки студия согласует день, время и пакет в WhatsApp.",
      handbook: "Все подробности — абонемент, отказ, возвраты, ваши права — в тексте ниже.",
      outro: "Вопросы: +90 551 674 55 15 · makeartstudio.tr@gmail.com",
    },
  },
};

/**
 * Injected on every document: a caption bar, a "demo data" badge and a
 * spotlight helper. Kept inside addInitScript so it survives navigation.
 */
const OVERLAY_SCRIPT = (demoBadge) => `
  (() => {
    const DEMO_BADGE = ${JSON.stringify(demoBadge)};
    function ensure() {
      if (document.getElementById("__wt_cap")) return;
      const style = document.createElement("style");
      style.textContent = \`
        #__wt_cap{position:fixed;left:0;right:0;bottom:0;z-index:2147483647;
          padding:18px 40px 22px;background:linear-gradient(to top,rgba(12,9,17,.94),rgba(12,9,17,.78) 62%,rgba(12,9,17,0));
          color:#fff;font:600 21px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
          text-align:center;pointer-events:none;opacity:0;transition:opacity .35s ease;
          text-shadow:0 2px 12px rgba(0,0,0,.6)}
        #__wt_cap.on{opacity:1}
        #__wt_cap b{display:block;height:3px;width:56px;margin:0 auto 13px;border-radius:3px;
          background:linear-gradient(90deg,#ff3d76,#7559d9)}
        #__wt_badge{position:fixed;top:16px;right:18px;z-index:2147483647;
          padding:7px 13px;border-radius:999px;background:rgba(12,9,17,.82);color:#ffd9e4;
          font:800 11px/1 system-ui,sans-serif;letter-spacing:.14em;pointer-events:none;
          opacity:0;transition:opacity .3s ease}
        #__wt_badge.on{opacity:1}
        .__wt_spot{outline:3px solid #ff3d76 !important;outline-offset:4px !important;
          border-radius:14px;transition:outline-color .2s ease}
        /* The concierge launcher is anchored bottom-right, exactly where the
           caption bar sits. Hide it for the recording only. */
        [data-concierge]{display:none !important}
      \`;
      document.head.appendChild(style);
      const cap = document.createElement("div");
      cap.id = "__wt_cap";
      cap.innerHTML = "<b></b><span></span>";
      document.body.appendChild(cap);
      const badge = document.createElement("div");
      badge.id = "__wt_badge";
      badge.textContent = DEMO_BADGE;
      document.body.appendChild(badge);
    }
    window.__wtCaption = (text) => {
      ensure();
      const cap = document.getElementById("__wt_cap");
      cap.querySelector("span").textContent = text;
      cap.classList.toggle("on", Boolean(text));
    };
    window.__wtBadge = (on) => {
      ensure();
      document.getElementById("__wt_badge").classList.toggle("on", on);
    };
    window.__wtSpot = (el) => {
      document.querySelectorAll(".__wt_spot").forEach((n) => n.classList.remove("__wt_spot"));
      if (el) el.classList.add("__wt_spot");
    };
    /* Animated scroll — the browser's own smooth scroll is too abrupt to read
       on video, and it also drives the page's GSAP reveal animations. */
    window.__wtScroll = (target, ms) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const delta = target - start;
        const t0 = performance.now();
        const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
        function tick(now) {
          const p = Math.min(1, (now - t0) / ms);
          window.scrollTo(0, start + delta * ease(p));
          p < 1 ? requestAnimationFrame(tick) : resolve();
        }
        requestAnimationFrame(tick);
      });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", ensure);
    } else {
      ensure();
    }
  })();
`;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Playwright ships its own ffmpeg for recording; it only has the VP8 encoder,
 * which is all the re-encode below needs. Prefer an explicit FFMPEG_PATH, then a
 * system ffmpeg, then the bundled one.
 */
async function findFfmpeg() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    await run("ffmpeg", ["-version"]);
    return "ffmpeg";
  } catch {
    /* fall through to the bundled binary */
  }
  const roots = [process.env.LOCALAPPDATA, process.env.HOME && path.join(process.env.HOME, ".cache")].filter(Boolean);
  for (const root of roots) {
    for await (const hit of glob("ms-playwright/ffmpeg-*/ffmpeg-*", { cwd: root })) {
      return path.join(root, hit);
    }
  }
  return null;
}

/**
 * Playwright writes recordings at roughly double the bitrate this content needs
 * — it is a screen capture of mostly flat colour. Re-encoding halves the file
 * with no visible loss on the captions or the small form labels, which matters
 * because the audience is largely on Turkish and Russian mobile data.
 */
async function compress(ffmpeg, file) {
  if (!ffmpeg) return;
  const before = (await stat(file)).size;
  const tmp = `${file}.tmp.webm`;
  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", file,
    "-c:v", "libvpx", "-b:v", "620k", "-crf", "33",
    "-qmin", "4", "-qmax", "48",
    "-auto-alt-ref", "1", "-lag-in-frames", "16",
    "-cpu-used", "2",
    "-an",
    tmp,
  ]);
  await rm(file, { force: true });
  await rename(tmp, file);
  const after = (await stat(file)).size;
  const mb = (n) => (n / 1e6).toFixed(1);
  console.log(`    compressed ${mb(before)} MB → ${mb(after)} MB`);
}

async function recordLocale(browser, locale, ffmpeg) {
  const t = COPY[locale];
  const context = await browser.newContext({
    viewport: SIZE,
    recordVideo: { dir: TMP_DIR, size: SIZE },
    deviceScaleFactor: 1,
    /* The landing page reads ?lang=, the registration form reads the cookie.
       Set both so nothing flips language mid-recording. */
    storageState: {
      cookies: [
        { name: "lang", value: locale, domain: "localhost", path: "/", expires: -1, httpOnly: false, secure: false, sameSite: "Lax" },
      ],
      origins: [],
    },
  });
  const page = await context.newPage();
  await page.addInitScript(OVERLAY_SCRIPT(t.demoBadge));

  const caption = async (text, hold = 0) => {
    await page.evaluate((v) => window.__wtCaption(v), text);
    if (hold) await wait(hold);
  };
  const scrollTo = async (selector, ms = 1400) => {
    await page.evaluate(
      async ([sel, dur]) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - 60;
        await window.__wtScroll(top, dur);
      },
      [selector, ms],
    );
  };
  const spot = async (locator) => {
    await locator.scrollIntoViewIfNeeded();
    const handle = await locator.elementHandle();
    await page.evaluate((el) => window.__wtSpot(el), handle);
  };
  const typeInto = async (locator, value, delay = 28) => {
    await spot(locator);
    await locator.click();
    await locator.pressSequentially(value, { delay });
  };

  /* ---------- Landing page ---------- */
  /* Caption as soon as the DOM exists rather than after networkidle — the hero
     loads a video and Three.js, and waiting for idle first left seconds of
     silent dead air at the head of every recording. */
  await page.goto(`${BASE_URL}/?lang=${locale}`, { waitUntil: "domcontentloaded" });
  await caption(t.steps.intro);
  await page.waitForLoadState("networkidle").catch(() => {});
  await wait(2600);

  await scrollTo("#why", 1700);
  await caption(t.steps.offer, 3400);

  await scrollTo("#courses", 1700);
  await caption(t.steps.packages, 3600);
  await page.evaluate(() => window.__wtScroll(window.scrollY + 520, 1400));
  await caption(t.steps.price, 3400);

  await caption(t.steps.how);
  await scrollTo("#how-it-works", 1700);
  await wait(2200);
  await page.evaluate(() => window.__wtScroll(window.scrollY + 480, 1500));
  await wait(2000);

  await scrollTo("#gallery", 1700);
  await caption(t.steps.gallery, 3200);

  await scrollTo("#contact", 1800);
  await caption(t.steps.location, 3400);

  await caption(t.steps.toForm, 2600);

  /* ---------- Registration form ---------- */
  await page.goto(`${BASE_URL}/kayit`, { waitUntil: "networkidle" });
  await wait(900);
  await page.evaluate(() => window.__wtBadge(true));
  await caption(t.steps.formIntro, 3400);

  const plain = page.locator("form input:not([type])");
  const textareas = page.locator("form textarea");
  const selects = page.locator("form select");

  await caption(t.steps.parent);
  await typeInto(plain.nth(0), DEMO.parentName);
  await wait(500);
  await typeInto(plain.nth(1), DEMO.parentId, 18);
  await caption(t.steps.phone);
  await typeInto(page.locator('form input[type="tel"]'), DEMO.phone, 22);
  await typeInto(page.locator('form input[type="email"]'), DEMO.email, 22);
  await typeInto(plain.nth(2), DEMO.address, 18);
  await wait(700);

  await caption(t.steps.child);
  await typeInto(plain.nth(3), DEMO.childName);
  const dob = page.locator('form input[type="date"]');
  await spot(dob);
  await dob.fill(DEMO.birthDate);
  await wait(600);
  await spot(selects.nth(1));
  await selects.nth(1).selectOption({ index: 1 });
  await wait(900);

  await caption(t.steps.pickup);
  await typeInto(plain.nth(4), DEMO.emergency, 16);
  await typeInto(textareas.nth(0), DEMO.emergency, 14);
  await wait(700);

  await caption(t.steps.health, 2800);
  await caption(t.steps.healthConsent);
  await typeInto(textareas.nth(1), locale === "ru" ? "Аллергия на орехи" : locale === "en" ? "Nut allergy" : "Fındık alerjisi", 26);
  await wait(1400);

  await caption(t.steps.enroll);
  await spot(selects.nth(2));
  await selects.nth(2).selectOption({ index: 1 });
  await wait(700);
  await spot(selects.nth(3));
  /* Index 4 is the 8-lesson package — the standard offer, and the one the
     subscription rules in the handbook are written around. */
  await selects.nth(3).selectOption({ index: 4 });
  await wait(1400);

  /* ---------- Consents ---------- */
  const boxes = page.locator('form input[type="checkbox"]');
  await caption(t.steps.consents);
  await spot(boxes.nth(0));
  await boxes.nth(0).check();
  await wait(700);
  await spot(boxes.nth(1));
  await boxes.nth(1).check();
  await wait(900);

  /* Index 2 is the health consent, which only exists because the health field
     above was filled — that is the point being demonstrated. */
  await spot(boxes.nth(2));
  await boxes.nth(2).check();
  await wait(1100);

  await caption(t.steps.media);
  await spot(boxes.nth(3));
  await boxes.nth(3).check();
  await wait(800);
  await caption(t.steps.optional, 3000);

  /* Spotlight the submit button and explain — but never click it. */
  const submit = page.locator('form button[type="submit"]');
  await spot(submit);
  await caption(t.steps.noSubmit, 4200);
  await caption(t.steps.after, 3600);
  await page.evaluate(() => window.__wtSpot(null));
  await page.evaluate(() => window.__wtBadge(false));

  /* ---------- Handbook ---------- */
  await page.goto(`${BASE_URL}/handbook`, { waitUntil: "networkidle" });
  await wait(900);
  await caption(t.steps.handbook);
  await page.evaluate(() => window.__wtScroll(620, 2200));
  await wait(2400);
  await caption(t.steps.outro, 3800);
  await caption("", 700);

  const video = page.video();
  await context.close();

  const raw = await video.path();
  const final = path.join(OUT_DIR, `walkthrough-${locale}.webm`);
  await rename(raw, final);
  console.log(`  ✓ walkthrough-${locale}.webm`);
  await compress(ffmpeg, final);
}

async function capturePoster(browser, locale) {
  const context = await browser.newContext({ viewport: SIZE, deviceScaleFactor: 1.5 });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/?lang=${locale}`, { waitUntil: "networkidle" });
  await wait(2200);
  await page.screenshot({
    path: path.join(OUT_DIR, `walkthrough-${locale}.jpg`),
    type: "jpeg",
    quality: 78,
  });
  await context.close();
  console.log(`  ✓ walkthrough-${locale}.jpg`);
}

const requested = process.argv.slice(2).filter((a) => a in COPY);
const locales = requested.length ? requested : ["tr", "en", "ru"];

await mkdir(OUT_DIR, { recursive: true });
await mkdir(TMP_DIR, { recursive: true });

const ffmpeg = await findFfmpeg();
if (!ffmpeg) console.warn("  ! no ffmpeg found — recordings will be left uncompressed");

const browser = await chromium.launch();
try {
  /* Posters first: the tail of each recording visits /handbook, where the video
     player shows its own poster. Recording before the poster exists would film a
     black rectangle. */
  for (const locale of locales) {
    console.log(`Poster ${locale}…`);
    await capturePoster(browser, locale);
  }
  for (const locale of locales) {
    console.log(`Recording ${locale}…`);
    await recordLocale(browser, locale, ffmpeg);
  }
} finally {
  await browser.close();
  /* Playwright leaves the raw recordings behind if a run failed mid-way. */
  const leftovers = await readdir(TMP_DIR).catch(() => []);
  if (leftovers.length) console.warn(`  ! ${leftovers.length} unclaimed file(s) in ${TMP_DIR}`);
  else await rm(TMP_DIR, { recursive: true, force: true });
}
