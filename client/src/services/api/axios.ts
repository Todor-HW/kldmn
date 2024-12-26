import axios from "axios";

const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? "https://api.kldmn.xyz/api"
        : "http://localhost:8080/api";

export const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 3000,
});
