import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import mongoose from "mongoose";

// @desc    Send a message to a specific user
// @route   POST /api/v1/messages/send/:receiverId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        throw new ApiError(400, "Invalid receiver ID");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Message content cannot be empty");
    }

    // 1. Find the conversation between these two users
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    // 2. If it doesn't exist (first time chatting), create one
    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
        });
    }

    // 3. Create the actual message document
    const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
    });

    // 4. Add the message reference to the conversation
    if (newMessage) {
        conversation.messages.push(newMessage._id);
    }

    // Save the conversation with the new message ID
    await conversation.save();

    // Socket.io functionality to emit the message to the receiver in real-time
    const receiverSocketId = getReceiverSocketId(receiverId);

    // If the receiver is currently online (has an active socket connection)
    if (receiverSocketId) {
        // We use io.to(socketId).emit() to send a message to a specific client
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    return res
        .status(201)
        .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

// @desc    Get all messages between current user and a target user
// @route   GET /api/v1/messages/:targetUserId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
    const { targetUserId } = req.params;
    const senderId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
        throw new ApiError(400, "Invalid target user ID");
    }

    // Find the conversation and populate the actual message objects
    const conversation = await Conversation.findOne({
        participants: { $all: [senderId, targetUserId] },
    }).populate("messages");

    if (!conversation) {
        // If they haven't chatted before, just return an empty array
        return res.status(200).json(new ApiResponse(200, [], "No messages yet"));
    }
    


    const messages = conversation.messages;

    return res
        .status(200)
        .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

export { sendMessage, getMessages };
