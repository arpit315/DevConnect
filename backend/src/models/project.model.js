import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        images: {
            type: [String], // Array of Cloudinary URLs
            default: [],
        },
        githubUrl: {
            type: String,
            default: "",
        },
        liveUrl: {
            type: String,
            default: "",
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Project = mongoose.model("Project", projectSchema);
