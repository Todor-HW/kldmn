import { Router } from "express";

import { User } from "../types/chatTypes";
import { generatePublicId, generateRandomUsername } from "../utils/generator";
import { MessageModel, UserModel } from "../models";

const router = Router();

router.get("/", async (req, res) => {
    try {
        res.status(200).json({ msg: "Hello, World!" });
    } catch (err) {
        res.status(500).json({ err: "An unexpected error occured." });
    }
});

router.get("/messages/:publicId", async (req, res) => {
    try {
        const { publicId } = req.params;
        const { to } = req.query;

        const messages = await MessageModel.find({
            $or: [
                { from: publicId, to },
                { from: to, to: publicId },
            ],
        }).lean();

        res.status(201).json({ messages });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

router.get("/users", async (req, res) => {
    try {
        const { publicId } = req.query;

        const users = await UserModel.find({ publicId: { $ne: publicId } }, "-_id -__v");

        res.status(200).json({ users });
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
                publicId: generatePublicId(12),
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
