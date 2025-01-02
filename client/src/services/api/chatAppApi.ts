import { isAxiosError } from "axios";

import { axiosClient } from "./axios";
import { Message, User } from "../../types/chatTypes";

export const fetchUsers = async (url: string) => {
    try {
        const res = await axiosClient.get<{ users: User[] }>(url);
        return res.data.users;
    } catch (err) {
        if (isAxiosError(err)) {
            const message = err.response?.data?.err || err.message;
            throw new Error(message);
        }
        throw new Error("An unexpected error occurred");
    }
};

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

export const createUser = async () => {
    try {
        const res = await axiosClient.post<User>(`/chat/users`);
        return res.data;
    } catch (err) {
        if (isAxiosError(err)) {
            const message = err.response?.data?.err || err.message;
            throw new Error(message);
        }
        throw new Error("An unexpected error occurred");
    }
};

export const fetchMessages = async (url: string, to: string) => {
    try {
        const res = await axiosClient.get<{ messages: Message[] }>(url, {
            params: { to },
        });
        return res.data.messages;
    } catch (err) {
        if (isAxiosError(err)) {
            const message = err.response?.data?.err || err.message;
            throw new Error(message);
        }
        throw new Error("An unexpected error occurred");
    }
};
