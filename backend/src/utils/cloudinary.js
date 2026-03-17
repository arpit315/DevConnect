import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary using credentials from our .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- WHAT DOES THIS FUNCTION DO? ---
// 1. Takes a local file path (where Multer saved the file temporarily on our server's disk).
// 2. Uploads that file to Cloudinary (the cloud image host).
// 3. Once the upload is done, deletes the temporary local file to keep our server clean.
// 4. Returns the Cloudinary response (which contains the public URL of the uploaded image).
// -----------------------------------

const uploadOnCloudinary = async (localFilePath) => {
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
