import {Router} from 'express';
import { viewProfile } from '../Controller/profileController.js';
import authRequest from '../middleware/authMiddleware.js';
import userModel from "../Model/userModel.js";

const AppRouter = Router();
const __dirname = import.meta.dirname;

// ============================================
// Student Dashboard Route
// ============================================
AppRouter.get("/studentDashboard", async (req, res) => {
    try {
        // استخدام المستخدم الحالي من التوكن (authMiddleware يضيف req.id)
        const user = await userModel.findById(req.id);
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

AppRouter.get("/courses",(req,res)=>{
    res.render("auth/courses");
});

AppRouter.get("/editProfile",authRequest,(req,res)=>{
    if (req.role === "teacher") {
        return res.render("auth/editProfileTeacher");
      }else {
        return res.render("auth/editProfile");
      }
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

AppRouter.get("/createQuiz", (req, res) => {
    res.sendFile(join(__dirname, "../views/createQuiz.html"));
});

export default AppRouter;