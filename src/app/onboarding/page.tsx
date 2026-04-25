"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { upsertProfile } from "@/lib/supabase";
import { ChipInput } from "@/components/chip-input";
import { Loader2, Sparkles } from "lucide-react";

const GOALS = [
  "Find a hackathon team",
  "Find collaborators",
  "Hire",
  "Get hired",
  "Learn",
  "Just exploring",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState<string>(GOALS[0]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [orgInput, setOrgInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const metadataName =
      typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";
    if (!name && metadataName) setName(metadataName);
    if (profile) {
      setName(profile.name || metadataName || "");
      setHeadline(profile.headline || "");
      setSkills(profile.skills || []);
      setInterests(profile.interests || []);
      setGoal(profile.goal || GOALS[0]);
      setLookingFor(profile.lookingFor || []);
      setOrgInput(profile.company || profile.college || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profile]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await upsertProfile({
        id: user.id,
        email: user.email ?? "",
        name: name.trim(),
        headline: headline.trim() || undefined,
        skills,
        interests,
        goal,
        lookingFor,
        company: orgInput.trim() || undefined,
        college: profile?.college,
      });
      await refreshProfile();
      router.push("/badge");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Set up your badge
        </h1>
        <p className="mt-2 text-white/60">
          This is what people see when they scan you. Be specific — vague is
          forgettable.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            Headline
          </label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="input"
            placeholder="Flutter dev exploring AI agents"
          />
          <p className="mt-1 text-xs text-white/40">
            One sentence. What you&apos;re into right now.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            Skills
          </label>
          <ChipInput
            value={skills}
            onChange={setSkills}
            placeholder="Type and press Enter — e.g. React, Rust, Figma"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            Interests
          </label>
          <ChipInput
            value={interests}
            onChange={setInterests}
            placeholder="AI agents, climate, design systems..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            Goal at this event
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="input"
          >
            {GOALS.map((g) => (
              <option key={g} value={g} className="bg-[#15151c]">
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            Looking for
          </label>
          <ChipInput
            value={lookingFor}
            onChange={setLookingFor}
            placeholder="Backend dev, UX designer, mentor..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            Company / college
          </label>
          <input
            value={orgInput}
            onChange={(e) => setOrgInput(e.target.value)}
            className="input"
            placeholder="Acme Inc / MIT"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary w-full py-3"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save and continue"
          )}
        </button>
      </form>
    </main>
  );
}
