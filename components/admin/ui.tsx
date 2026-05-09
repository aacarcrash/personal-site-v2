"use client";

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="font-mono text-[11px] text-text-subtle">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "border border-border bg-surface px-3 py-2 font-mono text-sm focus:outline-none focus:border-text " +
        (props.className ?? "")
      }
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ fieldSizing: "content", ...(props.style ?? {}) } as React.CSSProperties}
      className={
        "border border-border bg-surface px-3 py-2 font-mono text-sm leading-relaxed focus:outline-none focus:border-text resize-y w-full min-h-[200px] " +
        (props.className ?? "")
      }
    />
  );
}

export function Button({
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }) {
  const base = "font-mono text-xs uppercase tracking-wider px-4 py-2 disabled:opacity-40 transition-opacity";
  const v =
    variant === "primary"
      ? "border hover:opacity-90"
      : variant === "danger"
      ? "bg-bg text-text border border-border hover:border-text"
      : "bg-bg text-text border border-border hover:border-text";
  const inlineStyle =
    variant === "primary"
      ? { background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }
      : undefined;
  return (
    <button
      {...props}
      style={{ ...inlineStyle, ...(props.style ?? {}) }}
      className={`${base} ${v} ${props.className ?? ""}`}
    />
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-text"
      />
      <span className="font-mono text-xs">{label}</span>
    </label>
  );
}

export function Banner({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  return (
    <div
      className={
        "border px-3 py-2 font-mono text-xs " +
        (tone === "error"
          ? "border-text text-text"
          : tone === "success"
          ? "border-border text-text-secondary"
          : "border-border text-text-secondary")
      }
    >
      {children}
    </div>
  );
}
