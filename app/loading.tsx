export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: "var(--text)",
        opacity: 0.6,
        zIndex: 1000,
        animation: "pageLoadBar 1s ease-in-out infinite",
      }}
      aria-hidden
    >
      <style>
        {`@keyframes pageLoadBar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }`}
      </style>
    </div>
  );
}
