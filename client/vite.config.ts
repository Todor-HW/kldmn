import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    base: "/",
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,
        host: "0.0.0.0",
        origin: "http://0.0.0.3000",
        open: true,
    },
});
