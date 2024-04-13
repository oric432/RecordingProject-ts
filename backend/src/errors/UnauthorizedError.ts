import CustomAPIError from "./CustomApiError";
import { StatusCodes } from "http-status-codes";

class UnauthorizedError extends CustomAPIError {
    statusCode: number;

    constructor(message: string) {
        super(message);
        this.statusCode = StatusCodes.UNAUTHORIZED;
    }
}

export default UnauthorizedError;
