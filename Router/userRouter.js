import { Router } from "express";
import {addUser}from "../Controller/userController.js";
import {loginUser} from "../Controller/authController.js";
const RouterLogin = Router();
RouterLogin.post('/login', loginUser);
RouterLogin.post('/register', addUser);
export default RouterLogin;