"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

/* Ara's own visual system, extracted from the live product (dark render):
   instrument-dark ground, monochrome surfaces, one orange signal. */
const C = {
  bg: "#0E0E0F",
  sidebar: "#121214",
  surface: "#17181A",
  surface2: "#1E1F22",
  border: "#232427",
  borderStrong: "#333539",
  text: "#ECEDEE",
  muted: "#9A9CA1",
  faint: "#6A6C72",
  accent: "#E8622C",
  accentDim: "rgba(232,98,44,0.12)",
  whiteDim: "rgba(236,237,238,0.08)",
};

const mono = "var(--font-geist-mono), var(--font-jetbrains-mono), ui-monospace, monospace";

type Route = "cloud" | "device" | "skip";

type Item = {
  id: string;
  group: "Skills" | "MCP servers" | "Secrets" | "Agent config";
  label: string;
  meta: string;
  weight: number;
  route: Route;
  allowed: Route[];
};

const INITIAL: Item[] = [
  { id: "skills", group: "Skills", label: "12 skills", meta: "~/.claude/skills", weight: 27, route: "cloud", allowed: ["cloud", "skip"] },
  { id: "config", group: "Agent config", label: "CLAUDE.md · settings.json", meta: "2 files", weight: 10, route: "cloud", allowed: ["cloud", "skip"] },
  { id: "github", group: "MCP servers", label: "github", meta: ".mcp.json", weight: 15, route: "cloud", allowed: ["cloud", "device", "skip"] },
  { id: "postgres", group: "MCP servers", label: "postgres-prod", meta: ".mcp.json", weight: 10, route: "cloud", allowed: ["cloud", "device", "skip"] },
  { id: "chrome", group: "MCP servers", label: "chrome-devtools", meta: "local-only binary", weight: 10, route: "device", allowed: ["device", "skip"] },
  { id: "figma", group: "MCP servers", label: "figma-local", meta: "local-only binary", weight: 8, route: "skip", allowed: ["device", "skip"] },
  { id: "secrets", group: "Secrets", label: "3 keys", meta: ".env.local — injected at runtime, never stored", weight: 20, route: "device", allowed: ["device", "skip"] },
];

const ROUTE_LABEL: Record<Route, string> = {
  cloud: "Cloud",
  device: "Via this device",
  skip: "Skip",
};

const SHORT_LABEL: Record<Route, string> = {
  cloud: "Cloud",
  device: "Device",
  skip: "Skip",
};

function parityOf(items: Item[]) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  const live = items.reduce((s, i) => s + (i.route === "skip" ? 0 : i.weight), 0);
  return Math.round((live / total) * 100);
}

/* Ara's six-petal flower mark, approximated */
function Flower({ size = 56, color = C.faint }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="32"
          cy="17"
          rx="8.5"
          ry="14"
          stroke={color}
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
          transform={`rotate(${deg} 32 32)`}
        />
      ))}
    </svg>
  );
}

