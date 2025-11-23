import express from "express";
import { getTwin, regenerateSummary, exportPdf } from "../controllers/digitalTwinController.js";
import auth from "../middleware/authUser.js";

const router = express.Router();

router.get("/:userId", getTwin);
router.post("/summary/:userId", auth, regenerateSummary);
router.get("/export/:userId", auth, exportPdf);

export default router;
