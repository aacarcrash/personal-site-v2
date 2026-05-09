"use client";

import { useActionState } from "react";
import { loginAction } from "../_actions/session";

type State = { error?: string };

async function action(_prev: State, formData: FormData): Promise<State> {
  return loginAction(formData);
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-xs uppercase tracking-wider text-text-muted">
        Password
      </label>
      <input
        autoFocus
        type="password"
        name="password"
        autoComplete="current-password"
        className="border border-border bg-surface px-3 py-2 font-mono text-sm focus:outline-none focus:border-text"
      />
      <button
        type="submit"
        disabled={pending}
        className="border px-3 py-2 font-mono text-sm uppercase tracking-wider hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }}
      >
        {pending ? "..." : "Enter"}
      </button>
      {state.error ? (
        <p className="text-sm font-mono text-text-secondary">{state.error}</p>
      ) : null}
    </form>
  );
}
