"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CustomApiError_1 = __importDefault(require("./CustomApiError"));
const http_status_codes_1 = require("http-status-codes");
class UnauthorizedError extends CustomApiError_1.default {
    statusCode;
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
    }
}
exports.default = UnauthorizedError;
//# sourceMappingURL=UnauthorizedError.js.map