// Beat 3 capture: the parity prototype flow, recorded as clean 1080p video.
// Usage: node scripts/ara-capture.mjs [baseUrl]  (default http://localhost:3123)
// Output: ara-capture/beat3-parity-*.webm
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3123";
const OUT = "ara-capture";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();

const pause = (ms) => page.waitForTimeout(ms);

// Human-feel cursor: glide to the element, then click.
async function glideClick(locator, ms = 450) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("no bounding box for locator");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: Math.max(12, Math.round(ms / 16)) });
  await pause(180);
  await page.mouse.down();
  await pause(70);
  await page.mouse.up();
}

const routeBtn = (group, label) =>
  page.locator(`[aria-label="Routing for ${group}"] button`, { hasText: label }).first();

await page.goto(`${BASE}/ara`, { waitUntil: "networkidle" });
await page.mouse.move(700, 600);
await pause(2200); // hold: the composer at rest, orange chip visible

await glideClick(page.getByRole("button", { name: "Set up local parity" }).first(), 600);
await pause(1600); // sheet enters, 92% visible

await glideClick(routeBtn("figma-local", "Device")); // 92 -> 100
await pause(1400);

await glideClick(routeBtn("chrome-devtools", "Skip")); // 100 -> 90
await pause(1200);

await glideClick(routeBtn("chrome-devtools", "Device")); // 90 -> 100
await pause(1400);

await glideClick(page.getByRole("button", { name: "Start session" }), 500);
await pause(2600); // chip morph + new placeholder, hold

await context.close(); // flushes the video
await browser.close();
console.log(`done — video in ${OUT}/`);
