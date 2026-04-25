import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let client: GoogleGenerativeAI | undefined;

export function getGemini() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set. Add it to .env.local.");
  }
  if (!client) client = new GoogleGenerativeAI(apiKey);
  return client;
}

export const GEMINI_MODEL = "gemini-2.0-flash";
