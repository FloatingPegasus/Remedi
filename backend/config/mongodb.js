import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Validate MongoDB URI
        if (!process.env.MONGODB_URI) {
            console.error("❌ ERROR: MONGODB_URI is not defined in environment variables");
            process.exit(1);
        }

        // Set up connection event listeners
        mongoose.connection.on('connected', () => {
            console.log("✅ Database Connected Successfully");
            console.log(`📍 Database: remedi (MongoDB Atlas)`);
        });

        mongoose.connection.on('error', (err) => {
            console.error("❌ Database Connection Error:", err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log("⚠️  Database Disconnected");
        });

        // Connect to MongoDB Atlas
        await mongoose.connect(`${process.env.MONGODB_URI}/remedi`, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });

    } catch (error) {
        console.error("❌ Failed to connect to MongoDB Atlas:", error.message);
        console.error("💡 Please check:");
        console.error("   1. MONGODB_URI is correct in .env file");
        console.error("   2. Your IP address is whitelisted in MongoDB Atlas");
        console.error("   3. Database credentials are correct");
        process.exit(1);
    }
}

export default connectDB;

// Note: Do not use '@' symbol in your database user's password else it will show an error.