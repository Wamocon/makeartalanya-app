/**
 * Email notification service using Strato SMTP (Nodemailer).
 * Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment variables.
 */

import "server-only";
import nodemailer from "nodemailer";

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() || "";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.strato.de";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  (SMTP_USER ? `Make Art Studio <${SMTP_USER}>` : "Make Art Studio <noreply@makeartalanya.com>");
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.makeartalanya.com";
// Mail goes out as noreply@ so it passes SPF/DKIM on the verified domain, but a
// parent hitting reply on their confirmation is trying to reach a person. Point
// replies at the studio inbox rather than dropping them.
const REPLY_TO = process.env.REPLY_TO_EMAIL?.trim() || ADMIN_EMAIL;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function createTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    tls: { minVersion: "TLSv1.2" },
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown SMTP error";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeSubject(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 100);
}

export async function verifyEmailService(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  if (!SMTP_USER || !SMTP_PASS) {
    return { ok: false, reason: "SMTP_USER or SMTP_PASS is missing" };
  }

  try {
    await createTransport().verify();
    return { ok: true };
  } catch (error) {
    return { ok: false, reason: errorMessage(error) };
  }
}

/**
 * Sends through Resend's HTTP API.
 *
 * Preferred over SMTP on Vercel: a serverless function has to open a TCP
 * connection and complete an SMTP handshake on every cold start, which is slow
 * and occasionally blocked outright. An HTTPS POST has neither problem, and it
 * returns a message id we can quote when chasing a delivery.
 */
async function sendViaResend(payload: EmailPayload): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.to],
        ...(REPLY_TO ? { reply_to: [REPLY_TO] } : {}),
        subject: payload.subject,
        html: payload.html,
        // Some providers penalise HTML-only mail; a text part also makes the
        // message readable in clients that refuse HTML.
        text: payload.text ?? htmlToText(payload.html),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[Email] Resend rejected the message (${res.status}): ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] Resend request failed:", errorMessage(err));
    return false;
  }
}

/** Crude but adequate plain-text alternative for our own templates. */
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  // Resend first when configured; otherwise fall back to whatever SMTP host is
  // set, so an environment without RESEND_API_KEY keeps working unchanged.
  if (RESEND_API_KEY) return sendViaResend(payload);

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn(
      "[Email] Neither RESEND_API_KEY nor SMTP credentials are set — skipping email send",
    );
    return false;
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: payload.to,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      subject: payload.subject,
      html: payload.html,
      text: payload.text ?? htmlToText(payload.html),
    });
    return true;
  } catch (err) {
    console.error("[Email] Delivery failed:", errorMessage(err));
    return false;
  }
}

export async function sendEmailServiceTest(): Promise<boolean> {
  if (!ADMIN_EMAIL) {
    console.warn("[Email] ADMIN_NOTIFICATION_EMAIL not set — test skipped");
    return false;
  }

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: "Make Art Studio — email service test",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #2D2327;">
        <h2 style="margin: 0 0 12px; color: #D06E85;">Email service is working</h2>
        <p style="line-height: 1.6;">Strato SMTP authentication and delivery were successfully triggered by Make Art Studio.</p>
        <p style="font-size: 12px; color: #7B6E72;">This is a configuration test; no customer booking was created.</p>
      </div>
    `,
  });
}

type Lang = "tr" | "en" | "ru";

const BRANCH_LABEL: Record<Lang, Record<string, string>> = {
  tr: { painting: "Resim & Çizim", chess: "Satranç", crafts: "El Sanatları", individual: "Özel Ders" },
  en: { painting: "Painting & Drawing", chess: "Chess", crafts: "Crafts", individual: "Private lesson" },
  ru: { painting: "Рисование", chess: "Шахматы", crafts: "Рукоделие", individual: "Индивидуально" },
};

const CONFIRMATION: Record<
  Lang,
  { subject: string; heading: string; intro: string; details: string; child: string;
    branch: string; next: string; nextBody: string; cta: string; signoff: string }
> = {
  tr: {
    subject: "Kaydınızı aldık — Make Art Studio Alanya",
    heading: "Teşekkürler!",
    intro: "Kayıt talebinizi aldık. Aşağıda verdiğiniz bilgileri bulabilirsiniz.",
    details: "Kayıt Bilgileri",
    child: "Çocuk",
    branch: "Branş",
    next: "Sırada ne var?",
    nextBody:
      "Stüdyomuz kısa süre içinde sizinle iletişime geçerek gün, saat ve paket detaylarını netleştirecek. Bu e-posta bir ödeme yükümlülüğü doğurmaz.",
    cta: "Ders programını görüntüle",
    signoff: "Sanatla kalın,<br/>Make Art Studio Alanya",
  },
  en: {
    subject: "We've received your registration — Make Art Studio Alanya",
    heading: "Thank you!",
    intro: "We've received your registration request. Here's what you sent us.",
    details: "Registration details",
    child: "Child",
    branch: "Course",
    next: "What happens next?",
    nextBody:
      "The studio will contact you shortly to confirm days, times and package details. This email does not create any payment obligation.",
    cta: "View the class schedule",
    signoff: "See you soon,<br/>Make Art Studio Alanya",
  },
  ru: {
    subject: "Мы получили вашу заявку — Make Art Studio Alanya",
    heading: "Спасибо!",
    intro: "Мы получили вашу заявку. Ниже — данные, которые вы отправили.",
    details: "Данные заявки",
    child: "Ребёнок",
    branch: "Направление",
    next: "Что дальше?",
    nextBody:
      "Студия свяжется с вами в ближайшее время, чтобы подтвердить дни, время и детали пакета. Это письмо не создаёт обязательств по оплате.",
    cta: "Посмотреть расписание",
    signoff: "До скорой встречи,<br/>Make Art Studio Alanya",
  },
};

/**
 * Confirmation to the parent who registered.
 *
 * Unlike the studio alert this one may carry the child's name: it goes only to
 * the guardian who just typed it in, about their own child. Health notes are
 * still omitted — there is no reason to put special-category data in an inbox.
 */
export async function sendRegistrationConfirmation(registration: {
  parentEmail: string;
  parentName: string;
  childName: string;
  branch: string;
  language: string;
}): Promise<boolean> {
  const email = registration.parentEmail?.trim();
  // Email is a required form field; this guard only covers other callers.
  if (!email) return false;

  const lang: Lang = (["tr", "en", "ru"] as const).includes(registration.language as Lang)
    ? (registration.language as Lang)
    : "tr";
  const t = CONFIRMATION[lang];
  const branch = BRANCH_LABEL[lang][registration.branch] ?? registration.branch;

  return sendEmail({
    to: email,
    subject: t.subject,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#2D2327;">
        <h1 style="margin:0 0 8px;font-size:26px;color:#D06E85;">${t.heading}</h1>
        <p style="margin:0 0 24px;line-height:1.6;color:#5C4F53;">
          ${escapeHtml(registration.parentName)}, ${t.intro}
        </p>

        <div style="background:#FDF7F8;border:1px solid #F0E8EB;border-radius:14px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9B8A8F;">${t.details}</p>
          <p style="margin:6px 0;"><strong>${t.child}:</strong> ${escapeHtml(registration.childName)}</p>
          <p style="margin:6px 0;"><strong>${t.branch}:</strong> ${escapeHtml(branch)}</p>
        </div>

        <p style="margin:0 0 6px;font-weight:600;">${t.next}</p>
        <p style="margin:0 0 24px;line-height:1.6;color:#5C4F53;">${t.nextBody}</p>

        <a href="${SITE_URL}/schedule"
           style="display:inline-block;background:#D06E85;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;">
          ${t.cta}
        </a>

        <p style="margin:28px 0 0;line-height:1.6;color:#5C4F53;">${t.signoff}</p>
        <p style="margin:20px 0 0;font-size:12px;color:#9B8A8F;">
          Mahmutlar Mah., Sahil Caddesi 165E, Alanya · +90 551 674 55 15
        </p>
      </div>
    `,
  });
}

