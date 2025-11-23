import doctorModel from "../models/doctorModel.js";
import { groq, FAST_MODEL } from "../config/groqClient.js"; // Import Groq

// Map internal AI labels to database specialities
const canonicalToDisplay = {
  general: ["General physician"],
  gyne: ["Gynecologist"],
  derm: ["Dermatologist"],
  pediatric: ["Pediatricians"],
  neuro: ["Neurologist"],
  gastro: ["Gastroenterologist"]
};

// Helper: Check if a doctor's speciality matches the AI's category
function specialityMatchesCanonical(spec, canonical) {
  if (!canonical) return false;
  const display = canonicalToDisplay[canonical] || [];
  const specL = (spec || "").toLowerCase();
  return display.some((d) => specL.includes(d.toLowerCase()));
}

async function classifyQuery(query) {
  if (!query) return "";
  
  try {
    const response = await groq.chat.completions.create({
      model: FAST_MODEL,
      messages: [
        {
          role: "system",
          content: `Classify the user's medical symptom into one of these labels:
          - derm (skin, hair, scalp, rash, itch, lice, tick)
          - gastro (stomach, digest, vomit, poop)
          - neuro (brain, head, nerve, dizzy)
          - pediatric (child, baby, kid)
          - gyne (woman, period, pregnancy)
          - general (flu, fever, body ache, cold, or UNSURE)

          Return ONLY the label word. Nothing else.`
        },
        { role: "user", content: query }
      ],
      temperature: 0,
      max_tokens: 10
    });

    return response.choices[0]?.message?.content?.trim().toLowerCase() || "";
  } catch (err) {
    console.error("Classification failed:", err.message);
    return ""; // Fallback to broad search
  }
}

export const runRAG = async (rawQuery = "", opts = {}) => {
  const query = (rawQuery || "").toLowerCase().trim();
  
  // 1. Ask AI which speciality this is (Async)
  let effectiveCanonical = await classifyQuery(query);

  // 2. Fallback to memory if AI didn't find a strong match but we have context
  if ((!effectiveCanonical || effectiveCanonical === "general") && opts.lastSpeciality) {
    effectiveCanonical = opts.lastSpeciality.toLowerCase();
  }

  // 3. Fetch Doctors
  const doctors = await doctorModel.find(
    {},
    "name speciality experience fees about address available"
  ).lean();

  // 4. Score Doctors
  const scored = doctors.map((doc) => {
    const name = (doc.name || "").toLowerCase();
    const spec = (doc.speciality || "").toLowerCase();
    const about = (doc.about || "").toLowerCase();

    let score = 0;

    if (query && name.includes(query)) score += 10; // Name match is highest priority
    if (query && spec.includes(query)) score += 5;
    
    if (effectiveCanonical && specialityMatchesCanonical(spec, effectiveCanonical)) {
      score += 20;
    }

    return { doc, score };
  });

  // 5. Sort & Filter
  let matchedDoctors = scored
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > 0)
    .map((x) => x.doc);

  // Fallback: If no query, just show available doctors
  if (!query && !effectiveCanonical) {
    matchedDoctors = doctors.slice().sort((a, b) => Number(b.available) - Number(a.available));
  }

  matchedDoctors = matchedDoctors.slice(0, 5); // Limit to top 5

  // 6. Build Context String
  let doctorContext = "";
  for (const d of matchedDoctors) {
    doctorContext += `
Doctor:
- Name: ${d.name}
- Speciality: ${d.speciality}
- Experience: ${d.experience}
- Fees: ₹${d.fees}
- Address: ${(d.address?.line1 || "")}
`;
  }

  const availableSpecs = Object.values(canonicalToDisplay)
    .flat()
    .map((s) => `• ${s}`)
    .join("\n");

  return {
    context: `
=== REMEDI CONTEXT ===
Detected Category: ${effectiveCanonical || "None"}
Available Specialities on Platform:
${availableSpecs}

Matched Doctors (Recommend ONLY these):
${doctorContext ? doctorContext : "No specific matching doctors found on Remedi."}
======================
    `.trim(),
    matchedDoctors,
    detectedCanonical: effectiveCanonical
  };
};