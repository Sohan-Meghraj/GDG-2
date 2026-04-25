"use client";

import { useAuth } from "@/lib/auth-context";

export function ErrorBanner() {
  const { error } = useAuth();
  if (!error) return null;
  return (
    <div className="sticky top-0 z-40 w-full border-b border-red-500/40 bg-red-950/90 px-4 py-2 text-sm text-red-100 backdrop-blur">
      <strong>Connection issue:</strong> {error}{" "}
      <button
        onClick={() => location.reload()}
        className="ml-2 underline"
      >
        Retry
      </button>
    </div>
  );
}
