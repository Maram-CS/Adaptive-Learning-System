import UserModel from "../Model/userModel.js";
import jwt from "jsonwebtoken";
import {config} from "dotenv";
config();

const password = process.env.secret;
const  createToken = (id)=> {
    return jwt.sign({id},password,{expiresIn: "3d"});
}


const loginUser = async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await UserModel.login(email,password);
        if(user) {
            const token = createToken(user._id);
            res.cookie("token",token,{httpOnly : true, maxAge : 3*24*60*60*1000});
            res.render("auth/home");
        }else {
            res.status(400).json({message: "Invalid email or password"});
        }
    }catch(err) {
        console.error(err);
        res.status(500).json({message: "Error logging in"});
    }
}


export {loginUser};