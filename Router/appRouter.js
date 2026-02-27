import {Router} from 'express';

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

export default AppRouter;