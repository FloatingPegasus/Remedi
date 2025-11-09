import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    date: { type: Number, default: Date.now }
})

const reminderModel = mongoose.models.reminder || mongoose.model("reminder", reminderSchema);
export default reminderModel;


