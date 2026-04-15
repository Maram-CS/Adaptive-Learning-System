import userModel from "../Model/userModel.js";

// ========== Dashboard Statistics ==========
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const totalStudents = await userModel.countDocuments({ role: 'student' });
        const totalTeachers = await userModel.countDocuments({ role: 'teacher' });
        const totalCourses = 12; // يمكن جلبها من جدول Course لاحقاً

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalCourses
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ========== Get All Users ==========
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, '-password'); // لا نرسل كلمة المرور
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ========== Add New User ==========
export const addUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // التحقق من وجود المستخدم
        const existingUser = await userModel.findOne({ $or: [{ email }, { userName: username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        
        const newUser = new userModel({
            userName: username,
            email,
            password,
            role
        });
        
        await newUser.save();
        res.json({ success: true, message: "User added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ========== Delete User ==========
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await userModel.findByIdAndDelete(id);
        
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ========== System Analytics Data ==========
export const getSystemAnalytics = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const students = await userModel.countDocuments({ role: 'student' });
        const teachers = await userModel.countDocuments({ role: 'teacher' });
        
        // إحصائيات إضافية (تقديرية للعرض)
        const activeUsers = Math.floor(totalUsers * 0.7);
        const completionRate = 68;
        const topCourses = [
            { name: "React JS", enrollment: 45, completion: 82 },
            { name: "JavaScript Basics", enrollment: 38, completion: 91 },
            { name: "Python for Data Science", enrollment: 32, completion: 75 }
        ];
        
        res.json({
            success: true,
            analytics: {
                totalUsers,
                students,
                teachers,
                activeUsers,
                completionRate,
                topCourses
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};