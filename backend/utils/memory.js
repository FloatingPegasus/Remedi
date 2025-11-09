import ConversationMemory from "../models/conversationMemoryModel.js";
import mongoose from "mongoose";

export async function getMemory(userId) {
  let memory = await ConversationMemory.findOne({ userId });

  if (!memory) {
    memory = new ConversationMemory({ userId });
    await memory.save();
  }

  return memory;
}

export async function updateMemory(userId, updates) {
  return await ConversationMemory.findOneAndUpdate(
    { userId },
    { ...updates, updatedAt: Date.now() },
    { new: true }
  );
}

export async function appendHistory(userId, role, content) {
  const memory = await getMemory(userId);

  const history = [...memory.conversationHistory, { role, content }];

  if (history.length > 20) history.shift(); // keep only last 20 msgs

  memory.conversationHistory = history;
  memory.updatedAt = Date.now();
  await memory.save();
}

export async function clearMemory(userId) {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    await ConversationMemory.deleteOne({ userId: objectId });
    console.log("✅ Memory cleared for:", userId);
  } catch (error) {
    console.error("❌ Failed to clear memory:", error);
  }
}
