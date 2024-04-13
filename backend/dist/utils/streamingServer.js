"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const minioClient_1 = __importDefault(require("../utils/minioClient"));
const prisma = new client_1.PrismaClient();
const concatAndSendSocket = async (socket, id) => {
    if (!id) {
        socket.emit("error", "No ID provided");
        return;
    }
    const recording = await prisma.recording.findUnique({
        where: { id: parseInt(id) },
    });
    if (!recording) {
        socket.emit("error", "Couldn't fetch recording");
        return;
    }
    const bucketName = process.env.RECORDING_BUCKET_NAME || "";
    const objectNames = Array.from({ length: recording.recordingCount + 1 }, (_, index) => `${recording.name}_${index}.wav`);
    let i = 0;
    try {
        for (const file of objectNames) {
            const dataStream = await minioClient_1.default.getObject(bucketName, file);
            dataStream.on("data", (chunk) => {
                console.log(i++);
                socket.emit("recordingChunk", chunk);
            });
            dataStream.on("end", () => {
                console.log(`Finished streaming ${file}`);
                socket.emit("recordingFinished");
            });
            dataStream.on("error", (err) => {
                console.error("Error streaming file:", err);
                socket.emit("error", "Error streaming file");
            });
        }
    }
    catch (err) {
        console.error("Error streaming files:", err);
        socket.emit("error", "Error streaming files");
    }
};
exports.default = concatAndSendSocket;
//# sourceMappingURL=streamingServer.js.map