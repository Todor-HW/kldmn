import { Router } from "express";

import { User } from "../types/chatTypes";
import { MessageModel, UserModel } from "../models";
import {
    clearCachedNotification,
    generatePublicId,
    generateRandomUsername,
    getCachedNotifications,
} from "../utils";

const router = Router();

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

router.post("/users", async (_req, res) => {
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

router.get("/peer/:peerId", async (req, res) => {
    try {
        const { peerId } = req.params;
        const { publicId } = req.query;
        if (typeof publicId !== "string") throw new Error("Public id is not a string");

        const peer = await UserModel.findOne({ publicId: peerId }, "-_id -__v").lean();

        await clearCachedNotification(publicId, peerId);

        res.status(200).json({ peer });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

router.get("/notifications/:publicId", async (req, res) => {
    try {
        const { publicId } = req.params;
        const { peerId } = req.query;

        if (typeof peerId !== "string") throw new Error("Public id is not a string");

        const notifications = await getCachedNotifications(publicId);

        res.status(200).json({ notifications });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ err: "An unexpected error occured" });
    }
});

router.get("*", async (req, res) => {
    res.status(500).json({ err: "Route not found" });
});

export default router;
