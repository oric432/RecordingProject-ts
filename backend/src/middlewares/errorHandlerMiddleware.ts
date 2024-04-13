import { StatusCodes } from "http-status-codes";
import { Request, Response, NextFunction } from "express";

const errorHandlerMiddleware = (
    err: any,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    const customError = {
        code: err.code || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong, try again later",
    };

    switch (err.code) {
        case "P2025":
            customError.msg = "Record not found.";
            customError.code = StatusCodes.NOT_FOUND;
            break;

        case "P2002":
            customError.msg = `${err.meta.target} already exists`;
            customError.code = StatusCodes.CONFLICT;
            break;
        case "P2000":
            customError.msg = "Invalid data provided.";
            customError.code = StatusCodes.BAD_REQUEST;
            break;

        case "P2001":
            customError.msg = "A unique constraint failed.";
            customError.code = StatusCodes.BAD_REQUEST;
            break;

        case "P2016":
            customError.msg = "Invalid relation data provided.";
            customError.code = StatusCodes.BAD_REQUEST;
            break;

        case "P2021":
            customError.msg = "Invalid Prisma Client usage.";
            customError.code = StatusCodes.INTERNAL_SERVER_ERROR;
            break;
        default:
            console.log(err);
            break;
    }

    return res.status(customError.code).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
