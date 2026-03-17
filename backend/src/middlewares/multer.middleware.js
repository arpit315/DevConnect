import multer from "multer";
import path from "path";

// --- WHAT IS MULTER? ---
// Multer is a middleware that handles 'multipart/form-data' requests.
// This is the format used when a browser uploads a file (like a profile picture).
// Without Multer, req.body does NOT contain file data — you'd just get an empty object.
// Multer reads the file from the request and saves it to disk temporarily.
// Then our Cloudinary utility picks it up and uploads it to the cloud.
// -----------------------

const storage = multer.diskStorage({
    // 'destination' tells Multer where to save the file temporarily on our server
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // Save to a local 'public/temp' folder
    },

    // 'filename' tells Multer what to name the saved file
    filename: function (req, file, cb) {
        // Use the original file name + a timestamp to avoid name collisions
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// Optional: only allow image files
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (isValid) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});
