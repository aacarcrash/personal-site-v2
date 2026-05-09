import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-4xl mb-2">Admin</h1>
        <p className="text-text-secondary text-sm mb-8 font-mono">
          Local-only · 127.0.0.1
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
