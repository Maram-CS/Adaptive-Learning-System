import {Router} from 'express';
import authRequest from '../middleware/authMiddleware.js';

const AppRouter = Router();


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
    res.render("createQuiz");
});

AppRouter.get("/studentAnalytics", (req, res) => {
    res.render("auth/studentAnalytics");
});
export default AppRouter;