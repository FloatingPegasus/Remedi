import { groq, HEAVY_MODEL } from "../config/groqClient.js";

// Strict JSON extractor using 70B
export async function extractSymptoms(message) {
const prompt = `
Extract clinical information from the user's message.
If the user DENIES, REMOVES, or CORRECTS a previous condition, record this in "notes".

RETURN STRICT JSON ONLY:
{
  "symptoms": ["array", "of", "phrases"],
  "severity": "negligible" | "mild" | "moderate" | "severe" | "critical",
  "mood": "string" | null,
  "notes": "Short summary. If user denies a condition, state it explicitly here."
}

SEVERITY GUIDE:
- negligible: Minor annoyance (e.g. dry skin)
- mild: Noticeable but ignored (e.g. light itch)
- moderate: Interferes with focus (e.g. stomach ache)
- severe: Prevents daily tasks (e.g. high fever, migraine)
- critical: Emergency / Unbearable (e.g. chest pain, fainting)

Message: "${message.replace(/"/g, '\\"')}"
`;

  try {
    const resp = await groq.chat.completions.create({
      model: HEAVY_MODEL,
      messages: [
        { role: "system", content: "Extract structured symptom data. Respond with JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      max_tokens: 300
    });

    let output = resp.choices?.[0]?.message?.content?.trim();
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : "{}";

    return JSON.parse(jsonString);

  } catch (err) {
    console.warn("extractSymptoms failed, returning fallback", err?.message || err);
    return {
      symptoms: [],
      severity: "moderate",
      mood: null,
      speciality: null,
      notes: message
    };
  }
}
