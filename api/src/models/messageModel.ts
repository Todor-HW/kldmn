import { model, Schema } from "mongoose";

import { Message } from "../types/chatTypes";

const messageSchema = new Schema<Message>({
    from: String,
    to: String,
    message: String,
    // username: String,
    timestamp: Number,
});

export const MessageModel = model("Message", messageSchema);
