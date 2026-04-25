import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { generateIcebreaker } from "@/lib/ai/icebreaker-core";
import { generateFollowUps } from "@/lib/ai/follow-up-core";
import type { UserProfile } from "@/lib/types";

async function adminDb() {
  const mod = await import("@/lib/firebase-admin");
  return mod.adminDb();
}

export type ToolContext = { uid: string; me: UserProfile };

type CompactProfile = {
  id: string;
  name: string;
  headline?: string;
  skills?: string[];
  interests?: string[];
  goal?: string;
  photoURL?: string;
};

type ConnectionSummary = {
  peerId: string;
  peerName: string;
  peerHeadline?: string;
  peerSkills?: string[];
  peerInterests?: string[];
  matchScore?: number;
  savedAt?: number;
};

export const tools: FunctionDeclaration[] = [
  {
    name: "searchAttendees",
    description:
      "Search the event's attendee directory for people matching given skills, interests, goal, or free-text query. Returns the top matches with compact profiles.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        skills: {
          type: SchemaType.ARRAY,
          description: "Skill terms to match (case-insensitive substrings).",
          items: { type: SchemaType.STRING },
        },
        interests: {
          type: SchemaType.ARRAY,
          description: "Interest terms to match.",
          items: { type: SchemaType.STRING },
        },
        goal: {
          type: SchemaType.STRING,
          description: "Goal text to match.",
        },
        query: {
          type: SchemaType.STRING,
          description: "Free-text query matched against headline, skills, interests, goal.",
        },
        limit: {
          type: SchemaType.INTEGER,
          description: "Max number of results to return (default 5).",
        },
      },
    },
  },
  {
    name: "getMyConnections",
    description:
      "Get the signed-in user's saved connections from the event (people they've already connected with). Use this when the user asks about 'my connections', follow-ups, or who they've met.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
    },
  },
  {
    name: "getProfile",
    description:
      "Fetch a single attendee's compact profile by user id. Useful after searchAttendees when you need more detail.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        userId: {
          type: SchemaType.STRING,
          description: "The Firestore user id of the attendee.",
        },
      },
      required: ["userId"],
    },
  },
  {
    name: "generateIcebreaker",
    description:
      "Generate a tailored icebreaker, match score, match reasons, and a collab idea for the signed-in user to start a conversation with a specific peer.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        peerId: {
          type: SchemaType.STRING,
          description: "The user id of the peer to draft icebreakers for.",
        },
      },
      required: ["peerId"],
    },
  },
  {
    name: "draftFollowUps",
    description:
      "Draft post-event follow-up DMs for the signed-in user's saved connections. Optionally filter to specific peerIds.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        peerIds: {
          type: SchemaType.ARRAY,
          description: "Optional subset of peer user ids to draft messages for.",
          items: { type: SchemaType.STRING },
        },
      },
    },
  },
  {
    name: "proposeTeam",
    description:
      "Propose a team of attendees for a hackathon or project, picking one person per needed role from the directory. Returns a small team with role and a one-line reason citing the matched skill/interest.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        neededRoles: {
          type: SchemaType.ARRAY,
          description: "Roles or skills needed (e.g. ['frontend', 'design', 'ML']).",
          items: { type: SchemaType.STRING },
        },
        size: {
          type: SchemaType.INTEGER,
          description: "Optional cap on team size; defaults to neededRoles.length.",
        },
      },
      required: ["neededRoles"],
    },
  },
];

