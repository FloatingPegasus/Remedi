import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = async () => {
    try {
        // Validate Cloudinary credentials
        if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_SECRET_KEY) {
            console.error("❌ ERROR: Cloudinary credentials are missing in environment variables");
            console.error("💡 Please set CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_SECRET_KEY in .env file");
            process.exit(1);
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });

        console.log("✅ Cloudinary Connected Successfully");
        console.log(`📍 Cloud Name: ${process.env.CLOUDINARY_NAME}`);

    } catch (error) {
        console.error("❌ Failed to configure Cloudinary:", error.message);
        process.exit(1);
    }
}

export default connectCloudinary;