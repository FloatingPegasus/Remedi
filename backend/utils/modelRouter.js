import { groq, FAST_MODEL, HEAVY_MODEL } from "../config/groqClient.js";

/* 
   LAYER 1 — Broad Heuristic Filter
   Matches ANY symptom-like text using general medical patterns.
*/

const PATTERN_GROUPS = [
  /(pain|ache|aching|hurts|sore|stabbing|burning|cramping|sharp|dull)/i,
  /(difficulty|trouble|cannot|unable|struggling)/i,
  /(numb|tingling|dizzy|vertigo|faint|weak|shaky|blurred vision)/i,
  /(fever|temperature|breathless|shortness of breath|palpitations|heart racing)/i,
  /(anxious|stressed|panic|depressed|sad|overwhelmed)/i,
  /(swelling|redness|pus|infection|inflamed|bump)/i,
  /(vomit|vomiting|nausea|diarrhea|constipation|acid|gastric|stomach|abdomen)/i,
  /(period|cramps|pregnancy|pregnant|bleeding|uterus|vaginal)/i,
  /(stopped|gone|cured|don't have|do not have|lied|false|wrong diagnosis|incorrect)/i,
  /(rash|itch|itching|blister|lesion|wound|bruise)/i
];

/* 
   LAYER 2 — Complexity Rules
   Long, multi-symptom messages → heavy model.
*/

function isComplexMedical(message) {
  const lower = message.toLowerCase();
  const wordCount = lower.split(/\s+/).length;

  // multi-issue indicators
  const connector = /(,| and |;|\/|pain in|hurts|symptom|symptoms)/i;

  if (connector.test(lower) && wordCount > 10) return true;
  if (wordCount > 25) return true;

  return false;
}

/*
   MAIN FUNCTION:
   Heuristics first → if uncertain → LLM fallback (FAST_MODEL)
*/

export async function chooseModel(message) {
  const text = message.toLowerCase();

  // LAYER 1: Heuristic symptom category detection
  for (const regex of PATTERN_GROUPS) {
    if (regex.test(text)) return HEAVY_MODEL;
  }

  // LAYER 2: Complexity
  if (isComplexMedical(text)) return HEAVY_MODEL;

  // LAYER 3: Fast LLM fallback for ambiguous cases
  try {
    const classifierPrompt = `
Classify the user message as "medical" or "simple".
If it contains symptoms, body problems, pains, bodily sensations, sickness signs, or emotional distress → medical.
ONLY respond with one word.

Message: "${message}"
`;

    const resp = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        { role: "system", content: "Return only 'medical' or 'simple'. Nothing else." },
        { role: "user", content: classifierPrompt }
      ],
      max_tokens: 4,
      temperature: 0
    });

    const output = resp?.choices?.[0]?.message?.content?.toLowerCase() || "";
    if (output.includes("medical")) return HEAVY_MODEL;
    return FAST_MODEL;

  } catch (err) {
    console.warn("Model routing fallback error → using FAST_MODEL");
    return FAST_MODEL;
  }
}
