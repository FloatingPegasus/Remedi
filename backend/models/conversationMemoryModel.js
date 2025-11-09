import mongoose from "mongoose";

const conversationMemorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },

  lastDoctor: { type: Object, default: null },   // stores name, speciality, address
  lastSpeciality: { type: String, default: "" },

  conversationHistory: {
    type: [
      {
        role: String,      // "user" or "assistant"
        content: String
      }
    ],
    default: []
  },

  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ConversationMemory", conversationMemorySchema);
