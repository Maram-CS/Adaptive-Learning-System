import { Router } from "express";
import {addUser,deleteUser}from "../Controller/userController.js";
import {loginUser} from "../Controller/authController.js";
const RouterLogin = Router();
RouterLogin.post('/login', loginUser);
RouterLogin.post('/register', addUser);
RouterLogin.post('/delete',deleteUser);

export default RouterLogin;