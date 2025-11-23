import { groq, HEAVY_MODEL } from "../config/groqClient.js";

// Strict JSON extractor using 70B
export async function extractSymptoms(message) {
  const prompt = `
Extract clinical information from the user's message.
RETURN STRICT JSON ONLY with keys:
symptoms: array of short phrases
severity: "mild"|"moderate"|"severe"
mood: string|null
speciality: string|null
notes: short human summary (15-25 words)
NO markdown, NO explanation.

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
