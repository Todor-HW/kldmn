import { isAxiosError } from "axios";
import { axiosClient } from "./axios";

export const fetchUser = async (userId: string | undefined) => {
    try {
        const res = await axiosClient.get(`/chat/${userId}`);
        const data = res.data;

        return data;
    } catch (err) {
        if (isAxiosError(err)) {
            const message = err?.response?.data?.err || null;
            if (message) throw new Error(message);
            throw new Error(err.message);
        }
        throw err;
    }
};

export const fetchMessages = async () => {
    try {
        const res = await axiosClient.get(`/chat/messages`);
        const data = res.data;

        return data;
    } catch (err) {
        if (isAxiosError(err)) {
            const message = err?.response?.data?.err || null;
            if (message) throw new Error(message);
            throw new Error(err.message);
        }
        throw err;
    }
};
