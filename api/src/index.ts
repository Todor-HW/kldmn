import express from "express";
import cors from "cors";

import { Pokemon } from "./types/pokemonTypes";

const app = express();
const port = 8080;

const corsOptions = {
    origin: [
        //ln
        "http://localhost:3000",
        "https://kldmn.xyz",
        "https://www.kldmn.xyz",
    ],
};

app.use(cors(corsOptions));

const apiRouter = express.Router();

apiRouter.get("/pokemon", async (req, res) => {
    try {
        console.log(`Incoming request: ${req.method} ${req.url}`);

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

app.use("/api", apiRouter);

app.get("*", (_req, res) => {
    res.sendStatus(404);
});

app.listen(port, () => {
    console.log(`App is listening on port: ${port}`);
});
