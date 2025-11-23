import express from "express";
import { groq, FAST_MODEL, HEAVY_MODEL } from "../config/groqClient.js";
import { runRAG } from "../utils/rag.js";
import { getMemory, updateMemory, appendHistory, clearMemory } from "../utils/memory.js";
import { chooseModel } from "../utils/modelRouter.js";
import { extractSymptoms } from "../utils/extractSymptoms.js";
import { appendEntry } from "../controllers/digitalTwinController.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();

// ✅ Chat endpoint requires login
router.post("/chat", authUser, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userId = req.body.userId;

    // ✅ Load memory (creates empty memory entry if not found)
    let memory = await getMemory(userId);

    // ✅ Add user message to memory history
    await appendHistory(userId, "user", message);

    // ✅ Run RAG (this now returns { context, matchedDoctors })
    const { context: ragContext, matchedDoctors, detectedCanonical } =
      await runRAG(message, { lastSpeciality: (memory.lastSpeciality || "") });


    // 1. DYNAMIC MODEL SWITCHING (The "Option C" Logic)
    // We ask the router: Is this simple (8B) or medical/complex (70B)?
    const selectedModel = await chooseModel(message);
    console.log(`🤖 Model Switched to: ${selectedModel} for user: ${userId}`);

    // 2. DIGITAL TWIN UPDATE (Only if medical/heavy)
    // If the router says it's medical (HEAVY_MODEL), we extract data for the twin.
    if (selectedModel === HEAVY_MODEL) {
      (async () => {
        try {
          console.log("🧬 Medical intent detected. Updating Digital Twin...");
          const extraction = await extractSymptoms(message);
          
          // Only save if actual symptoms were found
          if (extraction && (extraction.symptoms.length > 0 || extraction.notes)) {
            await appendEntry(userId, {
              symptoms: extraction.symptoms,
              severity: extraction.severity,
              notes: extraction.notes,
              mood: extraction.mood,
              matchedSpeciality: memory.lastSpeciality || null
            });
          }
        } catch (err) {
          console.error("❌ Digital Twin Background Update Failed:", err.message);
        }
      })();
    }

    const systemPrompt = `
You are Remedi AI, the intelligent assistant of the Remedi Healthcare Platform.

CURRENT MODE: ${selectedModel === HEAVY_MODEL ? "EXPERT MEDICAL ANALYSIS (70B)" : "GENERAL ASSISTANT (8B)"}

SAFETY RULES (IMPORTANT):
- You do NOT diagnose medical conditions.
- But you ARE allowed to give helpful, general explanations.
- You may explain common causes, possibilities, and usual scenarios for symptoms.
- Never say “I cannot diagnose,” say something useful instead.
- Always guide the user in a supportive way.

APPOINTMENT RULES (IMPORTANT):
- Never book appointments yourself.
- Never invent appointment times or dates.
- STRICT RULE: You must ONLY mention doctors listed in the "Matched Doctors" section below.
- If the "Matched Doctors" list is empty or says "No matching doctors found", you MUST say: "I could not find a specific specialist for this on Remedi, but a General Physician is usually a good start."
- NEVER invent names like "Dr. Smith" or "Dr. Doe". If the data isn't there, admit it.

CONCISE RESPONSE RULES:
- Keep every answer short: ideally 2–3 sentences.
- No long paragraphs.
- No lists unless asked.
- Avoid repeating the same sentence twice.

YOUR PURPOSE:
- Help the user understand what their symptoms MIGHT generally indicate.
- Provide common possibilities (without diagnosing).
- Tell them what signals to watch out for.
- Suggest which type of doctor could help.

CLARIFICATION RULE:
If the user's question is vague (e.g., "do you have any?", "who is available?"),
use the lastSpeciality from memory if it exists. Only if no lastSpeciality exists,
ask a short clarifying question: "Sure—what kind of doctor do you need?"
Do not say “I don’t have a doctor” unless you are sure no match exists.

CONTEXT CARRY-OVER:
When the user continues a conversation without naming a speciality,
assume they are still talking about the lastSpeciality stored in memory.

--- Conversation Memory ---
${memory.conversationHistory
  .map((m) => `${m.role}: ${m.content}`)
  .join("\n")}

--- Last Doctor Mentioned ---
${memory.lastDoctor ? JSON.stringify(memory.lastDoctor, null, 2) : "None"}

--- RAG Context (Doctors, Specialities, Features) ---
${ragContext}
`.trim();

    // ✅ Call Groq with the DYNAMICALLY SELECTED MODEL
    const response = await groq.chat.completions.create({
      model: selectedModel, // <--- Dynamic switching happens here
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300, // Increased slightly for 70B depth
      temperature: 0.2
    });

    const reply = response.choices[0].message.content;

    // ✅ Save assistant message to memory
    await appendHistory(userId, "assistant", reply);

    // ✅ Store matched doctor into memory (REAL object, not text)
    if (matchedDoctors && matchedDoctors.length > 0) {
      await updateMemory(userId, {
        lastDoctor: matchedDoctors[0]
      });
    }
    if (detectedCanonical) {
      await updateMemory(userId, { lastSpeciality: detectedCanonical });
    }

    return res.json({ reply });

  } catch (error) {
  console.error("🔥 AI Error:", error?.stack || error);
  return res.status(500).json({ error: "AI request failed", details: error?.message });
  }
});

router.post("/clear", authUser, async (req, res) => {
  try {
    await clearMemory(req.body.userId);
    return res.json({ success: true, message: "AI memory cleared" });
  } catch (err) {
    console.error("❌ Clear Memory Error:", err);
    return res.status(500).json({ error: "Failed to clear memory" });
  }
});

export default router;
