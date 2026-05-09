// Password verify + signed session cookie for the admin panel.
// HMAC-SHA256 over a JSON payload using AUTH_SECRET; no JWT lib needed.
// In-memory rate limiter (single-process dev only — fine for laptop use).

import bcrypt from "bcryptjs";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_LOCKOUT_MS = 60 * 1000;

export const SESSION_COOKIE = "admin_session";

type Attempt = { at: number; ok: boolean };
const attempts: Attempt[] = [];
let lockedUntil = 0;

function pruneAttempts(now: number) {
  while (attempts.length && now - attempts[0].at > RATE_LIMIT_WINDOW_MS) {
    attempts.shift();
  }
}

export function getRateLimitState(): { lockedUntil: number; recentFails: number } {
  const now = Date.now();
  pruneAttempts(now);
  const recentFails = attempts.filter((a) => !a.ok).length;
  return { lockedUntil, recentFails };
}

export function isRateLimited(): boolean {
  return Date.now() < lockedUntil;
}

function recordAttempt(ok: boolean) {
  const now = Date.now();
  pruneAttempts(now);
  attempts.push({ at: now, ok });
  if (!ok) {
    const fails = attempts.filter((a) => !a.ok).length;
    if (fails >= RATE_LIMIT_MAX_ATTEMPTS) {
      lockedUntil = now + RATE_LIMIT_LOCKOUT_MS;
    }
  } else {
    // Successful login clears the slate.
    attempts.length = 0;
    lockedUntil = 0;
  }
}

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET missing or too short (need ≥32 chars).");
  }
  return s;
}

function getPasswordHash(): string {
  const h = process.env.ADMIN_PASSWORD_HASH;
  if (!h) throw new Error("ADMIN_PASSWORD_HASH not set.");
  return h;
}

// ----- HMAC helpers (Web Crypto, available in Node 20+ + edge) -----

const enc = new TextEncoder();

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return base64url(new Uint8Array(sig));
}

function base64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeStr(s: string): string {
  return base64url(enc.encode(s));
}

function base64urlDecodeStr(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const decoded = atob(padded + pad);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Constant-time string compare.
function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// ----- Public API -----

export async function verifyPassword(password: string): Promise<boolean> {
  if (isRateLimited()) {
    recordAttempt(false);
    return false;
  }
  let ok = false;
  try {
    ok = await bcrypt.compare(password, getPasswordHash());
  } catch {
    ok = false;
  }
  recordAttempt(ok);
  return ok;
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ iat: Date.now(), exp: Date.now() + SESSION_TTL_MS });
  const body = base64urlEncodeStr(payload);
  const sig = await hmac(getSecret(), body);
  return `${body}.${sig}`;
}

export async function verifySession(token: string): Promise<boolean> {
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const expected = await hmac(getSecret(), body);
    if (!safeEq(sig, expected)) return false;
    const payload = JSON.parse(base64urlDecodeStr(body)) as { iat: number; exp: number };
    return Date.now() < payload.exp;
  } catch {
    return false;
  }
}

// ----- One-shot helpers used by scripts -----

export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, 12);
}
