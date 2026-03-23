import {Router} from 'express';
import { viewProfile } from '../Controller/profileController.js';
import authRequest from '../middleware/authMiddleware.js';
const AppRouter = Router();

AppRouter.get('/login', (req, res) => {
    res.render('auth/login');
});

AppRouter.get("/register",(req,res)=>{
    res.render("auth/register");
});

AppRouter.get("/home",(req,res)=>{
    res.render("auth/home");
});
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
export default AppRouter;