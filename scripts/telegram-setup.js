#!/usr/bin/env node
/**
 * Telegram webhook management + diagnostics.
 *
 *   node scripts/telegram-setup.js status
 *   node scripts/telegram-setup.js set https://makeartalanya.com
 *   node scripts/telegram-setup.js delete
 *
 * `set` registers /api/telegram/webhook with TELEGRAM_WEBHOOK_SECRET, which
 * Telegram then echoes on every delivery so the route can verify authenticity.
 *
 * Run `delete` before using scripts/telegram-poll.js locally: Telegram will not
 * serve getUpdates while a webhook is registered.
 */

const fs = require("fs");
const path = require("path");

function loadEnv() {
  const file = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, raw] = m;
    if (process.env[key]) continue;
    process.env[key] = raw.replace(/^["']|["']$/g, "").trim();
  }
}
loadEnv();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is not set in .env");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

async function call(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
}

async function status() {
  const me = await call("getMe");
  if (!me.ok) {
    console.error("✗ Bot token rejected:", me.description);
    process.exit(1);
  }
  console.log(`✓ Bot: @${me.result.username} (id ${me.result.id})`);

  const hook = await call("getWebhookInfo");
  const info = hook.result || {};
  if (info.url) {
    console.log(`✓ Webhook: ${info.url}`);
    console.log(`  pending updates: ${info.pending_update_count ?? 0}`);
    if (info.last_error_message) {
      console.log(`  ⚠ last error: ${info.last_error_message} (${info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : "?"})`);
    }
  } else {
    console.log("• Webhook: not set — the bot will not reply to messages in production.");
    console.log("  Locally you can run: node scripts/telegram-poll.js");
  }

  console.log(
    SECRET
      ? "✓ TELEGRAM_WEBHOOK_SECRET is set"
      : "✗ TELEGRAM_WEBHOOK_SECRET is NOT set — the webhook route will refuse every update",
  );
  console.log(
    process.env.TELEGRAM_LINK_CODE
      ? `✓ TELEGRAM_LINK_CODE is set — send "/link ${process.env.TELEGRAM_LINK_CODE}" to the bot`
      : "✗ TELEGRAM_LINK_CODE is NOT set — admins cannot register for alerts",
  );
}

async function set(baseUrl) {
  if (!baseUrl) {
    console.error("Usage: node scripts/telegram-setup.js set https://your-domain.com");
    process.exit(1);
  }
  if (!SECRET) {
    console.error("TELEGRAM_WEBHOOK_SECRET must be set before registering a webhook.");
    process.exit(1);
  }
  const url = `${baseUrl.replace(/\/$/, "")}/api/telegram/webhook`;

  // Telegram does not follow redirects. Registering the apex domain when the
  // deployment redirects to www leaves a webhook that looks correctly set and
  // silently fails every update with "Wrong response: 307". Catch it here
  // rather than in getWebhookInfo days later.
  try {
    const probe = await fetch(url, { method: "POST", redirect: "manual" });
    if (probe.status >= 300 && probe.status < 400) {
      const target = probe.headers.get("location");
      console.error(`✗ ${url} responds ${probe.status} and redirects to:\n    ${target}`);
      console.error("  Telegram does not follow redirects. Register that URL instead:");
      console.error(`    node scripts/telegram-setup.js set ${new URL(target).origin}`);
      process.exit(1);
    }
  } catch (err) {
    console.warn(`! Could not reach ${url} to check for redirects (${err.message}). Continuing.`);
  }

  const res = await call("setWebhook", {
    url,
    secret_token: SECRET,
    // callback_query is required for the inline buttons in the registration
    // flow. Omit it and every tap is silently dropped by Telegram.
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  if (!res.ok) {
    console.error("✗ setWebhook failed:", res.description);
    process.exit(1);
  }
  console.log(`✓ Webhook registered: ${url}`);
}

async function remove() {
  const res = await call("deleteWebhook", { drop_pending_updates: false });
  console.log(res.ok ? "✓ Webhook deleted — getUpdates/polling is available again" : `✗ ${res.description}`);
}

const [cmd, arg] = process.argv.slice(2);
(async () => {
  if (cmd === "set") return set(arg);
  if (cmd === "delete") return remove();
  return status();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
