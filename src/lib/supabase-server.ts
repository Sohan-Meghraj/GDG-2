import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { UserProfile, Connection, FollowUpMessage } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function supabaseAnon(): SupabaseClient {
  return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function supabaseAsUser(accessToken: string): SupabaseClient {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function verifyToken(accessToken: string): Promise<User | null> {
  const { data, error } = await supabaseAnon().auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

type ProfileRow = {
  id: string;
  email: string | null;
  name: string;
  photo_url: string | null;
  headline: string | null;
  skills: string[] | null;
  interests: string[] | null;
  goal: string | null;
  looking_for: string[] | null;
  company: string | null;
  college: string | null;
};

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    photoURL: row.photo_url ?? undefined,
    headline: row.headline ?? undefined,
    skills: row.skills ?? [],
    interests: row.interests ?? [],
    goal: row.goal ?? undefined,
    lookingFor: row.looking_for ?? [],
    company: row.company ?? undefined,
    college: row.college ?? undefined,
  };
}

export async function getProfileServer(client: SupabaseClient, userId: string): Promise<UserProfile | null> {
  const { data, error } = await client.from("users").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as ProfileRow);
}

export async function listAttendeesServer(client: SupabaseClient, excludeUserId: string, limit = 100): Promise<UserProfile[]> {
  const { data, error } = await client.from("users").select("*").neq("id", excludeUserId).limit(limit);
  if (error || !data) return [];
  return (data as ProfileRow[]).map(rowToProfile);
}

type ConnectionRow = {
  id: string;
  owner_id: string;
  peer_id: string;
  peer_snapshot: Connection["peerSnapshot"];
  match_score: number | null;
  match_reasons: string[] | null;
  icebreakers: string[] | null;
  collab_idea: string | null;
  created_at: string;
};

export async function listMyConnectionsServer(client: SupabaseClient, userId: string): Promise<Array<{
  peerId: string;
  peerName: string;
  peerHeadline?: string;
  peerSkills?: string[];
  peerInterests?: string[];
  matchScore?: number;
  savedAt: number;
}>> {
  const { data, error } = await client
    .from("connections")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];
  return (data as ConnectionRow[]).map((r) => ({
    peerId: r.peer_id,
    peerName: r.peer_snapshot.name,
    peerHeadline: r.peer_snapshot.headline,
    peerSkills: r.peer_snapshot.skills,
    peerInterests: r.peer_snapshot.interests,
    matchScore: r.match_score ?? undefined,
    savedAt: new Date(r.created_at).getTime(),
  }));
}

export type { FollowUpMessage };
