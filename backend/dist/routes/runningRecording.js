"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const runningRecording_1 = require("../controllers/runningRecording");
const router = (0, express_1.Router)();
router.route("/").get(runningRecording_1.getRunningRecordings);
exports.default = router;
//# sourceMappingURL=runningRecording.js.map