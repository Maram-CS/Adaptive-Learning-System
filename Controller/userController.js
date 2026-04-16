import userModel from "../Model/userModel.js";
import UserDB from "../ConfigDB/userDB.js";
import profileModel from "../Model/profileModel.js";
import courseModel from "../Model/courseModel.js";
import { config } from "dotenv";

config();

const userDB = process.env.nameDb;
UserDB(userDB);



// add user function
const addUser = async (req, res, next) => {
    try {
        const { userName, email, password, role } = req.body;
        const isExist = await userModel.findOne({ email });
        
        if (isExist) {
            res.json({ status: "exists" });
        } else {
            const user = new userModel(req.body);
            const isUser = await user.save();

            if (isUser) {
                res.status(200).json({ status: "user Added", user: isUser });
            } else {
                res.status(400).json({ status: "error", message: "you have a mistake some where try again" });
            }
        }
        return next();
    } catch (err) {
        console.error(err);
    }
}

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
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

// Get All Users (without password)
 const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, '-password');
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// System Analytics Data
 const getSystemAnalytics = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const students = await userModel.countDocuments({ role: 'student' });
        const teachers = await userModel.countDocuments({ role: 'teacher' });
        
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


// Delete User by ID (للاستخدام مع Admin Dashboard)
 const deleteUser = async (req, res) => {
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




export { addUser, deleteUser ,getSystemAnalytics, getDashboardStats, getAllUsers};