import { Router } from "express";
import {
    getAllRecordings,
    addRecording,
    getSingleRecording,
    concatAndSend,
} from "../controllers/recording";

const router = Router();

router.route("/").get(getAllRecordings).post(addRecording);
router.route("/:id").get(getSingleRecording);
router.route("/object/:id").get(concatAndSend);

export default router;
