


import mongoose from "mongoose";
import db from "./db.js";
import logger from "../helper/logger.js";

// Make sure your db.js sets this:
// db.MONGODB_URL = process.env.MONGODB_URL_PROD;
// db.MONGODB_DATABASE = process.env.MONGODB_DATABASE;

async function connectToDatabase() {
    try {
        if (!db.MONGODB_URL) {
            throw new Error(
                "MONGODB_URL_PROD is undefined. Check your .env or db.js"
            );
        }

        await mongoose.connect(db.MONGODB_URL, {
            dbName: db.MONGODB_DATABASE,
        });

        logger.info("Mongo DB connected successfully");
        console.log("✅ MongoDB Connected successfully");

    } catch (error) {
        logger.error("Error connecting to MongoDB:", error);
        console.log("❌ MongoDB failed");
    }
}

connectToDatabase();

export { connectToDatabase };
export default mongoose;
