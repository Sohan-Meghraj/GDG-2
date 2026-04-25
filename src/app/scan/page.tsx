"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/lib/auth-context";
import { Loader2, ScanLine, AlertCircle, Clock } from "lucide-react";

const LAST_SCAN_KEY = "eventconnect:lastScan";

function extractProfileId(text: string): string | null {
  // Try as full URL
  try {
    const url = new URL(text);
    const match = url.pathname.match(/\/profile\/([^/?#]+)/);
    if (match) return match[1];
  } catch {
    // not a URL — fall through
  }
  // Try as a path or raw id
  const m = text.match(/\/profile\/([^/?#]+)/);
  if (m) return m[1];
  // If it's plausibly a raw uid (no slashes, no spaces)
  if (/^[A-Za-z0-9_-]{8,}$/.test(text.trim())) return text.trim();
  return null;
}

export default function ScanPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<{ id: string; at: number } | null>(
    null
  );

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_SCAN_KEY);
      if (raw) setLastScan(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (loading || !user || !profile) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const scanner = new Html5Qrcode("qr-region");
    scannerRef.current = scanner;

    const onSuccess = (decoded: string) => {
      const id = extractProfileId(decoded);
      if (!id) return;
      try {
        localStorage.setItem(
          LAST_SCAN_KEY,
          JSON.stringify({ id, at: Date.now() })
        );
      } catch {
        // ignore
      }
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {})
        .finally(() => {
          router.push(`/profile/${id}`);
        });
    };

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        onSuccess,
        undefined
      )
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "Camera unavailable.";
        setCameraError(msg);
      });

    return () => {
      const s = scannerRef.current;
      if (!s) return;
      s.stop()
        .then(() => s.clear())
        .catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, profile]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError(null);
    const id = extractProfileId(manualInput);
    if (!id) {
      setManualError("Couldn't find a profile in that text.");
      return;
    }
    router.push(`/profile/${id}`);
  };

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
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
          <ScanLine className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Scan a badge</h1>
        <p className="mt-1 text-sm text-white/60">
          Point your camera at someone&apos;s QR code.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-black">
        <div
          id="qr-region"
          className="aspect-square w-full"
          style={{ minHeight: 280 }}
        />
      </div>

      {cameraError && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Camera unavailable</p>
            <p className="mt-0.5 text-xs text-yellow-200/70">{cameraError}</p>
            <p className="mt-0.5 text-xs text-yellow-200/70">
              You can still paste a profile URL below.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="card mt-5 space-y-3">
        <label className="text-sm font-medium text-white/80">
          Or paste a profile URL
        </label>
        <input
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="https://eventconnect.app/profile/..."
          className="input"
        />
        {manualError && (
          <p className="text-xs text-red-300">{manualError}</p>
        )}
        <button type="submit" className="btn btn-secondary w-full">
          Open profile
        </button>
      </form>

      {lastScan && (
        <Link
          href={`/profile/${lastScan.id}`}
          className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
        >
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Clock className="h-4 w-4" />
            <span>Last scanned</span>
          </div>
          <span className="text-xs text-indigo-300">View again →</span>
        </Link>
      )}
    </main>
  );
}
