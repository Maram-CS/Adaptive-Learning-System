import registerModel from "../Model/registerModel.js";


const addUser = async (req, res) => {
    try {
        const user = new registerModel(req.body);
        const isUser = await user.save();

        if(isUser) {
            res.status(200).json({message:"user Added"});
        }else {
            res.status(400).json({message:"you have a mistake some where try again"});
        }
        next();
    }catch (err) {
        console.error(err);
    }
}

const register = async (req, res) => {
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

export default registerController;