import express from "express";
import { getTwin, regenerateSummary, exportPdf, clearTwin } from "../controllers/digitalTwinController.js";
import auth from "../middleware/authUser.js";

const router = express.Router();

router.get("/:userId", getTwin);
router.post("/summary/:userId", auth, regenerateSummary);
router.get("/export/:userId", auth, exportPdf);
router.delete("/clear", auth, clearTwin);

export default router;
