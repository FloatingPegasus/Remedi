import doctorModel from "../models/doctorModel.js";

const canonicalToDisplay = {
  general: ["General physician"],
  gyne: ["Gynecologist"],
  derm: ["Dermatologist"],
  pediatric: ["Pediatricians"],
  neuro: ["Neurologist"],
  gastro: ["Gastroenterologist"]
};

const keywordToCanonical = {
  fever: "general",
  cold: "general",
  cough: "general",
  flu: "general",
  weakness: "general",
  fatigue: "general",
  headache: "general",
  "body ache": "general",

  pregnancy: "gyne",
  period: "gyne",
  pcos: "gyne",
  pcod: "gyne",
  menstrual: "gyne",

  skin: "derm",
  acne: "derm",
  dandruff: "derm",
  allergy: "derm",
  redness: "derm",
  rash: "derm",

  child: "pediatric",
  children: "pediatric",
  kid: "pediatric",
  kids: "pediatric",
  pediatric: "pediatric",
  paediatric: "pediatric",
  "child specialist": "pediatric",

  neuro: "neuro",
  migraine: "neuro",
  seizure: "neuro",
  epilepsy: "neuro",
  numbness: "neuro",

  gastro: "gastro",
  acidity: "gastro",
  gas: "gastro",
  bloating: "gastro",
  nausea: "gastro",
  vomiting: "gastro",
  diarrhea: "gastro",
  constipation: "gastro",
  "stomach pain": "gastro",
  "stomach ache": "gastro"
};

function detectCanonical(q) {
  for (const key in keywordToCanonical) {
    if (q.includes(key)) return keywordToCanonical[key];
  }
  return "";
}

function specialityMatchesCanonical(spec, canonical) {
  if (!canonical) return false;

  const display = canonicalToDisplay[canonical] || [];
  const specL = (spec || "").toLowerCase();

  return display.some((d) => specL.includes(d.toLowerCase()));
}

export const runRAG = async (rawQuery = "", opts = {}) => {
  const lastSpeciality = opts.lastSpeciality || ""; 
  const query = (rawQuery || "").toLowerCase().trim();
  const detectedCanonical = detectCanonical(query);
  let effectiveCanonical = detectedCanonical;
  if (!effectiveCanonical && lastSpeciality) {
    effectiveCanonical = lastSpeciality.toLowerCase();
  }

  const doctors = await doctorModel.find(
    {},
    "name speciality experience fees about address available"
  ).lean();

  const scored = doctors.map((doc) => {
    const name = (doc.name || "").toLowerCase();
    const spec = (doc.speciality || "").toLowerCase();
    const about = (doc.about || "").toLowerCase();

    let score = 0;

    if (query && name.includes(query)) score += 2;
    if (query && spec.includes(query)) score += 3;
    if (query && about.includes(query)) score += 1;

    if (effectiveCanonical && specialityMatchesCanonical(spec, effectiveCanonical)) {
      score += 5;
    }

    return { doc, score };
  });

  let matchedDoctors = scored
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > 0)
    .map((x) => x.doc);

  if (!query && !effectiveCanonical) {
    matchedDoctors = doctors.slice().sort((a, b) => Number(b.available) - Number(a.available));
  }

  matchedDoctors = matchedDoctors.slice(0, 8);

  let doctorContext = "";
  for (const d of matchedDoctors) {
    doctorContext += `
Doctor:
- Name: ${d.name}
- Speciality: ${d.speciality}
- Experience: ${d.experience}
- Fees: ₹${d.fees}
- Available: ${d.available ? "Yes" : "No"}
- About: ${d.about}
- Address: ${(d.address?.line1 || "") + ", " + (d.address?.line2 || "")}
`;
  }

  const availableSpecs = Object.values(canonicalToDisplay)
    .flat()
    .map((s) => `• ${s}`)
    .join("\n");

  const featureContext = `
• Book appointments
• View doctor details
• Pay online
• Medicine reminders
`;

  return {
    context: `
=== REMEDI CONTEXT START ===
${effectiveCanonical ? `Detected Speciality: ${effectiveCanonical}\n` : ""}
Supported Specialities:
${availableSpecs}

${doctorContext ? `Matched Doctors:\n${doctorContext}` : "No matching doctors found."}

Platform Features:
${featureContext}
=== REMEDI CONTEXT END ===
    `.trim(),
    matchedDoctors
  };
};
