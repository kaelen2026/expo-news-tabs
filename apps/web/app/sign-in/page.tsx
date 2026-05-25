"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    const { error: signInError } = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message ?? "Sign in failed");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleSocial(provider: "google" | "github") {
    setError(null);
    await authClient.signIn.social({ provider, callbackURL: "/" });
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm opacity-70">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 bg-white/70 px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5"
          />
        </label>
        <label className="block">
          <span className="text-sm opacity-70">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-black/15 bg-white/70 px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocial("google")}
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15"
        >
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => handleSocial("github")}
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15"
        >
          Continue with GitHub
        </button>
      </div>

      <p className="mt-6 text-sm opacity-70">
        No account?{" "}
        <Link href="/sign-up" className="underline">
          Create one
        </Link>
      </p>
    </main>
  );
}
