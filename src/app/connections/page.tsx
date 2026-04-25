"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseDb } from "@/lib/firebase";
import type { Connection } from "@/lib/types";
import { Loader2, Users, Sparkles, ScanLine } from "lucide-react";

export default function ConnectionsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, router]);

  const load = async () => {
    if (!user) return;
    setError(null);
    try {
      const snap = await getDocs(
        query(
          collection(getFirebaseDb(), "connections"),
          where("ownerId", "==", user.uid)
        )
      );
      const list = snap.docs.map((d) => d.data() as Connection);
      list.sort((a, b) => b.createdAt - a.createdAt);
      setConnections(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load connections."
      );
      setConnections([]);
    }
  };

  useEffect(() => {
    if (!user || !profile) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  if (loading || !user || !profile) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Your connections
          </h1>
          <p className="mt-1 text-sm text-white/60">
            People you&apos;ve met at events.
          </p>
        </div>
        {connections && connections.length > 0 && (
          <Link href="/follow-up" className="btn btn-secondary">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Generate Follow-ups</span>
            <span className="sm:hidden">Follow-ups</span>
          </Link>
        )}
      </div>

      {connections === null ? (
        <div className="grid min-h-[40vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <p>{error}</p>
          <button onClick={load} className="btn btn-secondary mt-3">
            Retry
          </button>
        </div>
      ) : connections.length === 0 ? (
        <div className="card text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/5">
            <Users className="h-6 w-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold">No connections yet</h3>
          <p className="mt-1 text-sm text-white/60">
            Scan someone&apos;s badge to start.
          </p>
          <Link href="/scan" className="btn btn-primary mt-4">
            <ScanLine className="h-4 w-4" />
            Scan a badge
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((c) => (
            <Link
              key={c.id}
              href={`/profile/${c.peerId}`}
              className="card group transition hover:border-indigo-400/40 hover:bg-white/[0.05]"
            >
              <div className="flex items-start gap-3">
                {c.peerSnapshot.photoURL ? (
                  <Image
                    src={c.peerSnapshot.photoURL}
                    alt={c.peerSnapshot.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-lg font-bold text-white">
                    {c.peerSnapshot.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">
                    {c.peerSnapshot.name}
                  </h3>
                  {c.peerSnapshot.headline && (
                    <p className="truncate text-xs text-white/60">
                      {c.peerSnapshot.headline}
                    </p>
                  )}
                </div>
                {typeof c.matchScore === "number" && (
                  <div className="flex flex-col items-center rounded-xl border border-indigo-400/30 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 px-2 py-1">
                    <span className="text-base font-bold leading-none">
                      {c.matchScore}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-white/60">
                      match
                    </span>
                  </div>
                )}
              </div>

              {c.peerSnapshot.skills && c.peerSnapshot.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.peerSnapshot.skills.slice(0, 4).map((s) => (
                    <span key={s} className="tag">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {c.icebreakers && c.icebreakers[0] && (
                <p className="mt-3 line-clamp-2 rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs text-white/70">
                  &ldquo;{c.icebreakers[0]}&rdquo;
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
