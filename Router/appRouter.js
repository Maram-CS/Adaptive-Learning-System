import {Router} from 'express';
import { viewProfile } from '../Controller/profileController.js';
import authRequest from '../middleware/authMiddleware.js';
import userModel from "../Model/userModel.js";
const AppRouter = Router();

AppRouter.get("/studentDashboard",(req,res)=>{
    res.render("auth/studentDashboard");
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
  try {
    const userId = req.cookies.userId;
    const user = await userModel.findById(userId);
    res.render("auth/teacherDashboard", {
      profile: user
    });
  } catch (err) {
    console.log(err);
  }
});
export default AppRouter;