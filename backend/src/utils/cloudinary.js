import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (localFilePath) => {
    // Lazy-load configuration to ensure process.env variables are available
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    try {
        if (!localFilePath) return null;

        // Upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // Automatically detect if it's an image, video, etc.
            folder: "devconnect",  // Organize uploads inside a "devconnect" folder in Cloudinary
        });

        // File uploaded successfully — remove the temp file from our server
        fs.unlinkSync(localFilePath);

        return response; // response.secure_url is the public URL of the uploaded image
    } catch (error) {
        // If upload fails, still remove the temp file so junk doesn't pile up
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary upload failed:", error);
        return null;
    }
};

export { uploadOnCloudinary };