/* One consistent 16px line-icon set, 1.4 stroke */
function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    newchat: (
      <>
        <path d="M8 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V8" />
        <path d="M12.3 1.7l2 2L9 9l-2.6.6L7 7z" />
      </>
    ),
    plugins: (
      <>
        <circle cx="8" cy="8" r="2.6" />
        <path d="M13.8 8A5.8 5.8 0 1 0 8 13.8h1.5" />
      </>
    ),
    automations: (
      <>
        <circle cx="8" cy="8" r="5.8" />
        <path d="M8 4.8V8l2.2 1.4" />
      </>
    ),
    sync: (
      <>
        <path d="M5 3.2v9.6M5 3.2 3.2 5M5 3.2 6.8 5" />
        <path d="M11 12.8V3.2M11 12.8 9.2 11M11 12.8 12.8 11" />
      </>
    ),
    less: <path d="M4.5 9.8 8 6.3l3.5 3.5" />,
    memory: (
      <>
        <circle cx="8" cy="8" r="5.8" />
        <circle cx="8" cy="8" r="1.6" />
      </>
    ),
    repos: (
      <>
        <circle cx="4.8" cy="3.6" r="1.5" />
        <circle cx="4.8" cy="12.4" r="1.5" />
        <circle cx="11.4" cy="5.4" r="1.5" />
        <path d="M4.8 5.1v5.8M11.4 6.9c0 2.8-6.6 2-6.6 4.3" />
      </>
    ),
    dashboard: <path d="M3 6.8 8 3l5 3.8v5.7a.7.7 0 0 1-.7.7H3.7a.7.7 0 0 1-.7-.7z" />,
    devices: (
      <>
        <rect x="2.2" y="3" width="11.6" height="7.6" rx="1" />
        <path d="M6 13.6h4M8 10.6v3" />
      </>
    ),
    models: (
      <>
        <path d="M2.4 5.2 8 2.4l5.6 2.8v5.6L8 13.6l-5.6-2.8z" />
        <path d="M2.4 5.2 8 8l5.6-2.8M8 8v5.6" />
      </>
    ),
    billing: (
      <>
        <rect x="2.2" y="3.8" width="11.6" height="8.4" rx="1" />
        <path d="M2.2 6.8h11.6" />
      </>
    ),
    members: (
      <>
        <circle cx="6" cy="5.8" r="2" />
        <path d="M2.4 13c0-2 1.6-3.6 3.6-3.6S9.6 11 9.6 13" />
        <path d="M10.8 8a1.9 1.9 0 1 0-.6-3.7M10.6 9.5c1.8.2 3 1.7 3 3.5" />
      </>
    ),
    developers: <path d="M6 5 3 8l3 3M10 5l3 3-3 3" />,
    folder: <path d="M2.2 4.4a1 1 0 0 1 1-1h3l1.4 1.6h5.2a1 1 0 0 1 1 1v5.6a1 1 0 0 1-1 1H3.2a1 1 0 0 1-1-1z" />,
    branch: (
      <>
        <circle cx="4.6" cy="3.8" r="1.4" />
        <circle cx="4.6" cy="12.2" r="1.4" />
        <circle cx="11.4" cy="5.6" r="1.4" />
        <path d="M4.6 5.2v5.6M11.4 7c0 2.6-6.8 1.8-6.8 4" />
      </>
    ),
    cloud: <path d="M4.6 12.2a2.8 2.8 0 0 1-.4-5.6 4 4 0 0 1 7.8 1 2.3 2.3 0 0 1-.5 4.6z" />,
    chev: <path d="M4.5 6.5 8 10l3.5-3.5" />,
    ring: <circle cx="8" cy="8" r="4.5" />,
    dot: <circle cx="8" cy="8" r="4.5" fill="currentColor" stroke="none" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}

const NAV_TOP = [
  { icon: "newchat", label: "New chat", active: true },
  { icon: "plugins", label: "Plugins" },
  { icon: "automations", label: "Automations" },
];

const NAV_MORE = [
  { icon: "memory", label: "Memory" },
  { icon: "repos", label: "Repositories" },
  { icon: "dashboard", label: "Dashboard" },
  { icon: "devices", label: "Devices" },
  { icon: "models", label: "Models & credentials" },
  { icon: "billing", label: "Billing" },
  { icon: "members", label: "Members" },
  { icon: "developers", label: "Developers" },
];

