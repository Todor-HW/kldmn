import { model, Schema } from "mongoose";

import { Message } from "../types/chatTypes";

const messageSchema = new Schema<Message>({
    publicId: String,
    message: String,
    username: String,
    timestamp: Number,
});

export const MessageModel = model("Message", messageSchema);
