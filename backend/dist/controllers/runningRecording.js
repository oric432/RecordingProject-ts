"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRunningRecordings = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRunningRecordings = async (_req, res) => {
    const runningRecordings = await prisma.runningRecording.findMany({});
    if (!runningRecordings || runningRecordings.length === 0) {
        throw new errors_1.BadRequestError("could not fetch running recordings");
    }
    return res.status(http_status_codes_1.StatusCodes.OK).json({
        msg: "fetched running recordings successfully",
        data: runningRecordings,
    });
};
exports.getRunningRecordings = getRunningRecordings;
//# sourceMappingURL=runningRecording.js.map