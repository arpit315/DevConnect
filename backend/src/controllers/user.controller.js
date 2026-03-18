import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

// ── AUTH CONTROLLERS ──────────────────────────────────────────────────────────

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const user = await User.create({
        fullName,
        avatar,
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const queryConditions = [];
    if (username) queryConditions.push({ username });
    if (email) queryConditions.push({ email });

    const user = await User.findOne({
        $or: queryConditions
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

// ── SESSION CONTROLLER ────────────────────────────────────────────────────────

// When the accessToken expires (after 1 day), the frontend calls this endpoint
// with the refreshToken to silently get a new accessToken — no re-login needed.
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = { httpOnly: true, secure: true };
    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
});

// ── PROFILE CONTROLLERS ───────────────────────────────────────────────────────

// Returns the full profile of whoever is currently logged in.
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Returns any user's PUBLIC profile by their username. No login required.
const getUserProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const user = await User.findOne({ username: username.toLowerCase() })
        .select("-password -refreshToken -email");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

// Lets the logged-in user update their fullName, bio, email, techStack, and social links.
const updateAccountDetails = asyncHandler(async (req, res) => {
    const updateFields = {};
    const fields = ['fullName', 'email', 'bio', 'github', 'linkedin', 'twitter'];
    fields.forEach(f => {
        if (req.body[f] !== undefined) {
            updateFields[f] = req.body[f];
        }
    });

    if (techStack !== undefined) {
        if (typeof techStack === 'string') {
            updateFields.techStack = techStack.split(',').map(s => s.trim()).filter(Boolean);
        } else if (Array.isArray(techStack)) {
            updateFields.techStack = techStack;
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updateFields },
        {
            new: true,
            runValidators: true // This will catch if fullName is empty
        }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

// Lets the logged-in user upload a new avatar.
// Multer middleware runs first to save the file temporarily, 
// then we upload it to Cloudinary.
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // This utility uploads the file to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const imageUrl = avatar?.secure_url || avatar?.url;

    if (!imageUrl) {
        throw new ApiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: imageUrl } },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

// Returns all users in the system (except the current user) for the chat sidebar
const getAllUsers = asyncHandler(async (req, res) => {
    // req.user._id is available because this route uses verifyJWT
    const loggedInUserId = req.user._id;

    // Find all users where the _id is NOT equal ($ne) to the logged in user
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password -refreshToken -email");

    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

// Lets a user follow or unfollow another user
const toggleFollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        throw new ApiError(404, "Target user not found");
    }

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
        // Unfollow
        await User.findByIdAndUpdate(userId, {
            $pull: { followers: currentUserId }
        });
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { following: userId }
        });
        return res.status(200).json(new ApiResponse(200, { isFollowing: false }, "Unfollowed successfully"));
    } else {
        // Follow
        await User.findByIdAndUpdate(userId, {
            $push: { followers: currentUserId }
        });
        await User.findByIdAndUpdate(currentUserId, {
            $push: { following: userId }
        });
        return res.status(200).json(new ApiResponse(200, { isFollowing: true }, "Followed successfully"));
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getUserProfile,
    updateAccountDetails,
    updateUserAvatar,
    getAllUsers,
    toggleFollowUser,
};
