import { redis } from "../services";

export async function getCachedNotifications(user: string) {
    try {
        const cached = await redis.get(`notifications:${user}`);
        const parsed = JSON.parse(cached) || {};
        return parsed;
    } catch (err) {
        console.error("Error fetching cached notifications");
        throw err;
    }
}

export async function cacheNotification(user: string, peerId: string) {
    try {
        const cached = await redis.get(`notifications:${user}`);
        const parsed = JSON.parse(cached) || {};
        parsed[peerId] = (parsed[peerId] || 0) + 1;
        await redis.set(`notifications:${user}`, JSON.stringify(parsed), "EX", 3600);
    } catch (err) {
        console.error("Error caching notification");
        throw err;
    }
}

export async function clearCachedNotification(user: string, peerId: string) {
    try {
        const cached = await redis.get(`notifications:${user}`);
        if (cached) {
            const parsed = JSON.parse(cached);
            delete parsed[peerId];
            await redis.set(`notifications:${user}`, JSON.stringify(parsed), "EX", 3600);
        }
    } catch (err) {
        console.error("Error removing cached notification");
        throw err;
    }
}
