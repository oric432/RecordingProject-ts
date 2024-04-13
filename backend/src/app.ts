import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import "express-async-errors";

// Extra security middleware
import cors from "cors";
import helmet from "helmet";

// Routers
import recordingRouter from "./routes/recording";
import runningRecordingRouter from "./routes/runningRecording";

// Error middleware
import errorHandlerMiddleware from "./middlewares/errorHandlerMiddleware";

// Server initialization
import MySocketIOClient from "./utils/recordingClient";

// Streaming server
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import concatAndSendSocket from "./utils/streamingServer";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/v1/recordings", recordingRouter);
app.use("/api/v1/runningRecording", runningRecordingRouter);

// Error middleware
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3001;

const httpServer = http.createServer(app);

// Create Socket.IO server instance
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("requestRecording", async (id: string) => {
        await concatAndSendSocket(socket, id);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

const startApplication = () => {
    new MySocketIOClient("http://localhost:3005");
    httpServer.listen(port, () =>
        console.log(`Server is listening on port ${port}`)
    );
};

startApplication();
