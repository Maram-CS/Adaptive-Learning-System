import userModel from "../Model/userModel.js";
import UserDB from "../ConfigDB/userDB.js";
import profileModel from "../Model/profileModel.js";
import courseModel from "../Model/courseModel.js";
import {config} from "dotenv";
config();

const userDB = process.env.nameDb;
UserDB(userDB);
// add user function
const addUser = async (req, res,next) => {
    try {
        //verify if the user already exists
        const {userName,email,password,role} = req.body;
        const isExist = await userModel.findOne({email});
        if(isExist) {
            res.json({status: "exists"});
        }else {
        //user don't exist
        const user = new userModel(req.body);
        const isUser = await user.save();

        if(isUser) {
            res.status(200).json({status: "user Added", user: isUser});
        }else {
            res.status(400).json({status: "error", message:"you have a mistake some where try again"});
        }
      
    }
    return next();
    }catch (err) {
        console.error(err);
    }
}



//delete user function
const deleteUser = async (req,res,next)=> {
    try {
        const {email} = req.body;
        const userWantToDelete = await userModel.findOne({email});
        if(userWantToDelete){
            const userId = userWantToDelete._id;
            const isDeleted = await userModel.findByIdAndDelete(userId);
            if(isDeleted) {
                res.json({status : "success"});
                res.status(200).json({message :"user deleted"});
            }else {
                res.json({status:"filed"});
                res.status(400).json({status:"filed operation"});
            }
        }
        return next();
    }catch(err) {
        console.error(err);
    }
}

export  {addUser,deleteUser};