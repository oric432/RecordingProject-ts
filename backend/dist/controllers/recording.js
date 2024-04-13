"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatAndSend = exports.getRecordingObject = exports.getSingleRecording = exports.addRecording = exports.getAllRecordings = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const client_1 = require("@prisma/client");
const minioClient_1 = __importDefault(require("../utils/minioClient"));
const minio_1 = require("minio");
const wav_1 = require("wav");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const getAllRecordings = async (_req, res) => {
    const recordings = await prisma.recording.findMany({});
    if (!recordings || recordings.length === 0) {
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
const getSingleRecording = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new errors_1.BadRequestError("no id provided");
    }
    const recording = await prisma.recording.findUnique({
        where: { id: parseInt(id) },
    });
    if (!recording) {
        throw new errors_1.BadRequestError("couldn't fetch recording");
    }
    const bucketName = process.env.RECORDING_BUCKET_NAME || "";
    const urls = [];
    async function getPresignedUrl(index) {
        return new Promise((resolve, reject) => {
            const objectName = `${recording?.name}_${index}.wav`;
            minioClient_1.default.presignedGetObject(bucketName, objectName, (err, url) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(url);
                }
            });
        });
    }
    async function getPresignedUrls() {
        for (let index = 0; index <= (recording?.recordingCount || 0); index++) {
            try {
                const url = await getPresignedUrl(index);
                urls.push(url);
            }
            catch (error) {
                console.error(`Error getting presigned URL for index ${index}:`, error);
            }
        }
    }
    await getPresignedUrls();
    return res.json(urls);
};
exports.getSingleRecording = getSingleRecording;
const getRecordingObject = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new errors_1.BadRequestError("no id provided");
    }
    const recording = await prisma.recording.findUnique({
        where: { id: parseInt(id) },
    });
    if (!recording) {
        throw new errors_1.BadRequestError("couldn't fetch recording");
    }
    const bucketName = process.env.RECORDING_BUCKET_NAME || "";
    // const sourceList = Array.from(
    //     { length: recording.recordingCount },
    //     (_, index) =>
    //         new CopySourceOptions({
    //             Bucket: bucketName,
    //             Object: `${recording.name}_${index}.wav`,
    //         })
    // );
    const sourceList = [
        new minio_1.CopySourceOptions({
            Bucket: bucketName,
            Object: `${recording.name}_0.wav`,
        }),
        new minio_1.CopySourceOptions({
            Bucket: bucketName,
            Object: `${recording.name}_1.wav`,
        }),
        new minio_1.CopySourceOptions({
            Bucket: bucketName,
            Object: `${recording.name}_2.wav`,
        }),
    ];
    console.log(sourceList);
    const destOption = new minio_1.CopyDestinationOptions({
        Bucket: bucketName,
        Object: `${recording.name}.wav`,
    });
    const composePromise = minioClient_1.default.composeObject(destOption, sourceList);
    composePromise
        .then((result) => {
        console.log(result);
        console.log("Success...");
        res.status(http_status_codes_1.StatusCodes.OK).json({ data: result }); // Update this line
    })
        .catch((e) => {
        console.log("error", e);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: e }); // Update this line
    });
};
exports.getRecordingObject = getRecordingObject;
async function concatenateAndSendObjects(bucketName, objectNames, response) {
    response.setHeader("Content-Type", "audio/wav"); // Set appropriate MIME type
    // Write headers to the response before streaming any data
    response.writeHead(200);
    try {
        // Stream each object directly to the response
        for (const objectName of objectNames) {
            const stream = await minioClient_1.default.getObject(bucketName, objectName);
            stream.on("start", () => { });
            stream.on("data", (chunk) => {
                // Write each chunk to the response
                response.write(chunk);
            });
            stream.on("end", () => {
                return response.json("what");
            });
        }
    }
    catch (error) {
        console.error("Error streaming objects:", error);
        response.status(500).send("Internal Server Error");
        return response.json("what");
    }
}
// const concatAndSend = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     if (!id) {
//         throw new BadRequestError("no id provided");
//     }
//     const recording = await prisma.recording.findUnique({
//         where: { id: parseInt(id) },
//     });
//     if (!recording) {
//         throw new BadRequestError("couldn't fetch recording");
//     }
//     const bucketName = process.env.RECORDING_BUCKET_NAME || "";
//     const objectNames = Array.from(
//         { length: recording.recordingCount + 1 },
//         (_, index) => `${recording.name}_${index}.wav`
//     );
//     console.log(objectNames);
//     concatenateAndSendObjects(bucketName, objectNames, res);
// };
// const concatAndSend = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     if (!id) {
//         throw new BadRequestError("No ID provided");
//     }
//     const recording = await prisma.recording.findUnique({
//         where: { id: parseInt(id) },
//     });
//     if (!recording) {
//         throw new BadRequestError("Couldn't fetch recording");
//     }
//     const bucketName = process.env.RECORDING_BUCKET_NAME || "";
//     const objects = await Promise.all(
//         Array.from(
//             { length: recording.recordingCount + 1 },
//             async (_, index) =>
//                 await minioClient.getObject(
//                     bucketName,
//                     `${recording.name}_${index}.wav`
//                 )
//         )
//     );
//     res.writeHead(200, {
//         "Content-Type": "audio/wav",
//         "Transfer-Encoding": "chunked",
//         Connection: "Keep-Alive",
//     });
//     console.log("object length", objects.length);
//     function sendAllObjects() {
//         for (let index = 0; index < objects.length; index++) {
//             const objStream = objects[index];
//             objStream.on("error", (err: Error) => {
//                 console.error(`Error fetching object: ${err}`);
//                 res.end();
//             });
//             objStream.on("data", (chunk: Buffer) => {
//                 res.write(chunk);
//             });
//             objStream.on("end", () => {
//                 console.log("Object sent successfully");
//                 // Cleanup resources
//                 objStream.removeAllListeners();
//                 if (index === objects.length - 1) {
//                     console.log("All objects sent");
//                     res.end();
//                 }
//             });
//         }
//     }
//     sendAllObjects();
// };
function roughSizeOfObject(object) {
    const objectList = [];
    const stack = [object];
    let bytes = 0;
    while (stack.length) {
        const value = stack.pop();
        switch (typeof value) {
            case "boolean":
                bytes += 4;
                break;
            case "string":
                bytes += value.length * 2;
                break;
            case "number":
                bytes += 8;
                break;
            case "object":
                if (!objectList.includes(value)) {
                    objectList.push(value);
                    for (const prop in value) {
                        if (Object.prototype.hasOwnProperty.call(value, prop)) {
                            stack.push(value[prop]);
                        }
                    }
                }
                break;
        }
    }
    return bytes;
}
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
    const objectNames = Array.from({ length: recording.recordingCount + 1 }, (_, index) => `${recording.name}_${index}.wav`);
    const outputFile = "concatenated_recording.wav";
    const writer = new wav_1.FileWriter(outputFile, {
        channels: 1,
        sampleRate: 44100,
        bitDepth: 16,
    });
    try {
        // Iterate over each file and append its data to the FileWriter
        for (const file of objectNames) {
            const dataStream = await minioClient_1.default.getObject(bucketName, file);
            console.log("file size of ", file, " ", roughSizeOfObject(dataStream));
            dataStream.on("data", (chunk) => {
                writer.write(chunk);
            });
            dataStream.on("end", () => {
                if (file === objectNames[objectNames.length - 1]) {
                    writer.end();
                }
            });
        }
        console.log("something");
        writer.on("done", () => {
            res.sendFile(path_1.default.join(__dirname, "..", "..", outputFile));
        });
    }
    catch (err) {
        console.error("Error streaming files:", err);
        res.writeHead(500);
        res.end("Error streaming files");
    }
};
exports.concatAndSend = concatAndSend;
//# sourceMappingURL=recording.js.map