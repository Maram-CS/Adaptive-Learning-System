import jwt from "jsonwebtoken";
import {config} from "dotenv";
config();
const password = process.env.secret;

const authRequest = (req,res,next) => {
    const token = req.cookies.token;
    if(!token) {
        res.status(401).json({message: "Unauthorized"});
        next();
    }
    try {
    const decoded = jwt.verify(token,password);
    req.id = decoded.id;
    next();
    }catch(err) {
        console.error(err);
    }

}

export default authRequest;