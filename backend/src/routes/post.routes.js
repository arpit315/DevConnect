import { Router } from "express";
import {
    createPost,
    getFeed,
    getPostById,
    getUserPosts,
    deletePost,
    toggleLike,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ── PUBLIC ROUTES (no login required) ────────────────────────────────────────
router.route("/feed").get(getFeed);
router.route("/:postId").get(getPostById);
router.route("/user/:username").get(getUserPosts);

// ── SECURED ROUTES (login required) ──────────────────────────────────────────
// upload.single("image") → Multer accepts an optional image file in the "image" form field
router.route("/").post(verifyJWT, upload.single("image"), createPost);
router.route("/:postId").delete(verifyJWT, deletePost);
router.route("/:postId/like").post(verifyJWT, toggleLike);

export default router;
