import mongoose, { Schema } from "mongoose";

// --- WHAT IS THIS FILE? ---
// This is the blueprint for what a "Post" looks like in MongoDB.
// A post is any content a developer shares on the DevConnect feed —
// it could be a project update, a thought, or a code snippet with an image.
// --------------------------

const postSchema = new Schema(
    {
        // The text content of the post (required)
        content: {
            type: String,
            required: [true, "Post content is required"],
            trim: true,
            maxlength: [2000, "Post cannot exceed 2000 characters"],
        },

        // Optional multiple images attached to the post (Array of Cloudinary URLs)
        images: {
            type: [String],
            default: [],
        },

        // The user who created this post
        // 'ref: "User"' links this field to the User model (like a foreign key in SQL)
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Array of user IDs who liked this post
        // When a user likes a post, their _id is added to this array
        // When they unlike it, their _id is removed
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // Tags help categorize posts (e.g. ["javascript", "react", "open-source"])
        tags: [
            {
                type: String,
                trim: true,
                lowercase: true,
            },
        ],
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields automatically
    }
);

export const Post = mongoose.model("Post", postSchema);
