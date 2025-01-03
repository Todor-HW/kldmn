import { Redis } from "ioredis";

export const redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    db: 0,
});

redis.once("connect", () => {
    console.info("Redis connected");
});

redis.once("error", (err) => {
    console.error("Redis connection error:", err);
});

export async function redisTest() {
    try {
        await redis.set("test-key", "test-value");
        const value = await redis.get("test-key");
        if (!value) throw new Error("No test value");
        await redis.del("test-key");
        console.log("Redis test successful");
    } catch (err) {
        throw err;
    }
}
