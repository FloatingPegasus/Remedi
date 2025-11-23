import mongoose from "mongoose";
import DigitalTwin from "../models/digitalTwinModel.js";
import ConversationMemory from "../models/conversationMemoryModel.js";
import axios from "axios";
import { groq } from "../config/groqClient.js";

const GROQ_API_URL = process.env.GROQ_API_URL || "https://api.groq.ai/v1";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL_DEFAULT = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

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
    const pushObj = {
      $push: {
        symptomHistory: {
          date: new Date(),
          symptoms: Array.isArray(symptoms) ? symptoms : [],
          severity: ["mild", "moderate", "severe"].includes(severity) ? severity : "moderate",
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

export async function regenerateSummary(req, res) {
  try {
    const { userId } = req.params;
    if (!ensureValidUserId(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const twin = await DigitalTwin.findOne({ userId });
    if (!twin) return res.status(404).json({ success: false, message: "No digital twin found" });

    const payload = {
      promptType: "digital_twin_summary",
      data: {
        symptomHistory: (twin.symptomHistory || []).slice(-60),
        moodHistory: (twin.moodHistory || []).slice(-60)
      }
    };

// ✅ FIX: Use the groq client instead of axios
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { 
          role: "system", 
          content: "You are a medical analyst. Read the following symptom history JSON and write a concise, helpful summary of the user's health trends, risk factors, and potential improvements. Keep it under 100 words." 
        },
        { 
          role: "user", 
          content: JSON.stringify(payload) 
        }
      ],
      temperature: 0.5
    });

    const output = response.choices[0]?.message?.content || "No summary generated.";
    twin.trendSummary = output;
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
