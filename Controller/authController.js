import userModel from "../Model/userModel.js";
import jwt from "jsonwebtoken";
import {config} from "dotenv";
config();

const password = process.env.secret;
const  createToken = (id, role)=> {
    return jwt.sign({id, role},password,{expiresIn: "3d"});
}

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.login(email, password);

    if (user) {

      const token = createToken(user._id, user.role);
      
       res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3 * 24 * 60 * 60 * 1000, 
      });

      //  check role
      if (user.role === "teacher") {
        return res.redirect("/teacherDashboard/get");
      } else if (user.role === "student") {
        return res.redirect("/App/courses");// Redirect to student dashboard or courses page(/studentDashboard/get)
      } else {
        return res.redirect("/login");
      }
    }

  } catch (err) {
  console.log("ERROR LOGIN:", err.message);
  res.send(err.message);
}
};
export {loginUser};