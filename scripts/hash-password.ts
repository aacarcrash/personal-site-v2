/**
 * One-shot helper. Pass a password, get a bcrypt hash + a 64-byte
 * AUTH_SECRET to drop into .env.local.
 *
 *   npm run admin:hash -- 'your-long-random-password'
 *
 * If you don't pass an argument, generates a 32-char password for you.
 */
import { hashPassword } from "../lib/admin/auth";
import { randomBytes } from "node:crypto";

async function main() {
  let password = process.argv[2];
  let generated = false;
  if (!password) {
    password = randomBytes(24).toString("base64url"); // ~32 chars
    generated = true;
  }
  const hash = await hashPassword(password);
  const secret = randomBytes(48).toString("base64url");

  console.log("");
  if (generated) {
    console.log("Generated password (save it in your password manager):");
    console.log("  " + password);
    console.log("");
  }
  console.log("Add these lines to .env.local (gitignored):");
  console.log("");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`AUTH_SECRET=${secret}`);
  console.log("");
}

main();
