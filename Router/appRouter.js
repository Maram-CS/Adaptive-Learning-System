import {Router} from 'express';

const AppRouter = Router();
AppRouter.get('/login', (req, res) => {
    res.render('auth/login');
});

export default AppRouter;