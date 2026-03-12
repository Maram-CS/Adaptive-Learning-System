import profileModel from "../Model/profileModel.js";
import userModel from "../Model/userModel.js";

 
// maram choufi work flow ta3k kifah rai7 ykoun hna 
// 1 diri save ll info ta3 profile f bd mba3d bah ytafichaw fi page wa7dha lazm tjibi info ta3 user b email ta3ou mba3d nafichihom fi page jdida

// create profile function
const createProfile = async (req, res,next) => {
    try {
        console.log(req.file);
        const { email, firstName, lastName, userName, PhoneNumber, mainTrack, skillLevel,bio } = req.body;
        // verify if the user exists(has an account) before creating the profile
        const user = await userModel.findOne({ email });
        if(!user) return res.status(404).json({ status: "error", message: "User not found" });

        const profilePicturePath = req.file ? `/uploads/${req.file.filename}` : undefined;

        const profile = new profileModel({
            user: user._id,
            email,
            firstName,
            lastName,
            userName,
            PhoneNumber,
            mainTrack,
            skillLevel,
            bio,
            profilePicture: profilePicturePath
        });

        await profile.save();
        

        res.render("auth/Profile-view",{profile});
        return next();
    } catch(err) {
        console.error(err);
        res.status(500).json({ status: "error" });
    }
};




export {createProfile};