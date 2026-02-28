import { Router } from "express";
import loginController from "../Controller/loginController.js";

const RouterLogin = Router();
RouterLogin.post('/login', loginController);
export default RouterLogin;