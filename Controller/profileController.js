import profileModel from "../Model/profileModel.js";
import userModel from "../Model/userModel.js";

 
// maram choufi work flow ta3k kifah rai7 ykoun hna 
// 1 diri save ll info ta3 profile f bd mba3d bah ytafichaw fi page wa7dha lazm tjibi info ta3 user b email ta3ou mba3d nafichihom fi page jdida

// create profile function
const createProfile = async (req, res,next) => {
    try {
        console.log(req.file);
        const { email, firstName, lastName, userName, PhoneNumber, university, specialty, yearOfStudy, mainTrack, skillLevel,bio } = req.body;
        //verify if the user exist in the database by email because email is unique for each user and we will use it to link the profile to the user
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
            university,
            specialty,
            yearOfStudy,
            mainTrack,
            skillLevel,
            bio,
            profilePicture: profilePicturePath
        });

        await profile.save();
        

        res.status(200).json({ status: "success", profile });
        return next();
    } catch(err) {
        console.error(err);
        res.status(500).json({ status: "error" });
    }
};


//get the profile
const getProfile = async (req,res,next) => {
    try {
    const {email} = req.params;// to get the email from the request parameters from the url
    const profile = await profileModel.findOne({email});
    if(profile) {
        res.render("/auth/infoProfile",profile);
    }else {
        res.status(400).json({message:"filed operation"});
    }
    return next();
    }catch(err) {
        console.error(err);
    }
}



export {createProfile,getProfile};