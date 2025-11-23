import mongoose from "mongoose";
import DigitalTwin from "../models/digitalTwinModel.js";
import { groq, HEAVY_MODEL } from "../config/groqClient.js";

function computeRiskLevel(symptomHistory = []) {
  const recent = (symptomHistory || []).filter(
    (e) => Date.now() - new Date(e.date) < 1000 * 60 * 60 * 24 * 30
  );
  const severeCount = recent.filter((e) => e.severity === "severe").length;
  const freq = recent.length;
  if (severeCount >= 1 || freq >= 6) return "high";
  if (freq >= 3) return "moderate";
  return "low";
}

function ensureValidUserId(userId) {
  if (!userId) return false;
  if (typeof userId !== "string") return false;
  if (userId === "null") return false;
  return mongoose.Types.ObjectId.isValid(userId);
}

export async function getTwin(req, res) {
  try {
    const { userId } = req.params;
    if (!ensureValidUserId(userId)) {
      return res.status(200).json({ success: false, digitalTwin: null });
    }

    const twin = await DigitalTwin.findOne({ userId });
    if (!twin) {
      return res.status(200).json({ success: false, digitalTwin: null });
    }
    return res.status(200).json({ success: true, digitalTwin: twin });
  } catch (err) {
    console.error("getTwin ERROR:", err?.message || err);
    return res.status(500).json({ success: false, digitalTwin: null });
  }
}

export async function appendEntry(userId, parsed = {}) {
  if (!ensureValidUserId(userId)) {
    throw new Error("Invalid userId");
  }

  console.log("TWIN appendEntry called → userId:", userId);
  console.log("TWIN appendEntry payload:", parsed);

  const {
    symptoms = [],
    severity = "moderate",
    notes = "",
    mood = null,
    moodConfidence = 0,
    matchedSpeciality = null,
    source = "chat"
  } = parsed;

  try {
    const validSeverities = ["negligible", "mild", "moderate", "severe", "critical"];
    const pushObj = {
      $push: {
        symptomHistory: {
          date: new Date(),
          symptoms: Array.isArray(symptoms) ? symptoms : [],
          severity: validSeverities.includes(severity) ? severity : "moderate",
          notes: typeof notes === "string" ? notes : String(notes),
          source
        }
      },
      $set: { lastUpdated: new Date() }
    };

    if (mood) {
      pushObj.$push.moodHistory = {
        date: new Date(),
        mood,
        confidence: typeof moodConfidence === "number" ? moodConfidence : 0
      };
    }

    if (matchedSpeciality) {
      pushObj.$inc = { [`specialityCounts.${matchedSpeciality}`]: 1 };
    }

    const upsertOptions = { upsert: true, new: true, setDefaultsOnInsert: true };
    const twin = await DigitalTwin.findOneAndUpdate({ userId }, pushObj, upsertOptions);

    if (!twin) {
      console.warn("TWIN upsert returned null — userId:", userId);
      return null;
    }

    const risk = computeRiskLevel(twin.symptomHistory || []);
    twin.riskLevel = risk;
    twin.lastUpdated = new Date();
    await twin.save();

    return twin;
  } catch (err) {
    console.error("TWIN appendEntry ERROR:", err?.message || err);
    throw err;
  }
}

const VALID_SPECIALITIES = [
  "General physician",
  "Gynecologist",
  "Dermatologist",
  "Pediatricians",
  "Neurologist",
  "Gastroenterologist"
];

export async function regenerateSummary(req, res) {
  try {
    const { userId } = req.params;
    if (!ensureValidUserId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const twin = await DigitalTwin.findOne({ userId });
    if (!twin) return res.status(404).json({ success: false, message: "No digital twin found" });

    const payload = {
      symptomHistory: (twin.symptomHistory || []).slice(-60),
      moodHistory: (twin.moodHistory || []).slice(-60)
    };

    const response = await groq.chat.completions.create({
      model: HEAVY_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a senior medical consultant AI. Analyze the patient's entire symptom history to find correlations (e.g., tick bite + leg pain -> possible tick-borne illness).

          TASKS:
          1. "summaryText": A concise, professional health summary (under 100 words).
          2. "recommendedSpecialists": A list of 1-2 specialist types.

          CRITICAL INVENTORY RULE:
          You must ONLY recommend specialists from this exact list: ${JSON.stringify(VALID_SPECIALITIES)}.
          
          If the ideal specialist (e.g., Infectious Disease, Orthopedist) is not in the list, you MUST map it to the best available option from the list (e.g., map Infectious Disease -> General physician).

          Return STRICT JSON only.`
        },
        {
          role: "user",
          content: JSON.stringify(payload)
        }
      ],
      temperature: 0.2
    });

    let output = response.choices[0]?.message?.content || "{}";
    
    output = output.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedOutput;    
    try {
        parsedOutput = JSON.parse(output); 
    } catch (e) {
        console.error("JSON Parse Error in Summary:", e);
        parsedOutput = { 
            summaryText: "Could not generate structured summary. Please try refreshing.", 
            recommendedSpecialists: ["General physician"] 
        };
    }

    twin.summary = parsedOutput.summaryText || "No summary available.";
    twin.trendSummary = parsedOutput.summaryText;
    twin.overallDocRecommendation = parsedOutput.recommendedSpecialists || [];
    twin.lastUpdated = new Date();
    
    await twin.save();

    return res.status(200).json({ success: true, digitalTwin: twin });
  } catch (err) {
    console.error("regenerateSummary ERROR:", err?.message || err);
    return res.status(500).json({ success: false, message: "Failed to regenerate summary" });
  }
}

export async function exportPdf(req, res) {
  try {
    const { userId } = req.params;
    if (!ensureValidUserId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }
    const twin = await DigitalTwin.findOne({ userId });
    if (!twin) return res.status(404).json({ success: false, message: "No digital twin found" });
    return res.status(200).json({ success: true, digitalTwin: twin });
  } catch (err) {
    console.error("exportPdf ERROR:", err?.message || err);
    return res.status(500).json({ success: false, message: "Failed to export digital twin" });
  }
}

export async function clearTwin(req, res) {
  try {
    const userId = req.body.userId; 
    
    if (!ensureValidUserId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    await DigitalTwin.deleteOne({ userId });
    
    console.log(`🗑️ Digital Twin deleted for user: ${userId}`);
    return res.status(200).json({ success: true, message: "Digital Twin cleared successfully" });
  } catch (err) {
    console.error("clearTwin ERROR:", err?.message || err);
    return res.status(500).json({ success: false, message: "Failed to clear Digital Twin" });
  }
}