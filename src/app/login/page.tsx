"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, loading, signInGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(profile ? "/badge" : "/onboarding");
    }
  }, [user, profile, loading, router]);

  return (
    <main className="grid min-h-[80vh] place-items-center px-4">
      <div className="card w-full max-w-sm text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-xl shadow-indigo-500/30">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-white/60">
          Sign in to access your badge and connections.
        </p>
        <button
          onClick={async () => {
            setSigningIn(true);
            try {
              await signInGoogle();
            } finally {
              setSigningIn(false);
            }
          }}
          disabled={signingIn || loading}
          className="btn btn-primary mt-6 w-full py-3"
        >
          {signingIn || loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.84 0 3.06.78 3.76 1.45l2.56-2.46C16.78 3.99 14.66 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.65 8.65-8.79 0-.59-.06-1.04-.15-1.51z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>
        <p className="mt-5 text-xs text-white/40">
          By signing in you agree to be cool to other humans.
        </p>
      </div>
    </main>
  );
}
