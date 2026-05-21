/**
 * Email notification service using Strato SMTP (Nodemailer).
 * Requires SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment variables.
 */

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.strato.de";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL = process.env.FROM_EMAIL || `Make Art Studio <${SMTP_USER}>`;
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function createTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("[Email] SMTP credentials not set — skipping email send");
    return false;
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return true;
  } catch (err) {
    console.error("[Email] Error:", err);
    return false;
  }
}

export async function notifyAdminNewBooking(booking: {
  guestName: string;
  guestPhone: string;
  language: string;
}) {
  if (!ADMIN_EMAIL) return;

  await sendEmail({
    to: ADMIN_EMAIL,
    subject: `🎨 New Booking: ${booking.guestName}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2D2327; margin-bottom: 16px;">New Booking Request</h2>
        <div style="background: #FAFAFA; border: 1px solid #F0E8EB; border-radius: 12px; padding: 20px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${booking.guestName}</p>
          <p style="margin: 8px 0;"><strong>Phone:</strong> ${booking.guestPhone}</p>
          <p style="margin: 8px 0;"><strong>Language:</strong> ${booking.language.toUpperCase()}</p>
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
  if (!booking.email) return;

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
  if (!msg) return;

  await sendEmail({
    to: booking.email,
    subject: msg.subject,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #DCA8B2; font-size: 20px; font-weight: 600;">Make Art Studio</h1>
        </div>
        <div style="background: #FAFAFA; border: 1px solid #F0E8EB; border-radius: 12px; padding: 20px;">
          <p style="color: #2D2327; line-height: 1.6;">${msg.body}</p>
        </div>
        <p style="color: #9B8A8F; font-size: 12px; margin-top: 16px; text-align: center;">
          Make Art Studio · Alanya, Turkey
        </p>
      </div>
    `,
  });
}
