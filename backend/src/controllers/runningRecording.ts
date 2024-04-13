import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../errors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getRunningRecordings = async (_req: Request, res: Response) => {
    const runningRecordings = await prisma.runningRecording.findMany({});

    if (!runningRecordings || runningRecordings.length === 0) {
        throw new BadRequestError("could not fetch running recordings");
    }

    return res.status(StatusCodes.OK).json({
        msg: "fetched running recordings successfully",
        data: runningRecordings,
    });
};

export { getRunningRecordings };
