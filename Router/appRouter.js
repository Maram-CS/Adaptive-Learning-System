import {Router} from 'express';

const AppRouter = Router();
AppRouter.get('/login', (req, res) => {
    res.render('auth/login');
});

AppRouter.get("/register",(req,res)=>{
    res.render("auth/register");
});

export default AppRouter;