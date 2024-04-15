import socketIOClient from "socket.io-client";
import { PrismaClient } from "@prisma/client";
import { RecordingMetadata } from "./interfaces";

const prisma = new PrismaClient();

class MySocketIOClient {
    private socket;

    constructor(serverUrl: string) {
        this.socket = socketIOClient(serverUrl);
        this.setupEvents();
    }

    private setupEvents(): void {
        // Listen for the "connect" event
        this.socket.on("connect", () => {
            console.log("client connected");
            this.onConnect();
        });

        // Listen for the "saveTemporaryRecording" event
        this.socket.on(
            "saveTemporaryRecording",
            (data: { id: string; MCAddress: string }) => {
                this.onSaveToDatabase(data);
            }
        );

        // Listen for the "deleteTemporaryRecording" event
        this.socket.on(
            "deleteTemporaryRecording",
            (data: RecordingMetadata) => {
                this.onDeleteFromDatabase(data.id);
                this.onAddRecordingToDatabase(data);
            }
        );

        // Listen for the "disconnect" event
        this.socket.on("disconnect", () => {
            this.onDisconnect();
        });

        // Listen for the "error" event
        this.socket.on("error", (error: any) => {
            this.onError(error);
        });
    }

    private onConnect(): void {
        console.log("Connected to Socket.IO server");
    }

    private async onSaveToDatabase(data: {
        id: string;
        MCAddress: string;
    }): Promise<void> {
        try {
            const recording = await prisma.runningRecording.create({ data });

            if (!recording) {
                console.log("could not add recording");
                return;
            }

            console.log("added temporary recording successfully");
        } catch (error) {
            console.error(error);
        }
    }

    private async onDeleteFromDatabase(id: string) {
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
        } catch (error) {
            console.error(error);
        }
    }

    private async onAddRecordingToDatabase(
        data: RecordingMetadata
    ): Promise<void> {
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
        } catch (error) {
            console.error(error);
        }
    }

    private onDisconnect(): void {
        console.log("Disconnected from Socket.IO server");
    }

    private onError(error: any): void {
        console.error("Socket.IO error:", error);
    }
}

export default MySocketIOClient;
