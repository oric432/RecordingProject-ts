import { Router } from "express";
import {
    getAllRecordings,
    addRecording,
    concatAndSend,
} from "../controllers/recording";

const router = Router();

router.route("/").get(getAllRecordings).post(addRecording);
router.route("/object/:id").get(concatAndSend);

export default router;
