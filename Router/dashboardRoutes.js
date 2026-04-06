import express from 'express';
import authRequest from '../middleware/authMiddleware.js';
import { getStudentDashboardData ,getStudentDashboard , getLeaderboardData } from '../Controller/studentDashboardController.js';

const studentDashboardRouter = express.Router();

studentDashboardRouter.get('/get', authRequest, getStudentDashboardData);

studentDashboardRouter.get('/leaderboard', authRequest, getLeaderboardData);

studentDashboardRouter.get('/', authRequest, getStudentDashboard);
   

export default studentDashboardRouter;