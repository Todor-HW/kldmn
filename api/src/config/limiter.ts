import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 100 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many requests, please try again later.",
    },
});
