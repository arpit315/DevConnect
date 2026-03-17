import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// --- WHAT IS THIS FILE? ---
// This is an AUTH MIDDLEWARE.
// It runs BEFORE a protected route's controller function.
// Its job is to verify that the user making the request is actually logged in.
// If the token is valid, it attaches the user object to req.user so our
// controllers can use it (e.g., to know WHO is logging out, or creating a post).
// If the token is missing or invalid, it throws a 401 Unauthorized error.
// --------------------------

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // Step 1: Get the token.
        // We check cookies first (for browser clients).
        // We also support the "Authorization: Bearer <token>" header (for mobile/Postman clients).
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Step 2: Verify the token using our secret key.
        // jwt.verify() will:
        // - Decode the token
        // - Check that it was signed with our ACCESS_TOKEN_SECRET
        // - Check that it has not expired
        // If any check fails, it throws an error and we go to the catch block.
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Step 3: Find the user in the database using the ID stored in the token.
        // We exclude the password and refreshToken fields since we don't need them here.
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Step 4: Attach the user object to the request.
        // Now any controller that runs after this middleware can access 
        // the logged-in user via req.user
        req.user = user;

        // Step 5: Call next() to pass control to the next middleware or route handler.
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
