import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Every route in this file requires the user to be logged in
router.use(verifyJWT);

// Route: /api/v1/messages/send/:receiverId 
// Body expects JSON: { "content": "Hello!" }
router.route("/send/:receiverId").post(sendMessage);

// Route: /api/v1/messages/:targetUserId
router.route("/:targetUserId").get(getMessages);

export default router;
