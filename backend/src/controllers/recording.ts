import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors";
import { PrismaClient } from "@prisma/client";
import minioClient from "../utils/minioClient";
import { FileWriter } from "wav";
import dotenv from "dotenv";
import path from "path";
import { unlinkSync } from "fs";

dotenv.config();

const prisma = new PrismaClient();

const getAllRecordings = async (_req: Request, res: Response) => {
    const recordings = await prisma.recording.findMany({});

    if (!recordings || recordings.length === 0) {
        throw new NotFoundError("couldn't fetch recordings");
    }

    return res
        .status(StatusCodes.OK)
        .json({ msg: "recordings fetched successfully", data: recordings });
};

const addRecording = async (req: Request, res: Response) => {
    const recording = await prisma.recording.create({
        data: { ...req.body },
    });

    if (!recording) {
        throw new BadRequestError("couldn't create recording");
    }

    return res
        .status(StatusCodes.OK)
        .json({ msg: "recording created successfully", data: recording });
};

const getSingleRecording = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError("no id provided");
    }

    const recording = await prisma.recording.findUnique({
        where: { id: parseInt(id) },
    });

    if (!recording) {
        throw new BadRequestError("couldn't fetch recording");
    }

    const bucketName = process.env.RECORDING_BUCKET_NAME || "";
    const urls: string[] = [];

    async function getPresignedUrl(index: number) {
        return new Promise<string>((resolve, reject) => {
            const objectName = `${recording?.name}_${index}.wav`;
            minioClient.presignedGetObject(
                bucketName,
                objectName,
                (err, url) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(url);
                    }
                }
            );
        });
    }

    async function getPresignedUrls() {
        for (
            let index = 0;
            index <= (recording?.recordingCount || 0);
            index++
        ) {
            try {
                const url = await getPresignedUrl(index);
                urls.push(url);
            } catch (error) {
                console.error(
                    `Error getting presigned URL for index ${index}:`,
                    error
                );
            }
        }
    }

    await getPresignedUrls();

    return res.json(urls);
};

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

const concatAndSend = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new BadRequestError("No ID provided");
    }

    const recording = await prisma.recording.findUnique({
        where: { id: parseInt(id) },
    });

    if (!recording) {
        throw new BadRequestError("Couldn't fetch recording");
    }

    const bucketName = process.env.RECORDING_BUCKET_NAME || "";
    const objectNames = Array.from(
        { length: recording.recordingCount + 1 },
        (_, index) => `${recording.name}_${index}.wav`
    );
    const outputFile = "concatenated_recording.wav";
    const writer = new FileWriter(outputFile, {
        channels: 1,
        sampleRate: 44100,
        bitDepth: 16,
    });

    try {
        // Iterate over each file and append its data to the FileWriter
        for (const file of objectNames) {
            const dataStream = await minioClient.getObject(bucketName, file);
            dataStream.on("data", (chunk: Buffer) => {
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
            res.sendFile(
                path.join(__dirname, "..", "..", outputFile),
                (err) => {
                    if (err) {
                        throw new BadRequestError("could not fetch audio file");
                    }

                    unlinkSync(path.join(__dirname, "..", "..", outputFile));
                    console.log("temporary file sent ant deleted successfully");
                }
            );
        });
    } catch (err) {
        console.error("Error streaming files:", err);
        res.writeHead(500);
        res.end("Error streaming files");
    }
};

export { getAllRecordings, addRecording, getSingleRecording, concatAndSend };
