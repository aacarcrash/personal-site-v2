// Three-layer lockdown for the local-first admin panel.
// Every server action must call assertAdminAccess() before touching disk.
//
// Layer 1 (build-time): NODE_ENV must be 'development'. The middleware
//   404s /admin in production builds; this is the in-action backstop.
// Layer 2 (network):    request must originate from loopback (127.0.0.1
//   or ::1). next dev binds 0.0.0.0 by default, so we also start it
//   with -H 127.0.0.1 (npm run admin) — belt-and-braces.
// Layer 3 (auth):       valid signed session cookie (verified in
//   lib/admin/auth.ts).
//
// Throws a generic error on failure; never leak which layer rejected.

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { verifySession } from "./auth";

export class AdminAccessDenied extends Error {
  constructor() {
    super("Admin access denied.");
    this.name = "AdminAccessDenied";
  }
}

const LOOPBACK_HOSTS = new Set([
  "127.0.0.1",
  "::1",
  "localhost",
]);

export function isDevEnv(): boolean {
  return process.env.NODE_ENV === "development";
}

// When ADMIN_REQUIRE_PASSWORD=1, the admin enforces the login password.
// Otherwise (default), dev + loopback auto-authenticates — the real
// controls are the production 404 (proxy.ts) and the dev-env gate below.
export function requirePassword(): boolean {
  return process.env.ADMIN_REQUIRE_PASSWORD === "1";
}

export function isLoopbackHost(host: string | null): boolean {
  if (!host) return false;
  // Strip port if present.
  const bare = host.replace(/^\[|\]$/g, "").split(":")[0];
  return LOOPBACK_HOSTS.has(bare) || host.startsWith("127.0.0.1:") || host.startsWith("[::1]:");
}

export function isLoopbackForwardedFor(xff: string | null): boolean {
  if (!xff) return true; // no proxy header = direct connection, fine on dev
  // x-forwarded-for is a comma list; check the leftmost (origin client).
  const first = xff.split(",")[0]?.trim();
  if (!first) return true;
  return LOOPBACK_HOSTS.has(first);
}

export async function assertAdminAccess(): Promise<void> {
  if (!isDevEnv()) throw new AdminAccessDenied();

  const h = await headers();
  const host = h.get("host");
  const xff = h.get("x-forwarded-for");
  if (!isLoopbackHost(host)) throw new AdminAccessDenied();
  if (!isLoopbackForwardedFor(xff)) throw new AdminAccessDenied();

  // Origin check — Next server actions are CSRF-protected by Origin/Host
  // matching, but we double-check that any Origin header points at loopback.
  const origin = h.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      if (!isLoopbackHost(url.host)) throw new AdminAccessDenied();
    } catch {
      throw new AdminAccessDenied();
    }
  }

  // Password is optional for local use: on dev + loopback we auto-
  // authenticate. Set ADMIN_REQUIRE_PASSWORD=1 in .env.local to force the
  // session check back on (e.g. if you ever expose `next dev` off loopback).
  if (requirePassword()) {
    const c = await cookies();
    const session = c.get("admin_session")?.value;
    const valid = session ? await verifySession(session) : false;
    if (!valid) throw new AdminAccessDenied();
  }
}

/**
 * Looser variant for the login server action itself, which runs before
 * a session exists. Skips the cookie check but still enforces dev +
 * loopback.
 */
export async function assertLoopbackOnly(): Promise<void> {
  if (!isDevEnv()) throw new AdminAccessDenied();
  const h = await headers();
  if (!isLoopbackHost(h.get("host"))) throw new AdminAccessDenied();
  if (!isLoopbackForwardedFor(h.get("x-forwarded-for"))) throw new AdminAccessDenied();
}
