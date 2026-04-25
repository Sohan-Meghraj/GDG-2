import { generateIcebreaker } from "@/lib/ai/icebreaker-core";
import type { UserProfile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IcebreakerRequestBody = {
  me?: UserProfile;
  peer?: UserProfile;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IcebreakerRequestBody;
    if (!body || !body.me || !body.peer) {
      return Response.json(
        { error: "Missing 'me' or 'peer' in request body" },
        { status: 400 },
      );
    }

    try {
      const parsed = await generateIcebreaker(body.me, body.peer);
      return Response.json(parsed);
    } catch (innerErr: unknown) {
      const msg = innerErr instanceof Error ? innerErr.message : "Unknown error";
      if (msg.startsWith("AI returned invalid JSON")) {
        const raw = msg.replace(/^AI returned invalid JSON:\s*/, "");
        console.error("Icebreaker: AI returned invalid JSON. Raw:", raw);
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
