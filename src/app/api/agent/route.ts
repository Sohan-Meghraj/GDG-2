import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import { executeTool, tools } from "@/lib/agent-tools";
import type { UserProfile } from "@/lib/types";

async function loadAdmin() {
  const mod = await import("@/lib/firebase-admin");
  return { adminAuth: mod.adminAuth, adminDb: mod.adminDb };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMessage = { role: "user" | "assistant"; content: string };
type AgentRequestBody = {
  messages?: IncomingMessage[];
  newMessage?: string;
};

type TraceEntry = {
  tool: string;
  args: Record<string, unknown>;
  result: unknown;
};

const SYSTEM_PROMPT = `You are EventConnect AI Buddy, a sharp networking assistant for attendees of GDG Hyderabad and similar tech events. The signed-in user's profile is provided in the first user message. Always use the available tools to look up real attendees, connections, and event data — never guess or invent people. When you suggest someone, always cite the specific overlap (skill/interest) from the tool result. Be concise: short paragraphs and bullet lists. Use markdown sparingly. Never reveal emails or phone numbers. If asked something off-topic, briefly steer back to networking. End your reply with a small, useful next step the user can take (e.g., "Want me to draft an icebreaker for any of them?").`;

function summarizeMe(p: UserProfile) {
  return {
    id: p.id,
    name: p.name,
    headline: p.headline ?? "",
    skills: p.skills ?? [],
    interests: p.interests ?? [],
    goal: p.goal ?? "",
    lookingFor: p.lookingFor ?? [],
    company: p.company ?? "",
    college: p.college ?? "",
  };
}

function isValidMessage(m: unknown): m is IncomingMessage {
  if (!m || typeof m !== "object") return false;
  const r = (m as { role?: unknown }).role;
  const c = (m as { content?: unknown }).content;
  return (r === "user" || r === "assistant") && typeof c === "string";
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const { adminAuth, adminDb } = await loadAdmin();

    let uid: string;
    try {
      const decoded = await adminAuth().verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    const profileSnap = await adminDb().collection("users").doc(uid).get();
    if (!profileSnap.exists) {
      return Response.json({ error: "profile_not_found" }, { status: 404 });
    }
    const data = profileSnap.data() as Partial<UserProfile> & { id?: string };
    const me: UserProfile = {
      id: data.id ?? profileSnap.id,
      name: data.name ?? "",
      email: data.email ?? "",
      photoURL: data.photoURL,
      headline: data.headline,
      skills: data.skills ?? [],
      interests: data.interests ?? [],
      goal: data.goal,
      lookingFor: data.lookingFor,
      company: data.company,
      college: data.college,
      social: data.social,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    let body: AgentRequestBody;
    try {
      body = (await request.json()) as AgentRequestBody;
    } catch {
      return Response.json({ error: "invalid_json_body" }, { status: 400 });
    }

    const newMessage = body.newMessage;
    const messages = body.messages;
    if (typeof newMessage !== "string" || !newMessage.trim()) {
      return Response.json({ error: "missing_newMessage" }, { status: 400 });
    }
    if (!Array.isArray(messages) || !messages.every(isValidMessage)) {
      return Response.json({ error: "invalid_messages" }, { status: 400 });
    }

    const meSummary = summarizeMe(me);
    const systemInstruction = `${SYSTEM_PROMPT}\n\nThe signed-in user is: ${JSON.stringify(meSummary)}`;

    const model = getGemini().getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction,
      tools: [{ functionDeclarations: tools }],
      generationConfig: { temperature: 0.7 },
    });

    const chat = model.startChat({
      history: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    let result = await chat.sendMessage(newMessage);
    const trace: TraceEntry[] = [];

    for (let i = 0; i < 6; i++) {
      const calls = result.response.functionCalls();
      if (!calls || calls.length === 0) break;
      const fnResponses = [];
      for (const call of calls) {
        const rawArgs = (call.args ?? {}) as Record<string, unknown>;
        const out = await executeTool(call.name, rawArgs, { uid, me });
        trace.push({ tool: call.name, args: rawArgs, result: out });
        fnResponses.push({
          functionResponse: {
            name: call.name,
            response: (out && typeof out === "object" ? out : { value: out }) as object,
          },
        });
      }
      result = await chat.sendMessage(fnResponses);
    }

    return Response.json({ reply: result.response.text(), trace });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
