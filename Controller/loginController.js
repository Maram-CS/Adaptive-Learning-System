import loginDB from "../ConfigDB/LoginDB.js";
import LoginModel from "../Model/LoginModel.js";
import registerModel from "../Model/registerModel.js";
import { config } from "dotenv";

config();
loginDB(process.env.nameDb || 'AdaptiveLearningSystem');

const loginController = async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await LoginModel.login(email,password);
        if(user) {
            res.status(200).json({message: "Login successful", user});
        }else {
            res.status(400).json({message: "Invalid email or password"});
        }
    }catch(err) {
        console.error(err);
        res.status(500).json({message: "Error logging in"});
    }
}

export default loginController;
