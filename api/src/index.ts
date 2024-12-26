import express from "express";
import http from "http";
import socketIo from "socket.io";
import cors from "cors";

import { Pokemon } from "./types/pokemonTypes";

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

app.use(cors(corsOptions));

const apiRouter = express.Router();

io.on("connection", (socket) => {
    console.log(`${socket.id} user just connected`);

    socket.on("send_message", (data) => {
        console.log("Message sent:", data);
        io.emit("receive_message", { ...data, sid: socket.id });
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

apiRouter.get("/pokeapp", async (req, res) => {
    try {
        const referrer = req.get("Referer") || req.get("Origin") || "Unknown source";
        console.log(`Request coming from: ${referrer}`);

        const { name } = req.query;
        const formatted = typeof name === "string" && name?.toLowerCase();
        if (!formatted) {
            res.status(500).json({ error: "Not a valid input" });
            return;
        }

        const [dataPokemon, dataSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${formatted}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${formatted}`),
        ]);

        const results = await Promise.allSettled([dataPokemon.json(), dataSpecies.json()]);

        const pokemon = results[0]?.status === "fulfilled" ? results[0].value : null;
        const species = results[1]?.status === "fulfilled" ? results[1].value : null;

        if (!pokemon || !species) {
            res.status(404).json({ err: "Pokemon or species not found" });
            return;
        }

        const data: Pokemon = {
            name: pokemon?.name,
            weight: pokemon?.weight,
            height: pokemon?.height,
            baseExperience: pokemon?.base_experience,
            abilities: pokemon?.abilities,
            types: pokemon?.types?.map((t: any) => t.type?.name),
            forms: pokemon?.forms?.map((f: any) => f.name),
            img: pokemon?.sprites?.front_default,
            description: species?.flavor_text_entries?.[0]?.flavor_text,
        };

        res.json(data);
    } catch (err) {
        res.status(500).json({ err: "An unexpected error occured." });
    }
});

apiRouter.get("/chat", async (req, res) => {
    try {
        res.status(200).json({ msg: "Hello, World!" });
    } catch (err) {
        res.status(500).json({ err: "An unexpected error occured." });
    }
});

app.use("/api", apiRouter);

app.get("*", (_req, res) => {
    res.sendStatus(404);
});

httpServer.listen(PORT, () => {
    console.log(`App is listening on port: ${PORT}`);
});
