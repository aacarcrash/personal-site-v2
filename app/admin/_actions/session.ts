"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  isRateLimited,
  verifyPassword,
} from "@/lib/admin/auth";
import { assertLoopbackOnly } from "@/lib/admin/lockdown";
import { audit } from "@/lib/admin/audit";

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  await assertLoopbackOnly();

  if (isRateLimited()) {
    audit({ action: "login.rateLimited", ok: false });
    return { error: "Too many failed attempts. Wait a minute and try again." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter a password." };

  const ok = await verifyPassword(password);
  if (!ok) {
    audit({ action: "login.bad", ok: false });
    return { error: "Wrong password." };
  }

  const token = await createSessionToken();
  const c = await cookies();
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 8 * 60 * 60,
    secure: process.env.NODE_ENV !== "development",
  });
  audit({ action: "login.ok", ok: true });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await assertLoopbackOnly();
  const c = await cookies();
  c.delete(SESSION_COOKIE);
  audit({ action: "logout", ok: true });
  redirect("/admin/login");
}
