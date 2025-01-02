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
        console.info("Fetching existing user:", publicId);
        const user = await UserModel.findOne<User>({ publicId }, "-_id -__v").lean();
        if (user) {
            res.status(200).json({ ...user });
        } else {
            res.status(404).json({ err: `User with publicId: ${publicId} not found` });
        }
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

router.post("/users", async (req, res) => {
    try {
        const user: User = {
            publicId: generatePublicId(12),
            username: generateRandomUsername(),
        };
        console.info("Creating new user:", user.publicId);
        await UserModel.create(user);
        res.status(200).json({ ...user });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

export default router;