export async function notifyAdminNewBooking(booking: {
  guestName: string;
  guestPhone: string;
  language: string;
}) {
  if (!ADMIN_EMAIL) return false;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `🎨 New Booking: ${safeSubject(booking.guestName)}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2D2327; margin-bottom: 16px;">New Booking Request</h2>
        <div style="background: #FAFAFA; border: 1px solid #F0E8EB; border-radius: 12px; padding: 20px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(booking.guestName)}</p>
          <p style="margin: 8px 0;"><strong>Phone:</strong> ${escapeHtml(booking.guestPhone)}</p>
          <p style="margin: 8px 0;"><strong>Language:</strong> ${escapeHtml(booking.language.toUpperCase())}</p>
        </div>
        <p style="color: #9B8A8F; font-size: 13px; margin-top: 16px;">
          Go to your admin dashboard to confirm or manage this booking.
        </p>
      </div>
    `,
  });
}

export async function notifyBookingStatusChange(booking: {
  guestName: string;
  guestPhone: string;
  status: string;
  language: string;
  email?: string;
}) {
  if (!booking.email) return false;

  const messages: Record<string, Record<string, { subject: string; body: string }>> = {
    confirmed: {
      en: { subject: "✅ Your booking is confirmed!", body: `Hi ${booking.guestName}, your art class booking has been confirmed! We'll contact you at ${booking.guestPhone} with details. See you at Make Art Studio!` },
      tr: { subject: "✅ Rezervasyonunuz onaylandı!", body: `Merhaba ${booking.guestName}, sanat dersi rezervasyonunuz onaylandı! ${booking.guestPhone} numarasından detaylar için sizinle iletişime geçeceğiz. Make Art Studio'da görüşürüz!` },
      ru: { subject: "✅ Ваше бронирование подтверждено!", body: `Здравствуйте, ${booking.guestName}! Ваше бронирование на урок искусства подтверждено. Мы свяжемся с вами по номеру ${booking.guestPhone}. Ждём вас в Make Art Studio!` },
    },
    cancelled: {
      en: { subject: "Booking cancelled", body: `Hi ${booking.guestName}, your booking has been cancelled. Feel free to book again anytime at makeartalanya.com.` },
      tr: { subject: "Rezervasyon iptal edildi", body: `Merhaba ${booking.guestName}, rezervasyonunuz iptal edildi. Dilediğiniz zaman makeartalanya.com'dan yeniden rezervasyon yapabilirsiniz.` },
      ru: { subject: "Бронирование отменено", body: `Здравствуйте, ${booking.guestName}. Ваше бронирование было отменено. Вы можете снова забронировать в любое время на makeartalanya.com.` },
    },
  };

  const lang = booking.language || "en";
  const msg = messages[booking.status]?.[lang] || messages[booking.status]?.en;
  if (!msg) return false;

  return sendEmail({
    to: booking.email,
    subject: msg.subject,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #DCA8B2; font-size: 20px; font-weight: 600;">Make Art Studio</h1>
        </div>
        <div style="background: #FAFAFA; border: 1px solid #F0E8EB; border-radius: 12px; padding: 20px;">
          <p style="color: #2D2327; line-height: 1.6;">${escapeHtml(msg.body)}</p>
        </div>
        <p style="color: #9B8A8F; font-size: 12px; margin-top: 16px; text-align: center;">
          Make Art Studio · Alanya, Turkey
        </p>
      </div>
    `,
  });
}
