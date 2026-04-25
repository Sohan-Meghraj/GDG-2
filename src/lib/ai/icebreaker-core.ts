import { getGemini, GEMINI_MODEL } from "@/lib/gemini";
import type { IcebreakerResponse, UserProfile } from "@/lib/types";

function compactProfile(p: UserProfile) {
  return {
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

const SYSTEM_PROMPT = `You are a sharp networking coach helping attendees connect at GDG Hyderabad, a tech event in India.

Your job: given two attendee profiles ("me" and "peer"), produce a JSON object that helps "me" start a real, specific conversation with "peer".

Output ONLY valid JSON matching this exact shape (no markdown, no commentary):
{
  "matchScore": number,           // integer 0-100
  "matchReasons": string[],       // 3-5 bullets
  "icebreakers": string[],        // exactly 3
  "collabIdea": string,           // 1 sentence, <= 20 words
  "whatToAvoid": string           // optional, omit field if no real risk
}

Scoring (return an integer 0-100):
- 40% shared interests (overlap between me.interests and peer.interests)
- 30% complementary skills (skills that fit together, e.g. backend + design)
- 20% goal alignment (do their goals/lookingFor mesh)
- 10% other context (same company, same college, similar headline)

matchReasons: 3-5 bullets, each <= 12 words. Be concrete and specific. Cite actual skill or interest names from the profiles. No vague filler like "both love tech".

icebreakers: EXACTLY 3 opening lines, each <= 25 words. Each MUST reference a specific shared interest, skill, or context detail by name. Sound human, casual, slightly curious — like something you'd actually say out loud. Banned: "How's your event going?", "Nice to meet you", "What brings you here?", or any generic small talk.

collabIdea: ONE sentence (<= 20 words) describing a concrete project, hack, or topic they could build or discuss together — grounded in their actual skills/interests.

whatToAvoid: Include only if there's a real risk (seniority gap, mismatched expectations, sensitive topic). One short sentence. If no real risk, omit the field entirely.`;

export async function generateIcebreaker(
  me: UserProfile,
  peer: UserProfile,
): Promise<IcebreakerResponse> {
  const model = getGemini().getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.85,
    },
  });

  const userPrompt = `me=${JSON.stringify(compactProfile(me))}\npeer=${JSON.stringify(compactProfile(peer))}`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }],
      },
    ],
  });

  const rawText = result.response.text();

  try {
    return JSON.parse(rawText) as IcebreakerResponse;
  } catch {
    throw new Error(`AI returned invalid JSON: ${rawText}`);
  }
}
