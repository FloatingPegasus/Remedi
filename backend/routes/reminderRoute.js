import express from 'express';
import { addReminder, getUserReminders, deleteReminder } from '../controllers/reminderController.js';
import authUser from '../middleware/authUser.js';

const reminderRouter = express.Router();

// All routes require user authentication
reminderRouter.post("/add", authUser, addReminder);
reminderRouter.get("/list", authUser, getUserReminders);
reminderRouter.delete("/:id", authUser, deleteReminder);

export default reminderRouter;


