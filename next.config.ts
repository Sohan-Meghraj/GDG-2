import type { NextConfig } from "next";

// Supabase URL + anon key are public-by-design (RLS enforces access).
// Hardcoding them here ensures they're inlined into the client bundle
// regardless of how the build is invoked.
const SUPABASE_URL = "https://afxqwpaolvaccbguxzdj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmeHF3cGFvbHZhY2NiZ3V4emRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTYwODEsImV4cCI6MjA5MjY5MjA4MX0.xiwFgXtPIPJBZv73XO3Y-gdggr6nu0a0PKQJItjgdk0";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
