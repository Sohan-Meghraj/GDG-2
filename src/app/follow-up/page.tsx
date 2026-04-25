"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchMyConnections } from "@/lib/supabase";
import type { Connection, FollowUpMessage } from "@/lib/types";
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Users,
} from "lucide-react";

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
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white"
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

export default function FollowUpPage() {
  const router = useRouter();
  const { user, profile, loading, getAccessToken } = useAuth();

  const [connections, setConnections] = useState<Connection[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [messages, setMessages] = useState<FollowUpMessage[] | null>(null);
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

  const run = async () => {
    if (!user || !profile) return;
    setError(null);
    setGenerating(true);
    setMessages(null);
    try {
      const list = await fetchMyConnections(user.id);
      setConnections(list);

      if (list.length === 0) {
        setMessages([]);
        return;
      }

      const payload = {
        me: profile,
        connections: list.map((c: Connection) => ({
          peerId: c.peerId,
          peerName: c.peerSnapshot.name,
          peerSkills: c.peerSnapshot.skills ?? [],
          peerInterests: c.peerSnapshot.interests ?? [],
        })),
      };

      const token = await getAccessToken();
      const res = await fetch("/api/follow-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { messages: FollowUpMessage[] };
      setMessages(data.messages || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not generate follow-ups."
      );
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (!user || !profile) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  const peerById = (peerId: string) =>
    connections?.find((c) => c.peerId === peerId);

  if (loading || !user || !profile) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-pink-400/30 bg-pink-500/10 px-2.5 py-1 text-xs text-pink-200">
            <Sparkles className="h-3 w-3" />
            AI follow-ups
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Stay in touch
          </h1>
          <p className="mt-1 text-sm text-white/60">
            One personalised message per connection.
          </p>
        </div>
        <Link href="/connections" className="btn btn-secondary">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Connections</span>
        </Link>
      </div>

      {generating && (
        <div className="card flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          <div>
            <p className="text-sm font-medium">Drafting messages…</p>
            <p className="text-xs text-white/50">
              Channeling Gemini through your connection list.
            </p>
          </div>
        </div>
      )}

      {error && !generating && (
        <div className="card border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-2 text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Couldn&apos;t generate</p>
              <p className="mt-0.5 text-xs">{error}</p>
              <button
                onClick={run}
                className="btn btn-secondary mt-3 text-xs"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {!generating && !error && messages && messages.length === 0 && (
        <div className="card text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/5">
            <Users className="h-6 w-6 text-white/40" />
          </div>
          <h3 className="text-lg font-semibold">No connections yet</h3>
          <p className="mt-1 text-sm text-white/60">
            Save some connections first, then come back.
          </p>
          <Link href="/scan" className="btn btn-primary mt-4">
            Scan a badge
          </Link>
        </div>
      )}

      {!generating && messages && messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((m) => {
            const conn = peerById(m.peerId);
            return (
              <div key={m.peerId} className="card">
                <div className="flex items-center gap-3">
                  {conn?.peerSnapshot.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conn.peerSnapshot.photoURL}
                      alt={m.peerName}
                      className="h-10 w-10 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-bold text-white">
                      {m.peerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{m.peerName}</h3>
                    {conn?.peerSnapshot.headline && (
                      <p className="truncate text-xs text-white/50">
                        {conn.peerSnapshot.headline}
                      </p>
                    )}
                  </div>
                  <CopyButton text={m.message} />
                </div>
                <p className="mt-4 whitespace-pre-wrap rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-sm leading-relaxed text-white/85">
                  {m.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
