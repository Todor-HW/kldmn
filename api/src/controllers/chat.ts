import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

import { Message, User } from "../types/chatTypes";
import { generateRandomUsername } from "../utils/generator";
import { MessageModel, UserModel } from "../models";

const router = Router();

// const users = new Map<string, User>();
const messages: Message[] = [];

router.get("/", async (req, res) => {
    try {
        res.status(200).json({ msg: "Hello, World!" });
    } catch (err) {
        res.status(500).json({ err: "An unexpected error occured." });
    }
});

router.get("/messages", async (_req, res) => {
    try {
        const messages = await MessageModel.find().lean();
        res.status(200).json({ messages });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

router.get("/users/:publicId", async (req, res) => {
    try {
        const { publicId } = req.params;

        const existingUser =
            publicId !== "undefined"
                ? await UserModel.findOne<User>({ publicId }, "-_id publicId username").lean()
                : null;

        if (existingUser) {
            res.status(200).json({ ...existingUser });
        } else {
            const newUser: User = {
                publicId: uuidv4(),
                username: generateRandomUsername(),
            };
            await UserModel.create(newUser);
            res.status(200).json({ ...newUser });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

export default router;
