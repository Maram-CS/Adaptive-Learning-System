import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const password = process.env.secret;

const authRequest = (req,res,next)=>{

   const token = req.cookies.token;

   if(!token){
      return res.status(401).json({message:"Unauthorized"});
   }

   try{

      const decoded = jwt.verify(token,password);

      req.id = decoded.id; // Attach the user ID to the request object for further use in controllers
      req.role = decoded.role; // Attach the user role to the request object for further use in controllers

      next();

   }catch(err){

      console.error(err);
      return res.status(401).json({message:"Invalid token"});

   }

}

export default authRequest;