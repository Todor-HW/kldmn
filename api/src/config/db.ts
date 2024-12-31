import mongoose from "mongoose";

export async function connectMongoDb() {
    const mongoUri = process.env.MONGO_URI;
    console.info("Connecting to MongoDB at:", mongoUri);

    try {
        await mongoose.connect(mongoUri, {
            connectTimeoutMS: 5000,
        });
        console.info(`MongoDB connected at: ${mongoUri}`);
    } catch (err) {
        console.error("Error connecting to MongoDB");
        throw err;
    }
}
