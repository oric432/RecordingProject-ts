"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
// Extra security middleware
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// Routers
const recording_1 = __importDefault(require("./routes/recording"));
const runningRecording_1 = __importDefault(require("./routes/runningRecording"));
// Error middleware
const errorHandlerMiddleware_1 = __importDefault(require("./middlewares/errorHandlerMiddleware"));
// Server initialization
const recordingClient_1 = __importDefault(require("./utils/recordingClient"));
// Streaming server
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const streamingServer_1 = __importDefault(require("./utils/streamingServer"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// Routes
app.use("/api/v1/recordings", recording_1.default);
app.use("/api/v1/runningRecording", runningRecording_1.default);
// Error middleware
app.use(errorHandlerMiddleware_1.default);
const port = process.env.PORT || 3001;
const httpServer = http_1.default.createServer(app);
// Create Socket.IO server instance
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("requestRecording", async (id) => {
        await (0, streamingServer_1.default)(socket, id);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
const startApplication = () => {
    new recordingClient_1.default("http://localhost:3005");
    httpServer.listen(port, () => console.log(`Server is listening on port ${port}`));
};
startApplication();
//# sourceMappingURL=app.js.map