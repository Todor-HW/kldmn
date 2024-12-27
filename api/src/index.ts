import express, { Router } from "express";
import http from "http";
import socketIo from "socket.io";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

import pokeAppRouter from "./controllers";
import { generateRandomUsername } from "./utils/generator";
import { Message, User } from "./types/chatTypes";

const PORT = 8080;

const corsOptions = {
    origin: [
        //ln
        "http://localhost:3000",
        "https://kldmn.xyz",
        "https://www.kldmn.xyz",
    ],
};

const app = express();
const httpServer = http.createServer(app);
const io = new socketIo.Server(httpServer, { cors: corsOptions });

app.use(express.json());
app.use(cors(corsOptions));

const chatRouter = Router();

const users = new Map<string, User>();
const messages: Message[] = [];

function pushMessage(message: Message) {
    if (messages.length >= 5) {
        messages.shift();
    }
    messages.push(message);
}

io.on("connection", (socket) => {
    socket.on("send_message", (data) => {
        const { userId } = data;
        const user = users.get(userId);

        const message: Message = {
            ...data,
            username: user?.username || "Anonymous",
            timestamp: Date.now(),
        };
        io.emit("receive_message", message);
        pushMessage(message);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        users.delete(socket.id);
    });
});

chatRouter.get("/", async (req, res) => {
    try {
        res.status(200).json({ msg: "Hello, World!" });
    } catch (err) {
        res.status(500).json({ err: "An unexpected error occured." });
    }
});

chatRouter.get("/messages", async (_req, res) => {
    try {
        res.status(200).json({ messages });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

chatRouter.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const existingUser = userId && users.get(userId);
        if (existingUser) {
            res.status(200).json({ ...existingUser });
        } else {
            const newUserId = uuidv4();
            const newUser: User = { userId: newUserId, username: generateRandomUsername() };
            users.set(newUserId, newUser);
            res.status(200).json({ ...newUser });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

app.use("/api/pokeapp", pokeAppRouter);
app.use("/api/chat", chatRouter);

app.get("*", (_req, res) => {
    res.sendStatus(404);
});

httpServer.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`);
});
