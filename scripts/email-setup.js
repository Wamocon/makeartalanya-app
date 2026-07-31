/* eslint-disable no-console */
const { loadEnvConfig } = require("@next/env");
const nodemailer = require("nodemailer");

loadEnvConfig(process.cwd());

const command = process.argv[2] || "status";
const host = process.env.SMTP_HOST || "smtp.strato.de";
const port = Number.parseInt(process.env.SMTP_PORT || "465", 10);
const user = process.env.SMTP_USER || "";
const pass = process.env.SMTP_PASS || "";
const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || "";
const from = process.env.FROM_EMAIL || `Make Art Studio <${user}>`;

function transport() {
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    tls: { minVersion: "TLSv1.2" },
    auth: { user, pass },
  });
}

async function main() {
  console.log(`[Email] Host: ${host}:${port} (${port === 465 ? "implicit TLS" : "STARTTLS"})`);
  console.log(`[Email] SMTP user: ${user || "MISSING"}`);
  console.log(`[Email] Admin recipient: ${recipient || "MISSING"}`);
  console.log(`[Email] Password: ${pass ? `set (${pass.length} characters)` : "MISSING"}`);

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS must be configured before verification.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT is invalid.");
  }

  const smtp = transport();
  await smtp.verify();
  console.log("[Email] SMTP authentication: OK");

  if (command === "status") return;
  if (command !== "test") {
    throw new Error('Unknown command. Use "status" or "test".');
  }
  if (!recipient) {
    throw new Error("ADMIN_NOTIFICATION_EMAIL is required for a delivery test.");
  }

  const result = await smtp.sendMail({
    from,
    to: recipient,
    subject: "Make Art Studio — email service test",
    text: "Strato SMTP authentication and delivery were successfully triggered by Make Art Studio. No customer booking was created.",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #2D2327;">
        <h2 style="margin: 0 0 12px; color: #D06E85;">Email service is working</h2>
        <p style="line-height: 1.6;">Strato SMTP authentication and delivery were successfully triggered by Make Art Studio.</p>
        <p style="font-size: 12px; color: #7B6E72;">This is a configuration test; no customer booking was created.</p>
      </div>
    `,
  });
  console.log(`[Email] Test accepted by SMTP: ${result.messageId}`);
  console.log(`[Email] Check ${recipient} (including spam) for the test message.`);
}

main().catch((error) => {
  console.error(`[Email] FAILED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
