import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import type { FollowUpMessage, UserProfile } from "@/lib/types";

type FollowUpConnectionInput = {
  peerId: string;
  peerName: string;
  peerHeadline?: string;
  peerSkills?: string[];
  peerInterests?: string[];
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

export async function generateFollowUps(
  me: UserProfile,
  connections: FollowUpConnectionInput[],
): Promise<{ messages: FollowUpMessage[] }> {
  if (connections.length === 0) {
    return { messages: [] };
  }

  const model = getGemini().getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.85,
    },
  });

  const meFirstName = me.name.split(" ")[0] ?? me.name;
  const filledSystem = SYSTEM_PROMPT.replaceAll("{{ME_NAME}}", me.name).replaceAll(
    "{{ME_FIRST_NAME}}",
    meFirstName,
  );

  const userPrompt = `me=${JSON.stringify(compactMe(me))}\nconnections=${JSON.stringify(
    connections.map((c) => ({
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

  const rawText = result.response.text();

  let parsed: GeneratedMessages;
  try {
    parsed = JSON.parse(rawText) as GeneratedMessages;
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawText}`);
  }

  const messages: FollowUpMessage[] = (parsed.messages ?? []).map((m) => ({
    peerId: m.peerId,
    peerName: m.peerName,
    message: m.message,
  }));

  return { messages };
}