export default function AraPrototype() {
  const [items, setItems] = useState(INITIAL);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [committed, setCommitted] = useState(false);

  const parity = useMemo(() => parityOf(items), [items]);
  const deviceCount = items.filter((i) => i.route === "device" && i.group === "MCP servers").length;
  const skipped = items.filter((i) => i.route === "skip");

  const setRoute = (id: string, route: Route) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, route } : x)));

  const reset = () => {
    setItems(INITIAL);
    setCommitted(false);
    setSheetOpen(false);
  };

  return (
    <div
      className="flex min-h-screen w-full"
      style={{
        background: C.bg,
        color: C.text,
        fontFamily: "var(--font-inter), sans-serif",
        colorScheme: "dark",
      }}
    >
      {/* Route-scoped: paint the html/body dark so the scrollbar gutter can't show the site's light theme */}
      <style>{`html { background: ${C.bg} !important; color-scheme: dark; } body { background: ${C.bg} !important; }`}</style>
      {/* ——— Sidebar (matches live app) ——— */}
      <aside
        className="hidden w-[236px] shrink-0 flex-col border-r px-3 py-4 md:flex"
        style={{ borderColor: C.border, background: C.sidebar }}
      >
        <div className="mb-4 flex items-center gap-2 px-2">
          <Flower size={18} color={C.text} />
          <span className="truncate text-[13px] font-medium">as15037&apos;s Worksp…</span>
          <span className="ml-auto text-[12px]" style={{ color: C.faint }}>
            ⌄
          </span>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_TOP.map((n) => (
            <div
              key={n.label}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px]"
              style={{
                background: n.active ? C.surface2 : "transparent",
                color: n.active ? C.text : C.muted,
              }}
            >
              <span className="flex w-4 shrink-0 justify-center">
                <Icon name={n.icon} />
              </span>
              {n.label}
            </div>
          ))}

          {/* Our proposed entry point */}
          <div
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px]"
            style={{ color: C.text }}
          >
            <span className="flex w-4 shrink-0 justify-center" style={{ color: C.accent }}>
              <Icon name="sync" />
            </span>
            Local setup
            <span
              className="ml-auto rounded px-1.5 py-0.5 text-[9px] tracking-wider"
              style={{ color: C.accent, background: C.accentDim, fontFamily: mono }}
            >
              NEW
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2.5 px-2 py-1 text-[12px]" style={{ color: C.faint }}>
            <span className="flex w-4 shrink-0 justify-center">
              <Icon name="less" />
            </span>
            Less
          </div>

          {NAV_MORE.map((n) => (
            <div
              key={n.label}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px]"
              style={{ color: C.muted }}
            >
              <span className="flex w-4 shrink-0 justify-center">
                <Icon name={n.icon} />
              </span>
              {n.label}
            </div>
          ))}
        </nav>

        <div className="mt-6 px-2 text-[12px] font-medium" style={{ color: C.muted }}>
          Projects
        </div>
        <div className="mt-6 text-center text-[12px]" style={{ color: C.faint }}>
          No sessions yet.
        </div>

        <div className="mt-auto flex items-center gap-2 px-2 pt-4">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px]"
            style={{ background: C.surface2, color: C.muted }}
          >
            AS
          </span>
          <span className="text-[13px]">Aakarsh Singh</span>
          <span className="text-[11px]" style={{ color: C.faint }}>
            Organization
          </span>
        </div>
      </aside>

      {/* ——— Stage ——— */}
      <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-8">
        <div className="mb-7 select-none" aria-hidden>
          <Flower size={56} />
        </div>
        <h1 className="mb-12 text-[26px] font-medium tracking-tight">What should we build?</h1>

        <div className="w-full max-w-[700px]">
          {/* Context bar — sits behind/above the composer card, like the live app */}
          <div
            className="mx-2 flex items-center gap-3 whitespace-nowrap rounded-t-xl px-4 pb-7 pt-1 text-[13px] sm:mx-4 sm:gap-4 sm:pt-2"
            style={{ background: C.surface2, color: C.muted }}
          >
            <span className="flex items-center gap-1.5 py-2">
              <Icon name="folder" size={14} /> flok <Icon name="chev" size={11} />
            </span>
            <span className="hidden items-center gap-1.5 py-2 sm:flex">
              <Icon name="branch" size={14} /> Default branch
            </span>
            <span className="hidden items-center gap-1.5 py-2 sm:flex">
              <Icon name="cloud" size={14} /> Cloud <Icon name="chev" size={11} />
            </span>

            <div className="ml-auto">
              <AnimatePresence mode="wait" initial={false}>
                {!committed ? (
                  <motion.button
                    key="pending"
                    layoutId="setup-chip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ layout: { type: "spring", stiffness: 420, damping: 32 } }}
                    onClick={() => setSheetOpen(true)}
                    className="flex cursor-pointer items-center gap-1.5"
                    style={{ padding: "8px 0", fontSize: "13px", color: C.accent }}
                  >
                    <Icon name="ring" size={10} />
                    <span className="hidden sm:inline">Set up local parity</span>
                    <span className="sm:hidden">Local parity</span>
                  </motion.button>
                ) : (
                  <motion.button
                    key="parity"
                    layoutId="setup-chip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ layout: { type: "spring", stiffness: 420, damping: 32 } }}
                    onClick={() => setSheetOpen(true)}
                    className="flex cursor-pointer items-center gap-2"
                    style={{ padding: "8px 0", fontSize: "13px", color: C.text }}
                  >
                    <Icon name="dot" size={9} />
                    <span className="flex items-center" style={{ fontFamily: mono }}>
                      <Odometer value={parity} height={17} />
                      <span style={{ lineHeight: "17px" }}>% parity</span>
                    </span>
                    {deviceCount > 0 && (
                      <span style={{ color: C.faint }}>· {deviceCount} tools via your Mac</span>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Composer card — overlaps the context bar */}
          <div
            className="relative z-10 -mt-4 rounded-2xl border px-5 pb-4 pt-5"
            style={{
              background: C.surface,
              borderColor: C.border,
              boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
            }}
          >
            <div className="text-[15px]" style={{ color: C.faint }}>
              {committed
                ? "Do anything — your skills, secrets and MCP servers came with you"
                : "Do anything"}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span
                className="-m-2 flex h-11 w-11 items-center justify-center text-xl leading-none sm:h-9 sm:w-9"
                style={{ color: C.faint }}
              >
                +
              </span>
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full sm:h-9 sm:w-9"
                style={{ background: C.surface2, color: C.muted }}
              >
                ↑
              </span>
            </div>
          </div>

          {/* Model row — bottom right, like the live app */}
          <div
            className="mt-1 flex items-center justify-end gap-5 pr-1 text-[13px]"
            style={{ color: C.muted }}
          >
            <span className="flex items-center gap-2 py-2.5">
              <Flower size={14} color={C.muted} />
              5.6 Luna <Icon name="chev" size={11} />
            </span>
            <span className="flex items-center gap-2 py-2.5">
              High <Icon name="chev" size={11} />
            </span>
          </div>
        </div>

        {/* Demo footer */}
        <div className="mt-10 flex items-center gap-3 text-[12px]" style={{ color: C.muted }}>
          <button
            onClick={reset}
            className="cursor-pointer underline underline-offset-2"
            style={{ padding: "12px", fontSize: "12px" }}
          >
            reset demo
          </button>
        </div>
        <p className="mt-2 max-w-[600px] text-center text-[12px] leading-relaxed" style={{ color: C.muted }}>
          Working proposal for Ara&apos;s setup moment — not affiliated. Parity weights are
          guesses; I don&apos;t have Ara&apos;s telemetry. Interaction spec and the remaining
          surfaces are a conversation.{" "}
          <span className="whitespace-nowrap" style={{ color: C.muted }}>
            — Aakarsh Singh · aakarsh.dev
          </span>
        </p>
      </main>

      {/* ——— Setup sheet ——— */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)" }}
            />
            <motion.div
              key="sheet-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6"
            >
            <motion.div
              key="sheet"
              initial={{ y: 28, scale: 0.99 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.995 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-[760px] rounded-t-2xl border p-6 md:rounded-2xl"
              style={{ background: C.surface, borderColor: C.borderStrong }}
              role="dialog"
              aria-label="Bring your local setup"
            >
              <div className="mb-1 flex items-baseline justify-between">
                <h2 className="text-lg font-medium tracking-tight">Bring your local setup</h2>
                <ParityMeter value={parity} />
              </div>
              <p className="mb-1 text-[13px]" style={{ color: C.muted }}>
                Found via <span style={{ fontFamily: mono, color: C.text }}>ara sync</span> on this
                machine. Nothing leaves this device without a decision from you.
              </p>
              <p className="mb-5 text-[12px]" style={{ color: C.faint, maxWidth: "560px" }}>
                Cloud — copied into the workspace · Device — stays here, reached through your
                paired device · Skip — sessions run without it
              </p>

              <div className="flex flex-col gap-2">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.05 + idx * 0.045, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-4 rounded-xl border px-4 py-3"
                    style={{ borderColor: C.border, background: C.bg }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span
                          className="text-[10px] uppercase"
                          style={{ color: C.faint, fontFamily: mono, letterSpacing: "0.06em" }}
                        >
                          {item.group}
                        </span>
                        <span className="truncate text-[14px]" style={{ fontFamily: mono }}>
                          {item.label}
                        </span>
                      </div>
                      <div className="truncate text-[12px]" style={{ color: C.faint }}>
                        {item.meta}
                      </div>
                    </div>

                    <div
                      className="flex shrink-0 rounded-[8px]"
                      style={{ background: C.surface2, padding: "2px" }}
                      role="radiogroup"
                      aria-label={`Routing for ${item.label}`}
                    >
                      {item.allowed.map((r) => {
                        const active = item.route === r;
                        return (
                          <button
                            key={r}
                            role="radio"
                            aria-checked={active}
                            onClick={() => setRoute(item.id, r)}
                            className="relative cursor-pointer rounded-[6px] transition-colors"
                            style={{
                              padding: "3px 10px",
                              fontSize: "11px",
                              fontWeight: 400,
                              lineHeight: "15px",
                              color: active
                                ? r === "device"
                                  ? C.accent
                                  : C.text
                                : C.faint,
                            }}
                          >
                            {active && (
                              <motion.span
                                layoutId={`seg-${item.id}`}
                                className="absolute inset-0 rounded-[6px]"
                                style={{
                                  background: r === "device" ? "rgba(232,98,44,0.13)" : "#2C2E32",
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                              />
                            )}
                            <span className="relative">{SHORT_LABEL[r]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-[12px]" style={{ color: C.faint }}>
                  {skipped.length === 0
                    ? "Full parity — the agent works exactly like your machine."
                    : `Skipping ${skipped.map((s) => s.label).join(", ")} — sessions run without ${skipped.length === 1 ? "it" : "them"}.`}
                </span>
                <button
                  onClick={() => {
                    setCommitted(true);
                    setSheetOpen(false);
                  }}
                  className="cursor-pointer rounded-[10px] font-medium transition-transform active:scale-[0.98]"
                  style={{
                    padding: "8px 16px",
                    fontSize: "13px",
                    background: C.text,
                    color: C.bg,
                  }}
                >
                  Start session
                </button>
              </div>
            </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Odometer digit: a 0-9 column that rolls to the current digit */
function Digit({ value, height }: { value: number; height: number }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        height,
        width: "0.62em",
        overflow: "hidden",
      }}
    >
      <motion.span
        animate={{ y: -value * height }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
          willChange: "transform",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <span key={d} style={{ height, lineHeight: `${height}px`, textAlign: "center" }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ value, height = 18 }: { value: number; height?: number }) {
  const digits = String(value).split("").map(Number);
  return (
    <span style={{ display: "inline-flex", height, alignItems: "center" }}>
      <AnimatePresence initial={false}>
        {digits.map((d, i) => (
          <motion.span
            key={digits.length - i}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ display: "inline-flex", overflow: "hidden", willChange: "width" }}
          >
            <Digit value={d} height={height} />
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

function ParityMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-28 overflow-hidden rounded-full" style={{ background: C.surface2 }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: C.text }}
          animate={{ width: `${value}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        />
      </div>
      <span
        className="flex items-center text-[15px] font-medium tabular-nums"
        style={{ fontFamily: mono }}
      >
        <Odometer value={value} height={19} />
        <span style={{ lineHeight: "19px" }}>%</span>
      </span>
    </div>
  );
}
