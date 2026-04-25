"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export default function BadgePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [qrValue, setQrValue] = useState<string>("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    if (typeof window !== "undefined") {
      setQrValue(`${window.location.origin}/profile/${user.id}`);
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Your badge</h1>
        <p className="mt-1 text-sm text-white/60">
          Show this to anyone you meet — they scan, AI does the rest.
        </p>
      </div>

      <div className="mt-6 rounded-3xl border-4 border-white bg-white p-6 shadow-2xl">
        {qrValue ? (
          <div className="mx-auto aspect-square w-full max-w-[280px]">
            <QRCode
              value={qrValue}
              size={280}
              style={{ height: "100%", width: "100%" }}
              bgColor="#ffffff"
              fgColor="#0b0b10"
              level="M"
            />
          </div>
        ) : (
          <div className="grid aspect-square w-full max-w-[280px] place-items-center mx-auto">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        )}
      </div>

      <div className="card mt-6 flex flex-col items-center text-center">
        {profile.photoURL ? (
          <Image
            src={profile.photoURL}
            alt={profile.name}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full border-2 border-white/20 object-cover"
            unoptimized
          />
        ) : (
          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-2xl font-bold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="mt-4 text-2xl font-semibold">{profile.name}</h2>
        {profile.headline && (
          <p className="mt-1 text-sm text-white/60">{profile.headline}</p>
        )}
        {(profile.company || profile.college) && (
          <p className="mt-0.5 text-xs text-white/40">
            {profile.company || profile.college}
          </p>
        )}

        {profile.skills.length > 0 && (
          <div className="mt-5 w-full">
            <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
              Skills
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="tag">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.interests.length > 0 && (
          <div className="mt-4 w-full">
            <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
              Interests
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {profile.interests.map((s) => (
                <span
                  key={s}
                  className="tag bg-pink-500/10 border-pink-500/20 text-pink-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
