#!/usr/bin/env node
/**
 * Local Telegram bridge — lets you talk to the bot before anything is deployed.
 *
 *   npm run dev                       # in one terminal
 *   node scripts/telegram-setup.js delete
 *   node scripts/telegram-poll.js     # in another  (add --port 3001 if needed)
 *
 * Telegram cannot reach localhost, so in production it pushes updates to the
 * webhook. Here we pull them with getUpdates and POST each one into the very
 * same /api/telegram/webhook route, secret header and all. That means what you
 * test locally is the identical code path that will run on Vercel — not a
 * parallel implementation that can drift.
 *
 * Telegram refuses getUpdates while a webhook is registered, hence the
 * `telegram-setup.js delete` step above.
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
if (!SECRET) {
  console.error("TELEGRAM_WEBHOOK_SECRET is not set in .env — the webhook route would reject every update.");
  process.exit(1);
}

const argv = process.argv.slice(2);
const portArg = argv.indexOf("--port");
const PORT = portArg !== -1 ? argv[portArg + 1] : "3000";
const TARGET = `http://localhost:${PORT}/api/telegram/webhook`;
const API = `https://api.telegram.org/bot${TOKEN}`;

let offset = 0;
let stopping = false;

async function preflight() {
  const me = await fetch(`${API}/getMe`).then((r) => r.json());
  if (!me.ok) {
    console.error("✗ Bot token rejected:", me.description);
    process.exit(1);
  }

  const hook = await fetch(`${API}/getWebhookInfo`).then((r) => r.json());
  if (hook.result?.url) {
    console.error(
      `✗ A webhook is registered (${hook.result.url}). Telegram will not serve getUpdates.\n` +
        "  Run: node scripts/telegram-setup.js delete",
    );
    process.exit(1);
  }

  // Probe WITH the secret — the route is supposed to answer 401 without it, so
  // omitting it here would just prove the guard works and abort every time.
  try {
    const res = await fetch(TARGET, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": SECRET,
      },
      body: "{}",
    });
    if (res.status === 401) {
      console.error(
        `✗ ${TARGET} rejected the secret.\n` +
          "  The server loaded a different TELEGRAM_WEBHOOK_SECRET than .env has — restart `npm run dev` after editing .env.",
      );
      process.exit(1);
    }
    if (!res.ok) {
      console.error(`✗ ${TARGET} answered ${res.status}.`);
      process.exit(1);
    }
  } catch {
    console.error(`✗ Cannot reach ${TARGET}. Is "npm run dev" running? Use --port if it picked another port.`);
    process.exit(1);
  }

  console.log(`✓ Bot @${me.result.username} ready`);
  console.log(`✓ Forwarding updates to ${TARGET}`);
  console.log(`\nOpen Telegram, find @${me.result.username}, and send it a message.`);
  console.log(`To receive studio alerts here, send:  /link ${process.env.TELEGRAM_LINK_CODE || "<TELEGRAM_LINK_CODE not set>"}`);
  console.log("\nWaiting for messages… (Ctrl+C to stop)\n");
}

async function loop() {
  while (!stopping) {
    let data;
    try {
      const res = await fetch(
        `${API}/getUpdates?timeout=25&offset=${offset}&allowed_updates=${encodeURIComponent('["message","callback_query"]')}`,
      );
      data = await res.json();
    } catch (err) {
      if (!stopping) console.error("poll error:", err.message);
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    if (!data.ok) {
      console.error("getUpdates failed:", data.description);
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }

    for (const update of data.result) {
      offset = update.update_id + 1;
      const cb = update.callback_query;
      const msg = update.message ?? cb?.message;
      const from = update.message?.from ?? cb?.from;
      const who = from?.username ? `@${from.username}` : from?.first_name || "?";
      const what = cb ? `[button] ${cb.data}` : (msg?.text ?? "<non-text>");
      console.log(`← ${who} (chat ${msg?.chat?.id}): ${what}`);

      try {
        const res = await fetch(TARGET, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Bot-Api-Secret-Token": SECRET,
          },
          body: JSON.stringify(update),
        });
        console.log(`→ handled (${res.status})`);
      } catch (err) {
        console.error("→ forward failed:", err.message);
      }
    }
  }
}

process.on("SIGINT", () => {
  stopping = true;
  console.log("\nstopped.");
  process.exit(0);
});

preflight().then(loop);
