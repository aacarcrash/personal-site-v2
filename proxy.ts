// Layer 1 (404 in production) + Layer 2 (loopback-only in development)
// for the admin panel. Server actions also re-check via assertAdminAccess,
// but this rejects requests early so non-loopback traffic never reaches
// admin code paths.

import { NextResponse, type NextRequest } from "next/server";

const ADMIN_PREFIXES = ["/admin", "/api/admin"];

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "::1", "localhost"]);

function bareHost(host: string | null): string | null {
  if (!host) return null;
  return host.replace(/^\[|\]$/g, "").split(":")[0];
}

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isAdmin = ADMIN_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  if (!isAdmin) return NextResponse.next();

  // Layer 1: production builds never serve /admin.
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse(null, { status: 404 });
  }

  // Layer 2: loopback-only.
  const host = bareHost(req.headers.get("host"));
  const xff = req.headers.get("x-forwarded-for");
  const xffFirst = xff ? xff.split(",")[0]?.trim() : null;

  if (host && !LOOPBACK_HOSTS.has(host)) {
    return new NextResponse(null, { status: 404 });
  }
  if (xffFirst && !LOOPBACK_HOSTS.has(xffFirst)) {
    return new NextResponse(null, { status: 404 });
  }

  // Defense in depth: noindex header (also set globally in next.config.ts).
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
