"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class MySocketIOClient {
    socket;
    constructor(serverUrl) {
        this.socket = (0, socket_io_client_1.default)(serverUrl);
        this.setupEvents();
    }
    setupEvents() {
        // Listen for the "connect" event
        this.socket.on("connect", () => {
            console.log("client connected");
            this.onConnect();
        });
        // Listen for the "saveTemporaryRecording" event
        this.socket.on("saveTemporaryRecording", (data) => {
            this.onSaveToDatabase(data);
        });
        // Listen for the "deleteTemporaryRecording" event
        this.socket.on("deleteTemporaryRecording", (data) => {
            this.onDeleteFromDatabase(data.id);
            this.onAddRecordingToDatabase(data);
        });
        // Listen for the "disconnect" event
        this.socket.on("disconnect", () => {
            this.onDisconnect();
        });
        // Listen for the "error" event
        this.socket.on("error", (error) => {
            this.onError(error);
        });
    }
    onConnect() {
        console.log("Connected to Socket.IO server");
    }
    async onSaveToDatabase(data) {
        try {
            const recording = await prisma.runningRecording.create({ data });
            if (!recording) {
                console.log("could not add recording");
                return;
            }
            console.log("added temporary recording successfully");
        }
        catch (error) {
            console.error(error);
        }
    }
    async onDeleteFromDatabase(id) {
        try {
            const recording = await prisma.runningRecording.delete({
                where: {
                    id,
                },
            });
            if (!recording) {
                console.log("could not remove recording");
                return;
            }
            console.log("removed temporary recording successfully");
        }
        catch (error) {
            console.error(error);
        }
    }
    async onAddRecordingToDatabase(data) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = data;
            const recording = await prisma.recording.create({
                data: rest,
            });
            if (!recording) {
                console.log("could not add recording");
                return;
            }
            console.log("added recording successfully");
        }
        catch (error) {
            console.error(error);
        }
    }
    onDisconnect() {
        console.log("Disconnected from Socket.IO server");
    }
    onError(error) {
        console.error("Socket.IO error:", error);
    }
}
exports.default = MySocketIOClient;
//# sourceMappingURL=recordingClient.js.map