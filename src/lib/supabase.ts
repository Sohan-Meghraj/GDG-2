"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile, Connection } from "./types";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase not configured: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing at build time. Re-build with these env vars set."
    );
  }
  _client = createBrowserClient(url, anonKey);
  return _client;
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
  social: Record<string, string> | null;
  created_at: string | null;
  updated_at: string | null;
};

export function rowToProfile(row: ProfileRow): UserProfile {
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
    social: row.social ?? {},
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  };
}

export function profileToRow(p: Partial<UserProfile> & { id: string }): Record<string, unknown> {
  const row: Record<string, unknown> = { id: p.id };
  if (p.name !== undefined) row.name = p.name;
  if (p.email !== undefined) row.email = p.email;
  if (p.photoURL !== undefined) row.photo_url = p.photoURL;
  if (p.headline !== undefined) row.headline = p.headline;
  if (p.skills !== undefined) row.skills = p.skills;
  if (p.interests !== undefined) row.interests = p.interests;
  if (p.goal !== undefined) row.goal = p.goal;
  if (p.lookingFor !== undefined) row.looking_for = p.lookingFor;
  if (p.company !== undefined) row.company = p.company;
  if (p.college !== undefined) row.college = p.college;
  if (p.social !== undefined) row.social = p.social;
  return row;
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToProfile(data as ProfileRow);
}

export async function upsertProfile(profile: Partial<UserProfile> & { id: string }) {
  const row = profileToRow(profile);
  row.updated_at = new Date().toISOString();
  if (!("created_at" in row)) row.created_at = new Date().toISOString();
  const { error } = await getSupabase().from("users").upsert(row);
  if (error) throw new Error(error.message);
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
  met_at: string | null;
  created_at: string;
};

export function rowToConnection(r: ConnectionRow): Connection {
  return {
    id: r.id,
    ownerId: r.owner_id,
    peerId: r.peer_id,
    peerSnapshot: r.peer_snapshot,
    matchScore: r.match_score ?? undefined,
    matchReasons: r.match_reasons ?? undefined,
    icebreakers: r.icebreakers ?? undefined,
    metAt: r.met_at ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  };
}

export async function fetchMyConnections(userId: string): Promise<Connection[]> {
  const { data, error } = await getSupabase()
    .from("connections")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as ConnectionRow[]).map(rowToConnection);
}

export async function saveConnection(c: {
  ownerId: string;
  peerId: string;
  peerSnapshot: Connection["peerSnapshot"];
  matchScore?: number;
  matchReasons?: string[];
  icebreakers?: string[];
  collabIdea?: string;
}) {
  const id = `${c.ownerId}_${c.peerId}`;
  const row = {
    id,
    owner_id: c.ownerId,
    peer_id: c.peerId,
    peer_snapshot: c.peerSnapshot,
    match_score: c.matchScore ?? null,
    match_reasons: c.matchReasons ?? null,
    icebreakers: c.icebreakers ?? null,
    collab_idea: c.collabIdea ?? null,
  };
  const { error } = await getSupabase().from("connections").upsert(row);
  if (error) throw new Error(error.message);
  return id;
}

export async function fetchExistingConnection(ownerId: string, peerId: string) {
  const id = `${ownerId}_${peerId}`;
  const { data, error } = await getSupabase()
    .from("connections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToConnection(data as ConnectionRow);
}
