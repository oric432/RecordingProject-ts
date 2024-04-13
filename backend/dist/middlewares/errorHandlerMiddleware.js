"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const errorHandlerMiddleware = (err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) => {
    const customError = {
        code: err.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong, try again later",
    };
    switch (err.code) {
        case "P2025":
            customError.msg = "Record not found.";
            customError.code = http_status_codes_1.StatusCodes.NOT_FOUND;
            break;
        case "P2002":
            customError.msg = `${err.meta.target} already exists`;
            customError.code = http_status_codes_1.StatusCodes.CONFLICT;
            break;
        case "P2000":
            customError.msg = "Invalid data provided.";
            customError.code = http_status_codes_1.StatusCodes.BAD_REQUEST;
            break;
        case "P2001":
            customError.msg = "A unique constraint failed.";
            customError.code = http_status_codes_1.StatusCodes.BAD_REQUEST;
            break;
        case "P2016":
            customError.msg = "Invalid relation data provided.";
            customError.code = http_status_codes_1.StatusCodes.BAD_REQUEST;
            break;
        case "P2021":
            customError.msg = "Invalid Prisma Client usage.";
            customError.code = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
            break;
        default:
            console.log(err);
            break;
    }
    return res.status(customError.code).json({ msg: customError.msg });
};
exports.default = errorHandlerMiddleware;
//# sourceMappingURL=errorHandlerMiddleware.js.map