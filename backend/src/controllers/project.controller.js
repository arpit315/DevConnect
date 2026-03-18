import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Create a new project on a user's portfolio
const createProject = asyncHandler(async (req, res) => {
    const { title, description, githubUrl, liveUrl } = req.body;

    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required");
    }

    let imageUrls = [];
    console.log("FILES RECEIVED:", req.files?.length);
    if (req.files && req.files.length > 0) {
        // Upload all files to Cloudinary in parallel
        const uploadPromises = req.files.map(file => uploadOnCloudinary(file.path));
        const results = await Promise.all(uploadPromises);
        console.log("CLOUDINARY RESULTS:", results.map(r => !!r));

        // Filter out any failed uploads and extract URLs
        imageUrls = results
            .filter(res => res && (res.secure_url || res.url))
            .map(res => res.secure_url || res.url);

        console.log("FINAL URLS:", imageUrls.length);
        if (imageUrls.length === 0 && req.files.length > 0) {
            throw new ApiError(400, "Error while uploading project images");
        }
    }

    const project = await Project.create({
        title,
        description,
        githubUrl,
        liveUrl,
        images: imageUrls,
        author: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, project, "Project added successfully"));
});

// Get all projects for a specific user (public route)
const getUserProjects = asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) throw new ApiError(404, "User not found");

    const projects = await Project.find({ author: user._id }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

// Delete a project
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) throw new ApiError(404, "Project not found");

    if (project.author.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this project");
    }

    await Project.findByIdAndDelete(projectId);
    return res.status(200).json(new ApiResponse(200, {}, "Project deleted successfully"));
});

export { createProject, getUserProjects, deleteProject };
