"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.NotFoundError = exports.BadRequestError = exports.CustomAPIError = void 0;
const CustomApiError_1 = __importDefault(require("./CustomApiError"));
exports.CustomAPIError = CustomApiError_1.default;
const BadRequestError_1 = __importDefault(require("./BadRequestError"));
exports.BadRequestError = BadRequestError_1.default;
const UnauthorizedError_1 = __importDefault(require("./UnauthorizedError"));
exports.UnauthorizedError = UnauthorizedError_1.default;
const NotFoundError_1 = __importDefault(require("./NotFoundError"));
exports.NotFoundError = NotFoundError_1.default;
//# sourceMappingURL=index.js.map