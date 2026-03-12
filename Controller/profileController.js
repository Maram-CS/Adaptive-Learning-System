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

        if(!user) return res.render("auth/createProfile",{error: "User not found. Please create an account first."});
        // check if the profile already exists for the user
        const existingProfile = await profileModel.findOne({ email });
        if(existingProfile) return res.render("auth/createProfile",{error: "Profile already exists" });

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
        res.render("auth/createProfile",{error: "Error creating profile. Please try again by filling all the required fields."});  
    }
};

const editProfile = async (req, res,next) => {
    try {
        const { email, firstName, lastName, userName, PhoneNumber, mainTrack, skillLevel,bio } = req.body;
        const profile = await profileModel.findOne({ email });
        if(!profile) return res.render("auth/editProfile",{error: "Profile not found. Please create a profile first."});

        if(req.file) {
            profile.profilePicture = `/uploads/${req.file.filename}`;
        }

        profile.firstName = firstName;
        profile.lastName = lastName;
        profile.userName = userName;
        profile.PhoneNumber = PhoneNumber;
        profile.mainTrack = mainTrack;
        profile.skillLevel = skillLevel;
        profile.bio = bio;

        await profile.save();

        res.render("auth/Profile-view",{profile});
        return next();
    } catch(err) {
        console.error(err);
        res.render("auth/editProfile",{error: "Error updating profile. Please try again by filling all the required fields."});
    }
};

export { createProfile, editProfile };