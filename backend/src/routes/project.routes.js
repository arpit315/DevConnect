import { Router } from "express";
import { createProject, getUserProjects, deleteProject } from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ── PUBLIC ROUTES ────────────────────────────────────────────────────────────
router.route("/user/:username").get(getUserProjects);

// ── SECURED ROUTES ───────────────────────────────────────────────────────────
router.route("/").post(verifyJWT, upload.array("images", 5), createProject);
router.route("/:projectId").delete(verifyJWT, deleteProject);

export default router;
