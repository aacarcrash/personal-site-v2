import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

/* Ara's palette, same tokens as the prototype */
const C = {
  bg: "#0E0E0F",
  text: "#ECEDEE",
  muted: "#9A9CA1",
  faint: "#6A6C72",
  accent: "#E8622C",
  border: "#232427",
};

export const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

/* ——— timeline ———
   Beat 1: real-run timelapse stills   0.0 – 14.0
   Beat 2: the crack (setup pending)  14.0 – 21.0
   Beat 3: the proposal (webm)        21.0 – 41.5
   Outro                              41.5 – 45.0                       */
const B1_LEN = s(14);
const B2_LEN = s(7);
const B3_LEN = s(15.7); // matches the 472-frame capture
const OUTRO_LEN = s(3.5);
export const PITCH_DURATION = B1_LEN + B2_LEN + B3_LEN + OUTRO_LEN;

/* Beat 1 stills: drop real captures into public/beat1/ as 01.png, 02.png, ...
   HOLD_SEC controls the timelapse pace. */
const BEAT1_STILLS = ["01.png", "02.png", "03.png", "04.png", "05.png"];
const B1_HOLD = B1_LEN / BEAT1_STILLS.length;

const mono = "'Geist Mono', 'JetBrains Mono', ui-monospace, monospace";
const ui = "Inter, ui-sans-serif, system-ui, sans-serif";

/* Caption card, Ara register: mono eyebrow + one quiet sentence */
const Caption: React.FC<{ eyebrow: string; line: string; appearAt?: number }> = ({
  eyebrow,
  line,
  appearAt = 0,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame - appearAt, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        bottom: 64,
        maxWidth: 900,
        opacity: t,
        transform: `translateY(${(1 - t) * 14}px)`,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 20,
          letterSpacing: "0.08em",
          color: C.accent,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontFamily: ui, fontSize: 40, lineHeight: 1.25, color: C.text, fontWeight: 500 }}>
        {line}
      </div>
    </div>
  );
};

/* Slow push-in wrapper for stills */
const KenBurns: React.FC<{ src: string; from?: number; to?: number }> = ({
  src,
  from = 1.0,
  to = 1.045,
}) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, s(B1_HOLD / FPS) * FPS], [from, to], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }}
      />
    </AbsoluteFill>
  );
};

/* Beat 3 punch-ins: gentle zooms timed to the recording's own beats
   (chip click ~2.4s, digit rolls ~6.5-13s, morph ~17.5s into the clip) */
const beat3Scale = (frame: number) => {
  const sec = frame / FPS;
  const zones: Array<[number, number, number]> = [
    // [start, end, scale]
    [2.0, 5.2, 1.35],
    [6.2, 13.6, 1.5],
    [16.8, 20.0, 1.4],
  ];
  for (const [a, b, z] of zones) {
    if (sec >= a && sec <= b) {
      const inT = interpolate(sec, [a, a + 0.5], [1, z], { extrapolateRight: "clamp" });
      const outT = interpolate(sec, [b - 0.5, b], [z, 1], { extrapolateLeft: "clamp" });
      return Math.min(inT, outT);
    }
  }
  return 1;
};

/* Focus origins per zone: chip (top right), meter (top right of sheet), chip again */
const beat3Origin = (frame: number) => {
  const sec = frame / FPS;
  if (sec < 5.6) return "72% 38%";
  if (sec < 14.5) return "66% 24%";
  return "68% 42%";
};

export const Pitch: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Beat 1 — the real run, timelapse */}
      <Sequence from={0} durationInFrames={B1_LEN}>
        {BEAT1_STILLS.map((f, i) => (
          <Sequence key={f} from={Math.round(i * B1_HOLD)} durationInFrames={Math.ceil(B1_HOLD)}>
            <KenBurns src={staticFile(`beat1/${f}`)} />
          </Sequence>
        ))}
        <Caption
          eyebrow="ara, for real"
          line="Asked it to find a real bug in my repo. It fixed a shutdown race condition, wrote the regression test, opened the PR."
          appearAt={s(0.6)}
        />
      </Sequence>

      {/* Beat 2 — the crack */}
      <Sequence from={B1_LEN} durationInFrames={B2_LEN}>
        <KenBurns src={staticFile("beat2/setup-pending.png")} from={1.15} to={1.32} />
        <Caption
          eyebrow="but"
          line='That same run? The composer still said "Setup pending." The trust surface doesn&apos;t know what&apos;s true.'
          appearAt={s(0.4)}
        />
      </Sequence>

      {/* Beat 3 — the proposal, recorded prototype with punch-ins */}
      <Sequence from={B1_LEN + B2_LEN} durationInFrames={B3_LEN}>
        <Beat3 />
      </Sequence>

      {/* Outro */}
      <Sequence from={B1_LEN + B2_LEN + B3_LEN} durationInFrames={OUTRO_LEN}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};

const B3_FRAMES = 472; // beat3seq/0001.jpg .. 0472.jpg @ 30fps

const Beat3: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(frame + 1, B3_FRAMES);
  const name = String(idx).padStart(4, "0");
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`beat3seq/${name}.jpg`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${beat3Scale(frame)})`,
          transformOrigin: beat3Origin(frame),
        }}
      />
      <Caption
        eyebrow="a proposal — cloud parity"
        line="Setup as a number, not a warning. Skills sync, secrets stay local, tools route through your device."
        appearAt={s(0.5)}
      />
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", background: C.bg, opacity: t }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: ui, fontSize: 56, fontWeight: 600, color: C.text }}>
          aakarsh.dev/ara
        </div>
        <div style={{ fontFamily: mono, fontSize: 22, color: C.faint, marginTop: 18 }}>
          working prototype · interaction spec is a conversation
        </div>
      </div>
    </AbsoluteFill>
  );
};
