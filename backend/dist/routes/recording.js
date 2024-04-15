"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const recording_1 = require("../controllers/recording");
const router = (0, express_1.Router)();
router.route("/").get(recording_1.getAllRecordings).post(recording_1.addRecording);
router.route("/object/:id").get(recording_1.concatAndSend);
exports.default = router;
//# sourceMappingURL=recording.js.map