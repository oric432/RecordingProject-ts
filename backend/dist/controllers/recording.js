"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatAndSend = exports.addRecording = exports.getAllRecordings = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const client_1 = require("@prisma/client");
const minioClient_1 = __importDefault(require("../utils/minioClient"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const getAllRecordings = async (_req, res) => {
    const recordings = await prisma.recording.findMany({});
    if (!recordings) {
        throw new errors_1.NotFoundError("couldn't fetch recordings");
    }
    return res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ msg: "recordings fetched successfully", data: recordings });
};
exports.getAllRecordings = getAllRecordings;
const addRecording = async (req, res) => {
    const recording = await prisma.recording.create({
        data: { ...req.body },
    });
    if (!recording) {
        throw new errors_1.BadRequestError("couldn't create recording");
    }
    return res
        .status(http_status_codes_1.StatusCodes.OK)
        .json({ msg: "recording created successfully", data: recording });
};
exports.addRecording = addRecording;
const concatAndSend = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new errors_1.BadRequestError("No ID provided");
    }
    const recording = await prisma.recording.findUnique({
        where: { id: parseInt(id) },
    });
    if (!recording) {
        throw new errors_1.BadRequestError("Couldn't fetch recording");
    }
    const bucketName = process.env.RECORDING_BUCKET_NAME || "";
    try {
        const dataStream = await minioClient_1.default.getObject(bucketName, `${recording.name}.wav`);
        res.setHeader("Content-disposition", `attachment; filename=${recording.name}`);
        res.setHeader("Content-type", "audio/wav");
        dataStream.pipe(res);
    }
    catch (error) {
        console.error("Error streaming files:", error);
        res.writeHead(500);
        res.end("Error streaming files");
    }
};
exports.concatAndSend = concatAndSend;
//# sourceMappingURL=recording.js.map