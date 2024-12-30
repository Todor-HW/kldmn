import { isAxiosError } from "axios";

import { axiosClient } from "./axios";
import { Message, User } from "../../types/chatTypes";

export const fetchUser = async (publicId: string | undefined) => {
    try {
        const res = await axiosClient.get<User>(`/chat/users/${publicId}`);
        return res.data;
    } catch (err) {
        if (isAxiosError(err)) {
            const message = err.response?.data?.err || err.message;
            throw new Error(message);
        }
        throw new Error("An unexpected error occurred");
    }
};

export const fetchMessages = async () => {
    try {
        const res = await axiosClient.get<{ messages: Message[] }>(`/chat/messages`);
        return res.data;
    } catch (err) {
        if (isAxiosError(err)) {
            const message = err.response?.data?.err || err.message;
            throw new Error(message);
        }
        throw new Error("An unexpected error occurred");
    }
};