function stripPrivate(p: UserProfile): CompactProfile {
  return {
    id: p.id,
    name: p.name,
    headline: p.headline,
    skills: p.skills ?? [],
    interests: p.interests ?? [],
    goal: p.goal,
    photoURL: p.photoURL,
  };
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function scoreProfile(p: UserProfile, terms: string[]): number {
  if (terms.length === 0) return 0;
  const haystack = [
    ...(p.skills ?? []),
    ...(p.interests ?? []),
    p.goal ?? "",
    p.headline ?? "",
  ]
    .join(" \n ")
    .toLowerCase();
  let score = 0;
  for (const t of terms) {
    const tt = t.trim().toLowerCase();
    if (!tt) continue;
    if (haystack.includes(tt)) score += 1;
  }
  return score;
}

async function loadAllUsers(): Promise<UserProfile[]> {
  const db = await adminDb();
  const snap = await db.collection("users").limit(100).get();
  const users: UserProfile[] = [];
  for (const doc of snap.docs) {
    const data = doc.data() as Partial<UserProfile> & { id?: string };
    users.push({
      id: data.id ?? doc.id,
      name: data.name ?? "",
      email: "",
      photoURL: data.photoURL,
      headline: data.headline,
      skills: data.skills ?? [],
      interests: data.interests ?? [],
      goal: data.goal,
      lookingFor: data.lookingFor,
      company: data.company,
      college: data.college,
    });
  }
  return users;
}

async function searchAttendeesImpl(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<{ results: CompactProfile[] }> {
  const skills = asStringArray(args.skills);
  const interests = asStringArray(args.interests);
  const goal = asString(args.goal);
  const query = asString(args.query);
  const limitRaw = asNumber(args.limit);
  const limit = Math.max(1, Math.min(5, limitRaw ?? 5));

  const terms: string[] = [...skills, ...interests];
  if (goal) terms.push(goal);
  if (query) {
    for (const part of query.split(/[\s,]+/)) {
      if (part.trim()) terms.push(part.trim());
    }
  }

  const users = await loadAllUsers();
  const scored = users
    .filter((u) => u.id !== ctx.uid)
    .map((u) => ({ u, s: scoreProfile(u, terms) }))
    .filter((x) => (terms.length === 0 ? true : x.s > 0))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);

  return { results: scored.map((x) => stripPrivate(x.u)) };
}

async function getMyConnectionsImpl(
  ctx: ToolContext,
): Promise<{ connections: ConnectionSummary[] }> {
  const db = await adminDb();
  const snap = await db
    .collection("connections")
    .where("ownerId", "==", ctx.uid)
    .limit(50)
    .get();
  const out: ConnectionSummary[] = [];
  for (const doc of snap.docs) {
    const d = doc.data() as Record<string, unknown>;
    const peerSnapshot = (d.peerSnapshot ?? {}) as Record<string, unknown>;
    out.push({
      peerId: asString(d.peerId) ?? "",
      peerName: asString(peerSnapshot.name) ?? asString(d.peerName) ?? "",
      peerHeadline: asString(peerSnapshot.headline),
      peerSkills: asStringArray(peerSnapshot.skills),
      peerInterests: asStringArray(peerSnapshot.interests),
      matchScore: asNumber(d.matchScore),
      savedAt: asNumber(d.createdAt),
    });
  }
  return { connections: out };
}

async function readUser(userId: string): Promise<UserProfile | null> {
  const db = await adminDb();
  const snap = await db.collection("users").doc(userId).get();
  if (!snap.exists) return null;
  const data = snap.data() as Partial<UserProfile> & { id?: string };
  return {
    id: data.id ?? snap.id,
    name: data.name ?? "",
    email: "",
    photoURL: data.photoURL,
    headline: data.headline,
    skills: data.skills ?? [],
    interests: data.interests ?? [],
    goal: data.goal,
    lookingFor: data.lookingFor,
    company: data.company,
    college: data.college,
  };
}

async function getProfileImpl(
  args: Record<string, unknown>,
): Promise<CompactProfile | { error: string }> {
  const userId = asString(args.userId);
  if (!userId) return { error: "userId required" };
  const u = await readUser(userId);
  if (!u) return { error: "not_found" };
  return stripPrivate(u);
}

async function generateIcebreakerImpl(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  const peerId = asString(args.peerId);
  if (!peerId) return { error: "peerId required" };
  const peer = await readUser(peerId);
  if (!peer) return { error: "peer_not_found" };
  return await generateIcebreaker(ctx.me, peer);
}

async function draftFollowUpsImpl(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  const filterIds = asStringArray(args.peerIds);
  const { connections } = await getMyConnectionsImpl(ctx);
  const filtered =
    filterIds.length > 0
      ? connections.filter((c) => filterIds.includes(c.peerId))
      : connections;
  const input = filtered.slice(0, 5).map((c) => ({
    peerId: c.peerId,
    peerName: c.peerName,
    peerHeadline: c.peerHeadline,
    peerSkills: c.peerSkills,
    peerInterests: c.peerInterests,
  }));
  return await generateFollowUps(ctx.me, input);
}

async function proposeTeamImpl(
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  const neededRoles = asStringArray(args.neededRoles);
  if (neededRoles.length === 0) return { error: "neededRoles required" };
  const sizeRaw = asNumber(args.size);
  const size = Math.max(1, Math.min(neededRoles.length, sizeRaw ?? neededRoles.length));

  const users = (await loadAllUsers()).filter((u) => u.id !== ctx.uid);
  const picked = new Set<string>();
  const team: Array<{
    id: string;
    name: string;
    role: string;
    headline?: string;
    why: string;
  }> = [];

  for (const role of neededRoles.slice(0, size)) {
    const roleLower = role.toLowerCase();
    const candidates = users
      .filter((u) => !picked.has(u.id))
      .map((u) => ({ u, s: scoreProfile(u, [role]) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    const top = candidates[0];
    if (!top) continue;
    picked.add(top.u.id);

    const matchedSkill = (top.u.skills ?? []).find((s) =>
      s.toLowerCase().includes(roleLower),
    );
    const matchedInterest = (top.u.interests ?? []).find((s) =>
      s.toLowerCase().includes(roleLower),
    );
    const cite = matchedSkill ?? matchedInterest ?? role;
    const why = matchedSkill
      ? `Lists ${cite} as a skill — fits the ${role} role.`
      : matchedInterest
        ? `Active interest in ${cite}, aligned with the ${role} role.`
        : `Profile mentions ${role}.`;

    team.push({
      id: top.u.id,
      name: top.u.name,
      role,
      headline: top.u.headline,
      why,
    });
  }

  return { team };
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext,
): Promise<unknown> {
  switch (name) {
    case "searchAttendees":
      return await searchAttendeesImpl(args, ctx);
    case "getMyConnections":
      return await getMyConnectionsImpl(ctx);
    case "getProfile":
      return await getProfileImpl(args);
    case "generateIcebreaker":
      return await generateIcebreakerImpl(args, ctx);
    case "draftFollowUps":
      return await draftFollowUpsImpl(args, ctx);
    case "proposeTeam":
      return await proposeTeamImpl(args, ctx);
    default:
      return { error: `unknown_tool: ${name}` };
  }
}
