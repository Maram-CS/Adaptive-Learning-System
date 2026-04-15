import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    addUser,
    deleteUser,
    getSystemAnalytics
} from '../Controller/AdminController.js';

const router = express.Router();

// Routes API
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/users', addUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getSystemAnalytics);

export default router;