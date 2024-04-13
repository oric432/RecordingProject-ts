import { Socket } from "socket.io";
import { PrismaClient } from "@prisma/client";
import minioClient from "../utils/minioClient";
const prisma = new PrismaClient();

const concatAndSendSocket = async (socket: Socket, id: string) => {
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
    const objectNames = Array.from(
        { length: recording.recordingCount + 1 },
        (_, index) => `${recording.name}_${index}.wav`
    );

    let i = 0;

    try {
        for (const file of objectNames) {
            const dataStream = await minioClient.getObject(bucketName, file);

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
    } catch (err) {
        console.error("Error streaming files:", err);
        socket.emit("error", "Error streaming files");
    }
};

export default concatAndSendSocket;
