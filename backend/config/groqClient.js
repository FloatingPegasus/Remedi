import OpenAI from "openai";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.warn("⚠️ GROQ_API_KEY not set in env");
}

export const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: GROQ_API_KEY
});

// Models
export const FAST_MODEL = process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant";
export const HEAVY_MODEL = process.env.GROQ_HEAVY_MODEL || "llama-3.3-70b-versatile";
