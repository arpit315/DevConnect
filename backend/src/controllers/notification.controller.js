import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .populate("sender", "username fullName avatar")
        .populate("post", "content");

        
    return res
        .status(200)
        .json(new ApiResponse(200, notifications, "Notifications fetched successfully"));
});

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    if (notificationId) {
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } else {
        await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Notification(s) marked as read"));
});

const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Notification deleted"));
});

export { getNotifications, markAsRead, deleteNotification };
