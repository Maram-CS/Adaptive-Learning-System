import express from 'express';
import ProgressModel from '../Model/Progress.js';
import userModel from '../Model/userModel.js';
import authRequest from '../middleware/authMiddleware.js';
import { getStudentDashboardData } from '../Controller/studenrDashboardController.js';

const router = express.Router();

// ============================================
// API لجلب بيانات الداشبورد لمستخدم معين
// المسار: GET /api/dashboard/data/:userId
// ============================================
router.get('/data/:userId', authRequest, getStudentDashboardData);

// API لجلب الـ Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await userModel.find({}, 'userName');
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const leaderboardData = await ProgressModel.aggregate([
            { $match: { lastUpdated: { $gte: oneWeekAgo } } },
            { $group: { _id: "$userId", totalPoints: { $sum: "$pointsEarned" } } },
            { $sort: { totalPoints: -1 } },
            { $limit: 5 }
        ]);
        
        const leaderboard = leaderboardData.map((item, index) => {
            const user = users.find(u => u._id.toString() === item._id.toString());
            return {
                name: user ? user.userName : "Unknown",
                points: item.totalPoints,
                badge: index === 0 ? "🔥" : (index === 1 ? "⭐" : (index === 2 ? "📈" : "")),
                isCurrentUser: false
            };
        });
        
        res.json({ success: true, leaderboard });
        
    } catch (error) {
        console.error("Leaderboard API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

export default router;