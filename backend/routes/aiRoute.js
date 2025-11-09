import express from "express";
import OpenAI from "openai";
import { runRAG } from "../utils/rag.js";
import { getMemory, updateMemory, appendHistory, clearMemory } from "../utils/memory.js";
import authUser from "../middleware/authUser.js";

const router = express.Router();

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY
});

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


    // ✅ Enhanced system prompt
    const systemPrompt = `
You are Remedi AI, the intelligent assistant of the Remedi Healthcare Platform.

SAFETY RULES (IMPORTANT):
- You do NOT diagnose medical conditions.
- But you ARE allowed to give helpful, general explanations.
- You may explain common causes, possibilities, and usual scenarios for symptoms.
- Never say “I cannot diagnose,” say something useful instead.
- Always guide the user in a supportive way.

APPOINTMENT RULES (IMPORTANT):
- Never book appointments yourself.
- Never invent appointment times or dates.
- You MUST ONLY mention doctors listed under “Matched Doctors”. 
  If a doctor is NOT listed there, you must say “I do not have any doctor for this speciality on Remedi.”
  NEVER mention or create any doctor whose name is not provided in the Matched Doctors list.
- If no suitable doctor exists in the database, say: “I don’t have a matching doctor for that speciality on Remedi.”

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

    // ✅ Call Groq Llama 3.1 8B
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 200,
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
