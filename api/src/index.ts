import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";

import { connectMongoDb, corsOptions, limiter } from "./config";
import { addWebSocket } from "./sockets/chatSockets";
import { chatRouter, pokeAppRouter } from "./controllers";

const app = express();
const httpServer = http.createServer(app);

addWebSocket(httpServer);

app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
process.env.NODE_ENV === "production" && app.use(limiter);

app.use("/api/pokeapp", pokeAppRouter);
app.use("/api/chat", chatRouter);

app.get("*", (_req, res) => {
    res.sendStatus(404);
});

(async () => {
    try {
        // await loadConfig(); // Not used because env file is set in the script
        await connectMongoDb();
        // await redisTest();

        const port = process.env.PORT || 8080;
        httpServer.listen(port, () => {
            console.info(`App is listening on port: ${port}`);
        });
    } catch (err) {
        console.error("Init error:", err);
    }
})();
