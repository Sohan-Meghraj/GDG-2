"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import type {
  Connection,
  IcebreakerResponse,
  UserProfile,
} from "@/lib/types";
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Lightbulb,
  TriangleAlert,
  Save,
} from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

function MatchScoreRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const start = performance.now();
    const duration = 1000;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const offset = circumference * (1 - displayed / 100);

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-indigo-500/30 to-pink-500/30 blur-3xl" />
      <svg
        className="h-48 w-48 -rotate-90"
        viewBox="0 0 160 160"
        aria-hidden
      >
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#match-grad)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 60ms linear" }}
        />
        <defs>
          <linearGradient id="match-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-5xl font-extrabold tabular-nums tracking-tight">
            {displayed}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
            Match score
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // ignore
        }
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

export default function ProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const { user, profile, loading: authLoading } = useAuth();

  const [peer, setPeer] = useState<UserProfile | null>(null);
  const [peerLoading, setPeerLoading] = useState(true);
  const [peerError, setPeerError] = useState<string | null>(null);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [result, setResult] = useState<IcebreakerResponse | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isSelf = user?.uid === id;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPeerLoading(true);
      setPeerError(null);
      try {
        const snap = await getDoc(doc(getFirebaseDb(), "users", id));
        if (cancelled) return;
        if (!snap.exists()) {
          setPeer(null);
        } else {
          setPeer(snap.data() as UserProfile);
        }
      } catch (err) {
        if (!cancelled)
          setPeerError(
            err instanceof Error ? err.message : "Failed to load profile."
          );
      } finally {
        if (!cancelled) setPeerLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check if connection already saved
  useEffect(() => {
    if (!user || !peer) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(
          doc(getFirebaseDb(), "connections", `${user.uid}_${peer.id}`)
        );
        if (!cancelled && snap.exists()) setSaved(true);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, peer]);

  const generate = async () => {
    if (!profile || !peer) return;
    setGenerating(true);
    setGenError(null);
    setResult(null);
    try {
      const res = await fetch("/api/icebreaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ me: profile, peer }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as IcebreakerResponse;
      setResult(data);
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : "Failed to generate icebreakers."
      );
    } finally {
      setGenerating(false);
    }
  };

  const saveConnection = async () => {
    if (!user || !peer || !result) return;
    setSaving(true);
    setSaveError(null);
    try {
      const data: Connection = {
        id: `${user.uid}_${peer.id}`,
        ownerId: user.uid,
        peerId: peer.id,
        peerSnapshot: {
          id: peer.id,
          name: peer.name,
          photoURL: peer.photoURL,
          headline: peer.headline,
          skills: peer.skills,
          interests: peer.interests,
        },
        matchScore: result.matchScore,
        matchReasons: result.matchReasons,
        icebreakers: result.icebreakers,
        createdAt: Date.now(),
      };
      await setDoc(
        doc(getFirebaseDb(), "connections", `${user.uid}_${peer.id}`),
        data
      );
      setSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Could not save connection."
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || peerLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (peerError) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
        <h1 className="mt-3 text-xl font-semibold">Couldn&apos;t load profile</h1>
        <p className="mt-1 text-sm text-white/60">{peerError}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-secondary mt-4"
        >
          Retry
        </button>
      </main>
    );
  }

  if (!peer) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Profile not found</h1>
        <p className="mt-1 text-sm text-white/60">
          This person hasn&apos;t set up their badge yet.
        </p>
        <Link href="/scan" className="btn btn-secondary mt-4">
          Scan another
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      {/* Peer card */}
      <div className="card">
        <div className="flex items-start gap-4">
          {peer.photoURL ? (
            <Image
              src={peer.photoURL}
              alt={peer.name}
              width={72}
              height={72}
              className="rounded-full border-2 border-white/20 object-cover"
              style={{ height: 72, width: 72 }}
              unoptimized
            />
          ) : (
            <div
              className="grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-2xl font-bold text-white"
              style={{ height: 72, width: 72 }}
            >
              {peer.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{peer.name}</h1>
            {peer.headline && (
              <p className="mt-0.5 text-sm text-white/70">{peer.headline}</p>
            )}
            {(peer.company || peer.college) && (
              <p className="mt-0.5 text-xs text-white/40">
                {peer.company || peer.college}
              </p>
            )}
            {peer.goal && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-200">
                <Sparkles className="h-3 w-3" />
                {peer.goal}
              </p>
            )}
          </div>
        </div>

        {peer.skills.length > 0 && (
          <div className="mt-5">
            <p className="mb-1.5 text-xs uppercase tracking-wider text-white/40">
              Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {peer.skills.map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {peer.interests.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs uppercase tracking-wider text-white/40">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {peer.interests.map((s) => (
                <span
                  key={s}
                  className="tag border-pink-500/20 bg-pink-500/10 text-pink-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate button */}
      {!result && !isSelf && (
        <div className="mt-6 text-center">
          <button
            onClick={generate}
            disabled={generating || !profile}
            className="btn btn-primary px-8 py-3 text-base shadow-xl shadow-indigo-500/30"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Icebreaker
              </>
            )}
          </button>
          {!profile && (
            <p className="mt-2 text-xs text-white/40">
              Set up your own badge first.
            </p>
          )}
          {genError && (
            <div className="mx-auto mt-3 max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              <p>{genError}</p>
              <button
                onClick={generate}
                className="mt-2 text-xs underline hover:text-red-200"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {isSelf && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-white/60">
          This is your own profile. Share the QR with others to get scanned.
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center">
            <MatchScoreRing score={result.matchScore} />
          </div>

          {result.matchReasons.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
                Why you should meet
              </h3>
              <ul className="mt-3 space-y-2">
                {result.matchReasons.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/85"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">
              Icebreakers
            </h3>
            <div className="space-y-3">
              {result.icebreakers.map((line, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-sm leading-relaxed text-white/90">
                    {line}
                  </p>
                  <CopyButton text={line} />
                </div>
              ))}
            </div>
          </div>

          {result.collabIdea && (
            <div className="rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-500/10 to-indigo-500/10 p-5">
              <div className="flex items-center gap-2 text-pink-200">
                <Lightbulb className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Collab idea
                </h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                {result.collabIdea}
              </p>
            </div>
          )}

          {result.whatToAvoid && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center gap-2 text-white/50">
                <TriangleAlert className="h-3.5 w-3.5" />
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  What to avoid
                </h3>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/60">
                {result.whatToAvoid}
              </p>
            </div>
          )}

          <div className="pt-2">
            {saved ? (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <span className="flex items-center gap-2 text-sm text-emerald-200">
                  <Check className="h-4 w-4" />
                  Saved to your connections
                </span>
                <Link
                  href="/connections"
                  className="text-xs text-emerald-200 underline hover:text-white"
                >
                  View Connections
                </Link>
              </div>
            ) : (
              <button
                onClick={saveConnection}
                disabled={saving}
                className="btn btn-primary w-full py-3"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Connection
                  </>
                )}
              </button>
            )}
            {saveError && (
              <p className="mt-2 text-center text-xs text-red-300">
                {saveError}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
