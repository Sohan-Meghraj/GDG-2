"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getFirebaseAuth } from "@/lib/firebase";
import { Bot, Loader2, Send, Sparkles, Wrench } from "lucide-react";

type ToolCall = {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
};

type Msg = {
  role: "user" | "assistant";
  content: string;
  trace?: ToolCall[];
  isError?: boolean;
};

const EXAMPLE_PROMPTS = [
  "Find Flutter devs interested in AI",
  "Build me a hackathon team for an AI app — I have frontend",
  "Who from my connections should I follow up with first?",
  "Draft follow-up DMs for everyone I met today",
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text: string): ReactNode[] {
  const escaped = escapeHtml(text);
  const tokens: { type: "bold" | "italic" | "text"; content: string }[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(escaped)) !== null) {
    if (m.index > lastIndex) {
      tokens.push({ type: "text", content: escaped.slice(lastIndex, m.index) });
    }
    if (m[2] !== undefined) {
      tokens.push({ type: "bold", content: m[2] });
    } else if (m[3] !== undefined) {
      tokens.push({ type: "italic", content: m[3] });
    }
    lastIndex = re.lastIndex;
  }
  if (lastIndex < escaped.length) {
    tokens.push({ type: "text", content: escaped.slice(lastIndex) });
  }
  return tokens.map((t, i) => {
    if (t.type === "bold") return <strong key={i}>{t.content}</strong>;
    if (t.type === "italic") return <em key={i}>{t.content}</em>;
    return <span key={i}>{t.content}</span>;
  });
}

function renderMarkdown(src: string): ReactNode {
  const lines = src.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*-\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-2 list-disc space-y-1 pl-5">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-2 list-decimal space-y-1 pl-5">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^\s*-\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-1.5 leading-relaxed">
        {paraLines.map((pl, j) => (
          <span key={j}>
            {renderInline(pl)}
            {j < paraLines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  }

  return <div className="text-sm text-white/90">{blocks}</div>;
}

function TraceDisclosure({ trace }: { trace: ToolCall[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/50 transition hover:bg-white/[0.06] hover:text-white/80"
      >
        <Wrench className="h-3 w-3" />
        Used {trace.length} tool{trace.length === 1 ? "" : "s"}
        <span className="ml-0.5">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <ul className="mt-2 space-y-1 rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          {trace.map((t, i) => {
            const argsStr = JSON.stringify(t.args);
            const truncated =
              argsStr.length > 80 ? argsStr.slice(0, 80) + "…" : argsStr;
            return (
              <li
                key={i}
                className="flex items-start gap-2 font-mono text-[11px] text-white/50"
              >
                <span className="shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 text-indigo-300/80">
                  {t.tool}
                </span>
                <span className="break-all">{truncated}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
        style={{ animationDelay: "0ms" }}
      />
      <span
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
        style={{ animationDelay: "150ms" }}
      />
      <span
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
        style={{ animationDelay: "300ms" }}
      />
    </span>
  );
}

export default function AgentPage() {
  const { user, profile, loading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const lineHeight = 24;
    const maxHeight = lineHeight * 6 + 20;
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + "px";
  }, [input]);

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4">
        <div className="card text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-semibold">
            Sign in to chat with your AI Buddy
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Your AI networking assistant — find people, build teams, draft
            messages.
          </p>
          <Link href="/login" className="btn btn-primary mt-5">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4">
        <div className="card text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/5">
            <Sparkles className="h-6 w-6 text-white/60" />
          </div>
          <h1 className="text-xl font-semibold">Finish your profile first</h1>
          <p className="mt-2 text-sm text-white/60">
            AI Buddy needs to know about you before it can help.
          </p>
          <Link href="/onboarding" className="btn btn-primary mt-5">
            Complete profile
          </Link>
        </div>
      </main>
    );
  }

  const firstName = profile.name?.split(" ")[0] ?? "there";

  const send = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const history = messages
      .filter((m) => !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Couldn't get your auth token. Try signing in again.",
            isError: true,
          },
        ]);
        return;
      }

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: history, newMessage: content }),
      });

      if (!res.ok) {
        let errMsg = `Request failed (${res.status})`;
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) errMsg = data.error;
        } catch {
          /* ignore */
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errMsg,
            isError: true,
          },
        ]);
        return;
      }

      const data = (await res.json()) as {
        reply: string;
        trace: ToolCall[];
      };
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          trace: Array.isArray(data.trace) ? data.trace : [],
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Network error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: msg, isError: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const usePrompt = (p: string) => {
    setInput(p);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col">
      <div className="sticky top-[57px] z-20 border-b border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">AI Buddy</h1>
            <p className="text-xs text-white/50">
              Find people, build teams, draft messages — just ask.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            <div className="grid min-h-[50vh] place-items-center">
              <div className="w-full text-center">
                <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-xl shadow-indigo-500/30">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Hi {firstName}, what can I help you with?
                </h2>
                <p className="mt-2 text-sm text-white/50">
                  Try one of these to get started.
                </p>
                <div className="mx-auto mt-6 grid max-w-2xl gap-2 sm:grid-cols-2">
                  {EXAMPLE_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => usePrompt(p)}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-white/80 transition hover:border-indigo-400/40 hover:bg-white/[0.06] hover:text-white"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {messages.map((m, i) => {
                if (m.role === "user") {
                  return (
                    <li key={i} className="flex justify-end">
                      <div className="max-w-[75%] rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-pink-500 px-4 py-2.5 text-sm leading-relaxed text-white shadow-lg shadow-indigo-500/20">
                        <div className="whitespace-pre-wrap break-words">
                          {m.content}
                        </div>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={i} className="flex items-start gap-2.5">
                    <AssistantAvatar />
                    <div className="min-w-0 max-w-[85%] flex-1">
                      <div
                        className={
                          m.isError
                            ? "rounded-2xl rounded-bl-md border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200"
                            : "rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-2.5"
                        }
                      >
                        {m.isError ? (
                          <div className="break-words">{m.content}</div>
                        ) : (
                          renderMarkdown(m.content)
                        )}
                      </div>
                      {m.trace && m.trace.length > 0 && (
                        <TraceDisclosure trace={m.trace} />
                      )}
                    </div>
                  </li>
                );
              })}
              {sending && (
                <li className="flex items-start gap-2.5">
                  <AssistantAvatar />
                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3">
                    <TypingDots />
                  </div>
                </li>
              )}
              <div ref={endRef} />
            </ul>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 transition focus-within:border-indigo-400/60 focus-within:bg-white/[0.06]">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask AI Buddy anything…"
              rows={1}
              disabled={sending}
              className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-60"
            />
            <button
              onClick={() => void send()}
              disabled={sending || input.trim().length === 0}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
              aria-label="Send"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-white/30">
            Enter to send, Shift+Enter for newline
          </p>
        </div>
      </div>
    </div>
  );
}
