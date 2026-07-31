/**
 * Signed admin session tokens.
 *
 * The legacy scheme stored `base64(username:timestamp)` with no signature, so
 * anyone who guessed the username could mint their own cookie and walk into
 * /admin. `httpOnly` prevented reading the cookie from JS but did nothing to
 * stop an attacker *sending* a forged one.
 *
 * Tokens are now `base64url(payload).base64url(hmac)` where the HMAC-SHA256 is
 * taken over the payload with ADMIN_SESSION_SECRET. Built on Web Crypto so the
 * same code runs in the proxy (Edge) and in Node route handlers.
 */

const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET?.trim() || null;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const bin = atob(input.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(payload: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload));
  return b64urlEncode(new Uint8Array(sig));
}

/** Length-independent constant-time comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Mints a signed token for `username`. Returns null if no secret is set. */
export async function signAdminSession(username: string): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const payload = b64urlEncode(new TextEncoder().encode(`${username}:${Date.now()}`));
  return `${payload}.${await hmac(payload, key)}`;
}

/**
 * Verifies signature and age. Returns the username, or null when the token is
 * malformed, forged, expired, or the secret is unset.
 *
 * Deliberately does NOT compare against ADMIN_DASHBOARD_USER — the signature
 * already proves this server issued it. Callers that care about identity can
 * check the returned username.
 */
export async function verifyAdminSession(
  token: string | undefined | null,
): Promise<{ username: string; issuedAt: number } | null> {
  const key = secret();
  if (!key || !token) return null;

  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return null;

  const payload = token.slice(0, dot);
  const provided = token.slice(dot + 1);

  let expected: string;
  try {
    expected = await hmac(payload, key);
  } catch {
    return null;
  }
  if (!timingSafeEqual(provided, expected)) return null;

  let decoded: string;
  try {
    decoded = new TextDecoder().decode(b64urlDecode(payload));
  } catch {
    return null;
  }

  const sep = decoded.lastIndexOf(":");
  if (sep <= 0) return null;

  const username = decoded.slice(0, sep);
  const issuedAt = Number(decoded.slice(sep + 1));
  if (!username || !Number.isFinite(issuedAt)) return null;

  const age = Date.now() - issuedAt;
  if (age < 0 || age > MAX_AGE_MS) return null;

  return { username, issuedAt };
}

export const ADMIN_SESSION_MAX_AGE_MS = MAX_AGE_MS;
