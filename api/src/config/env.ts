import path from "path";
import dotenv from "dotenv";

export async function loadConfig(): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            dotenv.config({
                path: path.join(__dirname, "../../.env.development"),
            });
            console.info(`Config for ${process.env.NODE_ENV} loaded`);
            resolve();
        } catch (err) {
            reject(`Error loading config for ${process.env.NODE_ENV}`);
        }
    });
}
