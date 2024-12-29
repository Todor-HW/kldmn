const allowedOrigins = ["https://kldmn.xyz", "https://www.kldmn.xyz"];

if (process.env.NODE_ENV === "development") {
    allowedOrigins.push("http://localhost:3000");
}

export const corsOptions = {
    origin: allowedOrigins,
};
