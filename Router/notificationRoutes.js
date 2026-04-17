import { Router } from "express";
import authRequest from "../middleware/authMiddleware.js";
import Notification from "../Model/notificationModel.js";

const router = Router();

// GET all notifications
router.get("/api/notifications", authRequest, async (req, res) => {
    try {
        const notifications = await Notification.find({
            studentId: req.id
        }).sort({ created_at: -1 });

        res.json({
            success: true,
            notifications
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

export default router;