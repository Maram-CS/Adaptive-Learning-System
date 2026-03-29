import {Router} from 'express';


const publicRouter = Router();

publicRouter.get('/login', (req, res) => {
    res.render('auth/login');
});

publicRouter.get("/register",(req,res)=>{
    res.render("auth/register");
});

publicRouter.get("/home",(req,res)=>{
    res.render("auth/home");
});
publicRouter.get("/contact",(req,res)=>{
    res.render("auth/contactUs");
});



export default publicRouter;