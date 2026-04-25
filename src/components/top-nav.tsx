"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LogOut, ScanLine, IdCard, Users, Sparkles, Bot } from "lucide-react";

export function TopNav() {
  const { user, profile, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>EventConnect</span>
        </Link>
        {user && profile && (
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/badge" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white">
              <IdCard className="h-4 w-4" /> <span className="hidden sm:inline">Badge</span>
            </Link>
            <Link href="/scan" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white">
              <ScanLine className="h-4 w-4" /> <span className="hidden sm:inline">Scan</span>
            </Link>
            <Link href="/agent" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white">
              <Bot className="h-4 w-4" /> <span className="hidden sm:inline">AI Buddy</span>
            </Link>
            <Link href="/connections" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white/70 hover:bg-white/5 hover:text-white">
              <Users className="h-4 w-4" /> <span className="hidden sm:inline">Connections</span>
            </Link>
            <button
              onClick={signOutUser}
              className="ml-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
