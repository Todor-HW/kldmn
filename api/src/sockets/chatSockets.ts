import { Server } from "socket.io";

import { Message } from "../types/chatTypes";
import { MessageModel, UserModel } from "../models";

export function setupChatSockets(io: Server) {
    io.on("connection", (socket) => {
        // Is typing
        socket.on("is_typing", async (data) => {
            const { publicId } = data;
            const user = await UserModel.findOne({ publicId }).lean();

            io.emit("is_typing", {});
        });

        // Send message
        socket.on("send_message", async (data) => {
            const { publicId } = data;
            const user = await UserModel.findOne({ publicId }).lean();

            const message: Message = {
                ...data,
                username: user?.username || "Anonymous",
                timestamp: Date.now(),
            };
            await MessageModel.create(message);
            io.emit("receive_message", message);
        });

        // Disconnect
        socket.on("disconnect", () => {
            console.info(`User disconnected: ${socket.id}`);
        });
    });
}
