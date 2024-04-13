import { Router } from "express";
import { getRunningRecordings } from "../controllers/runningRecording";

const router = Router();

router.route("/").get(getRunningRecordings);

export default router;
