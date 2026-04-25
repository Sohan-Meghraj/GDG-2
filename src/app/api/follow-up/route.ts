import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import type { FollowUpMessage, UserProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FollowUpConnectionInput = {
  peerId: string;
  peerName: string;
  peerHeadline?: string;
  peerSkills?: string[];
  peerInterests?: string[];
};

type FollowUpRequestBody = {
  me?: UserProfile;
  connections?: FollowUpConnectionInput[];
};

type GeneratedMessages = {
  messages: Array<{
    peerId: string;
    peerName: string;
    message: string;
  }>;
};

function compactMe(p: UserProfile) {
  return {
    name: p.name,
    headline: p.headline ?? "",
    skills: p.skills ?? [],
    interests: p.interests ?? [],
    goal: p.goal ?? "",
  };
}

const SYSTEM_PROMPT = `You are drafting casual, warm post-event follow-up DMs from {{ME_NAME}} after GDG Hyderabad.

For EACH connection in the input list, write ONE short DM (2-3 sentences). Rules:
- Reference ONE specific shared interest or skill by name (use the actual values from the profiles).
- Do NOT start with "It was great meeting you!", "Nice meeting you", or any generic opener. Start with something specific to that person.
- End with a soft CTA: grab a coffee, share a project link, swap notes, ping on a topic. Keep it low-pressure.
- No emojis. Sign-off optional and casual (e.g. "— {{ME_FIRST_NAME}}").
- Tone: warm, human, slightly curious. Not salesy.

Output ONLY valid JSON in this exact shape (no markdown, no extra commentary):
{
  "messages": [
    { "peerId": "...", "peerName": "...", "message": "..." }
  ]
}

Include one entry per input connection, in the same order, preserving the exact peerId and peerName.`;

export async function POST(request: Request) {
  let rawText: string | undefined;
  try {
    const body = (await request.json()) as FollowUpRequestBody;
    if (!body || !body.me || !Array.isArray(body.connections)) {
      return Response.json(
        { error: "Missing 'me' or 'connections' in request body" },
        { status: 400 },
      );
    }

    if (body.connections.length === 0) {
      return Response.json({ messages: [] satisfies FollowUpMessage[] });
    }

    const model = getGemini().getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.85,
      },
    });

    const meFirstName = body.me.name.split(" ")[0] ?? body.me.name;
    const filledSystem = SYSTEM_PROMPT.replaceAll("{{ME_NAME}}", body.me.name).replaceAll(
      "{{ME_FIRST_NAME}}",
      meFirstName,
    );

    const userPrompt = `me=${JSON.stringify(compactMe(body.me))}\nconnections=${JSON.stringify(
      body.connections.map((c) => ({
        peerId: c.peerId,
        peerName: c.peerName,
        peerHeadline: c.peerHeadline ?? "",
        peerSkills: c.peerSkills ?? [],
        peerInterests: c.peerInterests ?? [],
      })),
    )}`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${filledSystem}\n\n${userPrompt}` }],
        },
      ],
    });

    rawText = result.response.text();

    let parsed: GeneratedMessages;
    try {
      parsed = JSON.parse(rawText) as GeneratedMessages;
    } catch {
      console.error("Follow-up: AI returned invalid JSON. Raw:", rawText);
      return Response.json(
        { error: "AI returned invalid JSON", raw: rawText },
        { status: 502 },
      );
    }

    const messages: FollowUpMessage[] = (parsed.messages ?? []).map((m) => ({
      peerId: m.peerId,
      peerName: m.peerName,
      message: m.message,
    }));

    return Response.json({ messages });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
