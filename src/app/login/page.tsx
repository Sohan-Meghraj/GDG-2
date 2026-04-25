"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Sparkles } from "lucide-react";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(profile ? "/badge" : "/onboarding");
    }
  }, [user, profile, loading, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password, name.trim());
      }
      // The useEffect above will redirect once `user`/`profile` resolve.
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    setError(null);
  };

  return (
    <main className="grid min-h-[80vh] place-items-center px-4 py-10">
      <div className="relative w-full max-w-md">
        {/* gradient border glow */}
        <div className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br from-indigo-500/40 via-fuchsia-500/30 to-pink-500/40 blur-sm" />
        <div className="relative rounded-3xl border border-white/10 bg-zinc-950/80 p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur">
          <div className="text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-xl shadow-indigo-500/30">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-white/60">
              {mode === "signin"
                ? "Sign in to access your badge and connections."
                : "It only takes a few seconds."}
            </p>
          </div>

          {/* Tabs */}
          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === "signin"
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30"
                  : "text-white/60 hover:text-white"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="btn btn-primary w-full py-3"
            >
              {submitting || loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "signin" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/40">
            By continuing you agree to be cool to other humans.
          </p>
        </div>
      </div>
    </main>
  );
}
