import {Router} from 'express';
import { viewProfile } from '../Controller/profileController.js';
import authRequest from '../middleware/authMiddleware.js';
import userModel from "../Model/userModel.js";

const AppRouter = Router();

// ============================================
// Student Dashboard Route
// ============================================
AppRouter.get("/studentDashboard", async (req, res) => {
    try {
        // جلب أول مستخدم من قاعدة البيانات (للتجربة)
        const user = await userModel.findOne({ role: "student" });
        if (user) {
            console.log('Found user:', user.userName, 'ID:', user._id);
            res.render("auth/studentDashboard", { userId: user._id.toString() });
        } else {
            console.log('No student found in database');
            res.render("auth/studentDashboard", { userId: null });
        }
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.render("auth/studentDashboard", { userId: null });
    }
});

AppRouter.get("/createProfile",(req,res)=>{
    res.render("auth/createProfile");
});

AppRouter.get("/infoProfile",viewProfile);

AppRouter.get("/courses",(req,res)=>{
    res.render("auth/courses");
});

AppRouter.get("/editProfile",(req,res)=>{
    res.render("auth/editProfile");
});

AppRouter.get("/course",(req,res)=>{
    res.render("auth/course");
});

AppRouter.get("/favoriteCourses",(req,res)=>{
    res.render("auth/favoriteCourses");
});

AppRouter.get("/teacherDashboard", async (req, res) => {
  res.render("auth/teacherDashboard");
});

AppRouter.get("/createCourse", async (req, res) => {
    res.render("auth/createCourse");
});

export default AppRouter;