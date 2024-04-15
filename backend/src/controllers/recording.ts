import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors";
import { PrismaClient } from "@prisma/client";
import minioClient from "../utils/minioClient";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const getAllRecordings = async (_req: Request, res: Response) => {
    const recordings = await prisma.recording.findMany({});

    if (!recordings) {
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
    try {
        const dataStream = await minioClient.getObject(
            bucketName,
            `${recording.name}.wav`
        );
        res.setHeader(
            "Content-disposition",
            `attachment; filename=${recording.name}`
        );
        res.setHeader("Content-type", "audio/wav");

        dataStream.pipe(res);
    } catch (error) {
        console.error("Error streaming files:", error);
        res.writeHead(500);
        res.end("Error streaming files");
    }
};

export { getAllRecordings, addRecording, concatAndSend };
