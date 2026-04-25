import { generateFollowUps } from "@/lib/ai/follow-up-core";
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

export async function POST(request: Request) {
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

    try {
      const result = await generateFollowUps(body.me, body.connections);
      return Response.json(result);
    } catch (innerErr: unknown) {
      const msg = innerErr instanceof Error ? innerErr.message : "Unknown error";
      if (msg.startsWith("AI returned invalid JSON")) {
        const raw = msg.replace(/^AI returned invalid JSON:\s*/, "");
        console.error("Follow-up: AI returned invalid JSON. Raw:", raw);
        return Response.json(
          { error: "AI returned invalid JSON", raw },
          { status: 502 },
        );
      }
      throw innerErr;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
