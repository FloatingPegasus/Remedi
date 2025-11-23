import mongoose from "mongoose";

const SymptomEntrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  symptoms: [{ type: String }],
  severity: {
    type: String,
    enum: ["negligible", "mild", "moderate", "severe", "critical"],
    default: "moderate"
  },
  notes: { type: String, default: "" },
  source: { type: String, enum: ["chat", "manual"], default: "chat" }
});

const MoodEntrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  mood: { type: String },
  confidence: { type: Number, default: 0 }
});

const DigitalTwinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true
    },
    overallDocRecommendation: [{ type: String }], 
    summary: { type: String, default: "No summary generated yet." },
    symptomHistory: [SymptomEntrySchema],
    moodHistory: [MoodEntrySchema],
    specialityCounts: { type: Map, of: Number, default: {} },
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      default: "low"
    },
    trendSummary: { type: String, default: "" },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const DigitalTwin = mongoose.model("DigitalTwin", DigitalTwinSchema);

export default DigitalTwin;
