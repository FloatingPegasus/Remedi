import reminderModel from "../models/reminderModel.js";

// API to add a new reminder
const addReminder = async (req, res) => {
    try {
        const { userId, medicineName, dosage, time } = req.body;

        // Validate all required fields
        if (!medicineName || !dosage || !time) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const reminderData = {
            userId,
            medicineName,
            dosage,
            time,
            date: Date.now()
        };

        const newReminder = new reminderModel(reminderData);
        await newReminder.save();

        console.log(`✅ Reminder added: ${medicineName} for user ${userId}`);
        res.json({ success: true, message: "Reminder added successfully" });

    } catch (error) {
        console.error("❌ Error in addReminder:", error);
        res.json({ success: false, message: error.message });
    }
};

// API to get all reminders for a user
const getUserReminders = async (req, res) => {
    try {
        const { userId } = req.body;

        const reminders = await reminderModel.find({ userId }).sort({ date: -1 });
        
        res.json({ success: true, reminders });

    } catch (error) {
        console.error("❌ Error in getUserReminders:", error);
        res.json({ success: false, message: error.message });
    }
};

// API to delete a reminder
const deleteReminder = async (req, res) => {
    try {
        const { userId } = req.body;
        const { id } = req.params;

        // Find the reminder and verify it belongs to the user
        const reminder = await reminderModel.findById(id);

        if (!reminder) {
            return res.json({ success: false, message: "Reminder not found" });
        }

        // Check if reminder belongs to the authenticated user
        if (reminder.userId.toString() !== userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        await reminderModel.findByIdAndDelete(id);

        console.log(`✅ Reminder deleted: ${id}`);
        res.json({ success: true, message: "Reminder deleted successfully" });

    } catch (error) {
        console.error("❌ Error in deleteReminder:", error);
        res.json({ success: false, message: error.message });
    }
};

export {
    addReminder,
    getUserReminders,
    deleteReminder
};


