import UserModel from "../Model/userModel.js";
import UserDB from "../ConfigDB/userDB.js";
import {config} from "dotenv";
config();

const userDB = process.env.nameDb;
UserDB(userDB);

const addUser = async (req, res,next) => {
    try {
        const user = new UserModel(req.body);
        const isUser = await user.save();

        if(isUser) {
            res.status(200).json({message:"user Added", user: isUser});
        }else {
            res.status(400).json({message:"you have a mistake some where try again"});
        }
        next();
    }catch (err) {
        console.error(err);
    }
}


export  {addUser};

