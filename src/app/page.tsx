"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Loader2,
  Sparkles,
  ArrowRight,
  UserPlus,
  IdCard,
  ScanLine,
  Send,
  QrCode,
  MessageSquare,
  Users,
  Lock,
  Bot,
  Search,
  Wand2,
  Heart,
  Shield,
  Mail,
  X,
  Code2,
  PlayCircle,
  ArrowDown,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                              Animated ring                                  */
/* -------------------------------------------------------------------------- */

function AnimatedMatchRing({ target = 87 }: { target?: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(ease(t) * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target]);

  const r = 42;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - value / 100);

  return (
    <div className="relative h-32 w-32">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            match
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Phone mockup                                   */
/* -------------------------------------------------------------------------- */

function PhoneMockup() {
  return (
    <div className="relative mx-auto mt-16 max-w-sm">
      {/* glow orbs */}
      <div className="pointer-events-none absolute -inset-x-10 -top-10 -bottom-10 -z-10">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-pink-500/30 blur-3xl" />
      </div>

      <div className="rounded-[2.5rem] border border-white/10 bg-zinc-900/80 p-3 shadow-2xl shadow-indigo-500/20 backdrop-blur">
        <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#0c0c12]">
          {/* notch */}
          <div className="flex items-center justify-between px-6 py-3">
            <span className="text-[10px] font-medium tracking-wider text-white/40">
              9:41
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Live
            </span>
          </div>

          <div className="px-6 pb-6 pt-2">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-2xl font-semibold text-white shadow-lg shadow-indigo-500/40">
                PR
              </div>
              <h3 className="mt-3 text-lg font-semibold">Priya Reddy</h3>
              <p className="text-sm text-white/50">Backend at Razorpay</p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {["Supabase", "Gemini", "Go"].map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Match ring */}
            <div className="mt-6 grid place-items-center">
              <AnimatedMatchRing target={87} />
            </div>

            {/* Icebreakers */}
            <div className="mt-6 space-y-2">
              {[
                "Both shipped a Gemini side-project this month.",
                "She's hiring — you're job-hunting.",
                "Ask about her open-source Firestore tool.",
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-white/70"
                >
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-pink-400" />
                  <span className="leading-relaxed">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            Context-aware CTA                                */
/* -------------------------------------------------------------------------- */

function PrimaryCTA({
  size = "lg",
  className = "",
}: {
  size?: "lg" | "xl";
  className?: string;
}) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const sizing =
    size === "xl"
      ? "px-9 py-4 text-base"
      : "px-7 py-3.5 text-sm sm:text-base";
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60 bg-gradient-to-r from-indigo-500 to-pink-500 shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] hover:shadow-[0_0_80px_-10px_rgba(236,72,153,0.6)]";

  if (!user) {
    return (
      <button
        onClick={() => {
          setNavigating(true);
          router.push("/login");
        }}
        disabled={navigating}
        className={`${base} ${sizing} ${className}`}
      >
        {navigating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Get started
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    );
  }

  if (!profile) {
    return (
      <Link href="/onboarding" className={`${base} ${sizing} ${className}`}>
        Complete your profile
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link href="/badge" className={`${base} ${sizing} ${className}`}>
      Open your dashboard
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Welcome banner                                 */
/* -------------------------------------------------------------------------- */

function WelcomeBanner() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-pink-500/10 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2.5 text-sm">
        <div className="flex items-center gap-2 text-white/80">
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          <span>Welcome back —</span>
          <Link
            href="/badge"
            className="font-medium text-white underline-offset-4 hover:underline"
          >
            Open your dashboard
          </Link>
        </div>
        <button
          aria-label="Dismiss"
          onClick={() => setHidden(true)}
          className="rounded-full p-1 text-white/50 hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                      */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="grid min-h-[70vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        {slow && (
          <p className="text-xs text-white/50">
            Taking longer than expected — check your connection
          </p>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="relative overflow-hidden">
      {user && profile && <WelcomeBanner />}

      {/* ============================ HERO ============================ */}
      <section className="relative">
        {/* radial glow background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.35),_transparent_60%)]" />
          <div className="absolute right-0 top-40 h-[500px] w-[600px] rounded-full bg-[radial-gradient(ellipse,_rgba(236,72,153,0.18),_transparent_70%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 0%, black 30%, transparent 70%)",
            }}
          />
        </div>

        <div className="mx-auto flex min-h-[85vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
          {/* Eyebrow */}
          <div className="relative inline-flex">
            <div className="absolute -inset-px rounded-full bg-gradient-to-r from-indigo-500/60 via-fuchsia-500/60 to-pink-500/60 blur-sm" />
            <span className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/80 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              Powered by Gemini 2.0 + Supabase
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl lg:text-8xl">
            Stop networking.
            <br />
            <span className="bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Start connecting.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mt-7 max-w-2xl text-lg text-white/60 sm:text-xl">
            Scan a badge at any tech event. Our AI agent tells you why you
            should meet, exactly what to say, and writes the follow-up.
            EventConnect is the AI networking buddy that turns awkward small
            talk into real connections.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <PrimaryCTA size="xl" />
            <a
              href="#how"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-4 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/10 sm:text-base"
            >
              See how it works
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          <PhoneMockup />
        </div>
      </section>

      {/* ============================ PROBLEM ============================ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Most networking apps just give you a contact list.
            </h2>
            <p className="mt-4 text-lg italic text-white/55">
              We give you the conversation, the match, and the message.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                num: "50",
                label: "People you meet at an event",
                icon: Users,
                tone: "from-indigo-500/30 to-indigo-500/0",
                color: "text-white",
              },
              {
                num: "5",
                label: "Names you'll remember by next week",
                icon: Heart,
                tone: "from-fuchsia-500/30 to-fuchsia-500/0",
                color: "text-white",
              },
              {
                num: "0",
                label: "Follow-ups you'll actually send",
                icon: Mail,
                tone: "from-orange-500/30 to-red-500/0",
                color: "text-orange-400",
              },
            ].map((s) => (
              <div
                key={s.num}
                className="card group relative overflow-hidden text-center transition-transform hover:-translate-y-1"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${s.tone} opacity-60`}
                />
                <div className="relative">
                  <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                    <s.icon className="h-5 w-5 text-white/70" />
                  </div>
                  <div
                    className={`mt-4 text-7xl font-semibold tracking-tight ${s.color}`}
                  >
                    {s.num}
                  </div>
                  <p className="mt-3 text-sm uppercase tracking-wider text-white/50">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section id="how" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-indigo-300">
              How it works
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Four steps. Zero awkwardness.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {[
              {
                n: "1",
                title: "Build your profile in 60 seconds",
                body: "Sign in with Google. Tell us your skills, interests, and what you're looking for.",
                icon: UserPlus,
              },
              {
                n: "2",
                title: "Get your QR badge",
                body: "We generate a unique badge. Show it to anyone you meet — physical or virtual.",
                icon: IdCard,
              },
              {
                n: "3",
                title: "Scan & match instantly",
                body: "Scan their badge. AI computes a match score, tells you why you should meet, and gives you 3 perfect openers.",
                icon: ScanLine,
              },
              {
                n: "4",
                title: "Auto-follow-up after the event",
                body: "Tap one button. AI drafts personalized DMs to everyone you connected with.",
                icon: Send,
              },
            ].map((s) => (
              <div
                key={s.n}
                className="card group relative transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-5">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-lg font-semibold text-white shadow-lg shadow-indigo-500/30">
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <s.icon className="h-5 w-5 text-pink-300" />
                      <h3 className="text-xl font-semibold">{s.title}</h3>
                    </div>
                    <p className="mt-2 leading-relaxed text-white/60">
                      {s.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ AI BUDDY ============================ */}
      <section className="relative py-24 sm:py-32">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-indigo-500/[0.04] to-transparent" />
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
                <Bot className="h-3.5 w-3.5 text-indigo-300" />
                Agentic AI
              </div>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight lg:text-5xl">
                Your AI Networking Buddy.
                <br />
                <span className="bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  It actually does the work.
                </span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/60">
                Tell it who you want to meet. It searches the room, builds your
                team, drafts follow-ups, and explains why every recommendation
                matters. Powered by Gemini function-calling — six real tools
                the agent uses to take action, not just talk.
              </p>

              <ul className="mt-7 grid gap-2 sm:grid-cols-2">
                {[
                  { icon: Search, text: "Find attendees by skill" },
                  { icon: Users, text: "Build a balanced hackathon team" },
                  { icon: Mail, text: "Draft warm follow-ups" },
                  { icon: Wand2, text: "Generate icebreakers" },
                  { icon: Heart, text: "Surface your strongest matches" },
                  { icon: Shield, text: "All privacy-respecting" },
                ].map((b) => (
                  <li
                    key={b.text}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-white/80"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-pink-500/30 text-indigo-200">
                      <b.icon className="h-3.5 w-3.5" />
                    </span>
                    {b.text}
                  </li>
                ))}
              </ul>

              <Link
                href="/agent"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-5 py-2.5 text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/20"
              >
                Try the AI Buddy
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right — chat mockup */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/10 to-pink-500/20 blur-2xl" />
              <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-2xl shadow-indigo-500/10 backdrop-blur sm:p-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI Buddy</p>
                    <p className="text-[11px] text-white/40">
                      gemini-2.0-flash · 6 tools
                    </p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Online
                  </span>
                </div>

                <div className="space-y-4 pt-5">
                  {/* user bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-pink-500 px-4 py-2.5 text-sm text-white shadow-lg shadow-indigo-500/30">
                      Find me a backend dev who knows Gemini for our hackathon
                      team.
                    </div>
                  </div>

                  {/* tool call pill */}
                  <div className="flex justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] text-white/50">
                      <Wand2 className="h-3 w-3" />
                      searchAttendees → returned 3
                    </span>
                  </div>

                  {/* assistant bubble */}
                  <div className="flex justify-start gap-2">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5">
                      <Bot className="h-3.5 w-3.5 text-indigo-300" />
                    </div>
                    <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/85 backdrop-blur">
                      <p className="mb-2">
                        Found 3 strong matches in the room:
                      </p>
                      <ul className="space-y-1.5 text-[13px] leading-relaxed text-white/75">
                        <li>
                          <span className="font-semibold text-white">
                            Priya Reddy
                          </span>{" "}
                          — built a Gemini-powered Firestore tool last month.
                        </li>
                        <li>
                          <span className="font-semibold text-white">
                            Rahul Verma
                          </span>{" "}
                          — Go + Vertex AI, just left a fintech.
                        </li>
                        <li>
                          <span className="font-semibold text-white">
                            Ananya Iyer
                          </span>{" "}
                          — backend lead, mentors hackathon teams.
                        </li>
                      </ul>
                      <p className="mt-3 text-[13px] text-indigo-200">
                        Want me to send team invites?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FEATURE GRID ============================ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-indigo-300">
              Everything you need
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Built for the way real events work.
            </h2>
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: QrCode,
                title: "Instant QR badge",
                body: "Show your badge, get scanned, profile shared. No business cards.",
                grad: "from-indigo-500 to-violet-500",
              },
              {
                icon: Sparkles,
                title: "Animated match score",
                body: "See your compatibility with anyone in 2 seconds — with reasons.",
                grad: "from-fuchsia-500 to-pink-500",
              },
              {
                icon: MessageSquare,
                title: "3 perfect icebreakers",
                body: "AI references your real overlap. Casual, specific, never cringe.",
                grad: "from-pink-500 to-rose-500",
              },
              {
                icon: Users,
                title: "Smart team builder",
                body: "Tell the agent the roles you need. It picks the right people.",
                grad: "from-indigo-500 to-cyan-500",
              },
              {
                icon: Send,
                title: "Post-event follow-ups",
                body: "Turn 50 connections into 50 personalized DMs in 10 seconds.",
                grad: "from-amber-500 to-pink-500",
              },
              {
                icon: Lock,
                title: "Privacy first",
                body: "We never expose emails. Opt-in matchmaking. Owner-only writes.",
                grad: "from-emerald-500 to-indigo-500",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card group transition-transform hover:-translate-y-1"
              >
                <div
                  className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${f.grad} text-white shadow-lg shadow-indigo-500/20`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ THREE-PHASE ============================ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-indigo-300">
              The full event arc
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              From sign-in to follow-up — handled.
            </h2>
          </div>

          <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
            {/* desktop arrows */}
            <div className="pointer-events-none absolute inset-0 hidden lg:block">
              <svg
                className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2"
                width="40"
                height="20"
                viewBox="0 0 40 20"
                fill="none"
              >
                <path
                  d="M2 10h36m0 0l-6-6m6 6l-6 6"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                className="absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2"
                width="40"
                height="20"
                viewBox="0 0 40 20"
                fill="none"
              >
                <path
                  d="M2 10h36m0 0l-6-6m6 6l-6 6"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {[
              {
                tag: "Before event",
                title: "Sign in. Build profile. Get badge.",
                icon: UserPlus,
                tone: "from-indigo-500/20 to-transparent",
              },
              {
                tag: "At event",
                title: "Scan badges. AI suggests matches. Save connections.",
                icon: ScanLine,
                tone: "from-fuchsia-500/20 to-transparent",
              },
              {
                tag: "After event",
                title: "AI drafts personalized follow-ups. Stay in touch.",
                icon: Send,
                tone: "from-pink-500/20 to-transparent",
              },
            ].map((p) => (
              <div
                key={p.tag}
                className="card relative overflow-hidden transition-transform hover:-translate-y-1"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${p.tone}`}
                />
                <div className="relative">
                  <span className="inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    {p.tag}
                  </span>
                  <div className="mt-5 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/5">
                    <p.icon className="h-5 w-5 text-pink-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug">
                    {p.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ TECH STACK ============================ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Built on Google Cloud.
          </h2>
          <p className="mt-3 text-lg text-white/55">
            Production-grade infrastructure from day one.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
            {[
              "Gemini 2.0 Flash",
              "Supabase Auth",
              "Postgres + RLS",
              "Cloud Run",
              "Next.js 16",
              "Tailwind v4",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 backdrop-blur transition hover:border-indigo-400/40 hover:bg-white/[0.07]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/10 to-pink-500/10 p-10 text-center backdrop-blur sm:p-16">
            <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full bg-pink-500/20 blur-3xl" />

            <div className="relative">
              <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Ready to actually remember everyone you meet?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
                Join EventConnect. Sign in takes 5 seconds. We handle the rest.
              </p>
              <div className="mt-9 flex justify-center">
                <PrimaryCTA size="xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center text-sm text-white/40">
          <p className="text-base font-semibold tracking-tight text-white/70">
            EventConnect
          </p>
          <p className="text-xs">
            Built for GDG Hyderabad × Google Cloud Build with AI Hackathon
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <a
              href="#"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:text-white"
            >
              <Code2 className="h-3.5 w-3.5" />
              GitHub
            </a>
            <span className="text-white/20">·</span>
            <a
              href="#"
              className="rounded-md px-2 py-1 transition hover:text-white"
            >
              Privacy
            </a>
            <span className="text-white/20">·</span>
            <a
              href="#"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 transition hover:text-white"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Demo Video
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
