"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import {
  Loader2,
  IdCard,
  ScanLine,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, profile, loading, signInGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user && !profile) {
      router.replace("/onboarding");
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || !profile) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(
            collection(getFirebaseDb(), "connections"),
            where("ownerId", "==", user.uid)
          )
        );
        if (!cancelled) setConnectionsCount(snap.size);
      } catch {
        if (!cancelled) setConnectionsCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, profile]);

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (user && profile) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest text-white/40">
            Welcome back
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight md:text-5xl">
            Hey {profile.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-white/60">
            Ready to make some real connections?
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/badge"
            className="card group transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
              <IdCard className="h-6 w-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your QR Badge</h3>
              <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <p className="mt-1 text-sm text-white/60">
              Show this to anyone you meet.
            </p>
          </Link>
          <Link
            href="/scan"
            className="card group transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
              <ScanLine className="h-6 w-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Scan Someone</h3>
              <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <p className="mt-1 text-sm text-white/60">
              Point at a badge — AI handles the rest.
            </p>
          </Link>
          <Link
            href="/connections"
            className="card group transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
          >
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Connections</h3>
              <ArrowRight className="h-4 w-4 text-white/40 transition group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <p className="mt-1 text-sm text-white/60">
              {connectionsCount === null
                ? "Loading..."
                : connectionsCount === 0
                ? "No connections yet."
                : `${connectionsCount} ${connectionsCount === 1 ? "person" : "people"} so far.`}
            </p>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-32 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
        <div
          className="absolute right-1/4 top-64 h-[400px] w-[400px] rounded-full bg-pink-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          AI-powered networking that respects your time
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Networking that
          </span>
          <br />
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
            actually works.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 md:text-xl">
          Scan a badge. Get instant AI icebreakers. Walk away with real
          connections, not awkward small talk.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            onClick={async () => {
              setSigningIn(true);
              try {
                await signInGoogle();
              } finally {
                setSigningIn(false);
              }
            }}
            disabled={signingIn}
            className="btn btn-primary px-8 py-3 text-base shadow-xl shadow-indigo-500/30"
          >
            {signingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.84 0 3.06.78 3.76 1.45l2.56-2.46C16.78 3.99 14.66 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.65 8.65-8.79 0-.59-.06-1.04-.15-1.51z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </button>
          <p className="text-xs text-white/40">
            Free for events. No spam, ever.
          </p>
        </div>

        <div className="relative mx-auto mt-20 max-w-3xl">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/30 to-pink-500/30 blur-3xl" />
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-2 shadow-2xl backdrop-blur-xl">
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0d0d14]">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-3 text-xs text-white/30">
                  eventconnect.app/profile/...
                </span>
              </div>
              <div className="grid gap-6 p-8 md:grid-cols-[1fr_auto]">
                <div className="text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400" />
                    <div>
                      <h4 className="font-semibold">Alex Chen</h4>
                      <p className="text-sm text-white/50">
                        Flutter dev exploring AI agents
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Flutter", "AI", "Hackathons", "Design"].map((s) => (
                      <span key={s} className="tag">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4">
                    <p className="text-xs uppercase tracking-wider text-indigo-300">
                      Icebreaker
                    </p>
                    <p className="mt-1 text-sm text-white/80">
                      &ldquo;Saw your work on AI agents — have you tried
                      building one in Flutter yet? I just shipped a multi-agent
                      demo.&rdquo;
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <svg
                      className="h-32 w-32 -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="url(#demo-grad)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.92)}`}
                      />
                      <defs>
                        <linearGradient
                          id="demo-grad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold">92</div>
                        <div className="text-[10px] uppercase tracking-wider text-white/50">
                          match
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
