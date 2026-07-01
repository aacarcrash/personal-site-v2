import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { SESSION_COOKIE, verifySession } from "@/lib/admin/auth";
import { isDevEnv, requirePassword } from "@/lib/admin/lockdown";

export const dynamic = "force-dynamic";

export default async function AuthedLayout({ children }: { children: ReactNode }) {
  if (!isDevEnv()) redirect("/");
  // On dev + loopback we auto-authenticate (no password). Set
  // ADMIN_REQUIRE_PASSWORD=1 in .env.local to require the login password.
  if (requirePassword()) {
    const c = await cookies();
    const token = c.get(SESSION_COOKIE)?.value;
    const valid = token ? await verifySession(token) : false;
    if (!valid) redirect("/admin/login");
  }
  return <>{children}</>;
}
