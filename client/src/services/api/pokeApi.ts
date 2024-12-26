import { isAxiosError } from "axios";
import { axiosClient } from "./axios";

export const fetchData = async (name: string) => {
    try {
        const res = await axiosClient.get(`/pokemon`, { params: { name } });
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
