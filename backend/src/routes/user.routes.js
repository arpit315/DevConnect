import { Router } from "express";
import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    getCurrentUser,
    getUserProfile,
    updateAccountDetails,
    updateUserAvatar,
    getAllUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ── PUBLIC ROUTES (no login required) ────────────────────────────────────────
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// GET /api/v1/users/profile/:username  →  View anyone's public profile
router.route("/profile/:username").get(getUserProfile);

// ── SECURED ROUTES (login required — verifyJWT runs first) ───────────────────
router.route("/all").get(verifyJWT, getAllUsers);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/update-details").patch(verifyJWT, updateAccountDetails);

// upload.single("avatar") tells Multer to look for a file in the "avatar" field of the form
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

export default router;
