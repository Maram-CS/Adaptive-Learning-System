import {Router} from 'express';

const AppRouter = Router();
AppRouter.get('/', (req, res) => {
    res.render('login.html');
});

export default AppRouter;