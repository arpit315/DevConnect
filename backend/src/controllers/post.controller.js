import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// ── CREATE POST ───────────────────────────────────────────────────────────────
// Creates a new post. The logged-in user is the author (from req.user via verifyJWT).
// Optionally uploads an image to Cloudinary if one is provided.
const createPost = asyncHandler(async (req, res) => {
    const { content, tags } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Post content is required");
    }

    // Handle optional image upload
    let imageUrl = "";
    if (req.file?.path) {
        const uploaded = await uploadOnCloudinary(req.file.path);
        if (!uploaded?.url) {
            throw new ApiError(500, "Failed to upload image");
        }
        imageUrl = uploaded.url;
    }

    // Parse tags — frontend can send "javascript,react,nodejs" or ["javascript","react"]
    const parsedTags = Array.isArray(tags)
        ? tags
        : tags?.split(",").map((t) => t.trim()).filter(Boolean) || [];

    const post = await Post.create({
        content,
        image: imageUrl || undefined,
        author: req.user._id,
        tags: parsedTags,
    });

    // Populate author details so the response includes the user's name and avatar
    const populatedPost = await Post.findById(post._id).populate(
        "author",
        "username fullName avatar"
    );

    return res
        .status(201)
        .json(new ApiResponse(201, populatedPost, "Post created successfully"));
});

// ── GET FEED ──────────────────────────────────────────────────────────────────
// Returns all posts sorted by newest first. Supports pagination.
// Anyone can view the feed — no login required.
const getFeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;   // Which page (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Posts per page (default: 10)
    const skip = (page - 1) * limit;              // How many posts to skip

    const posts = await Post.find()
        .sort({ createdAt: -1 }) // Newest posts first
        .skip(skip)
        .limit(limit)
        .populate("author", "username fullName avatar"); // Join author data

    const totalPosts = await Post.countDocuments();

    return res.status(200).json(
        new ApiResponse(200, {
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
        }, "Feed fetched successfully")
    );
});

// ── GET POST BY ID ─────────────────────────────────────────────────────────────
// Fetches a single post by its MongoDB _id. No login required.
const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate("author", "username fullName avatar");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, post, "Post fetched successfully"));
});

// ── GET USER POSTS ─────────────────────────────────────────────────────────────
// Returns all posts by a specific user (by their username).
// Used on a user's profile page to show their posts.
const getUserPosts = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // First find the user by username to get their _id
    const { User } = await import("../models/user.model.js");
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const posts = await Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .populate("author", "username fullName avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, posts, "User posts fetched successfully"));
});

// ── DELETE POST ───────────────────────────────────────────────────────────────
// Deletes a post. Only the author of the post can delete it.
const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Check if the logged-in user is the author of this post
    // .toString() is needed because MongoDB IDs are objects, not plain strings
    if (post.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this post");
    }

    await Post.findByIdAndDelete(postId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Post deleted successfully"));
});

// ── TOGGLE LIKE ───────────────────────────────────────────────────────────────
// Likes a post if the user hasn't liked it yet. Unlikes it if they already have.
// This is called a "toggle" because the same endpoint handles both actions.
const toggleLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const userId = req.user._id;
    // Check if the user's ID is already in the likes array
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
        // Remove the user's ID from likes (unlike)
        post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
        // Add the user's ID to likes (like)
        post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json(
        new ApiResponse(200, {
            liked: !alreadyLiked,
            totalLikes: post.likes.length,
        }, alreadyLiked ? "Post unliked" : "Post liked")
    );
});

export {
    createPost,
    getFeed,
    getPostById,
    getUserPosts,
    deletePost,
    toggleLike,
};
