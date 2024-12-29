import { model, Model, Schema } from "mongoose";

import { User } from "../types/chatTypes";

const userSchema = new Schema<User>({
    publicId: String,
    username: String,
});

export const UserModel = model("User", userSchema);
