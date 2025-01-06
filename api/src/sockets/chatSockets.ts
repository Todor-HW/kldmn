import { Server as HttpServer } from "http";
import { DefaultEventsMap, Server } from "socket.io";

import { corsOptions } from "../config";
import { Message } from "../types/chatTypes";
import { MessageModel } from "../models";
import { cacheNotification } from "../utils";

const io = new Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    {
        publicId: string;
    }
>({ cors: corsOptions });

function bindListeners() {
    io.use((socket, next) => {
        const publicId = socket.handshake.auth.publicId;
        if (!publicId) {
            return next(new Error("Invalid publicId"));
        }
        socket.data.publicId = publicId;
        next();
    }).on("connection", (socket) => {
        // console.log(`[io] Connected pubicId: ${socket.data.publicId}`);

        // Join room
        socket.join(socket.data.publicId);

        socket.on("is_typing", async ({ to }) => {
            socket.to(to).emit("is_typing", {
                from: socket.data.publicId,
            });
        });

        socket.on("send_message", async ({ to, message }) => {
            const from = socket.data.publicId;
            const newMessage: Message = { from, to, message, timestamp: Date.now() };
            await MessageModel.create(newMessage);
            await cacheNotification(to, from);

            socket.to(to).emit("receive_message", newMessage);
            socket.emit("receive_message", newMessage);
        });

        socket.on("disconnect", () => {
            console.info(`User disconnected: ${socket.id}`);
        });
    });
}

export function addWebSocket(server: HttpServer) {
    io.attach(server);
    bindListeners();
    console.info("[io] Socket added successfully");
}
