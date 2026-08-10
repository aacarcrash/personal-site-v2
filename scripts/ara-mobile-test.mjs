// Mobile interaction test for /ara: chip -> sheet -> toggle -> commit at iPhone size.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3123";
mkdirSync("ara-capture/mobile", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});

await page.goto(`${BASE}/ara`, { waitUntil: "networkidle" });
await page.screenshot({ path: "ara-capture/mobile/1-composer.png" });

await page.getByRole("button", { name: "Local parity" }).first().tap();
await page.waitForTimeout(900);
await page.screenshot({ path: "ara-capture/mobile/2-sheet.png" });

await page
  .locator('[aria-label="Routing for figma-local"] button', { hasText: "Device" })
  .tap();
await page.waitForTimeout(900);
await page.screenshot({ path: "ara-capture/mobile/3-toggled.png" });

await page.getByRole("button", { name: "Start session" }).tap();
await page.waitForTimeout(1200);
await page.screenshot({ path: "ara-capture/mobile/4-committed.png" });

await browser.close();
console.log("mobile test done");
