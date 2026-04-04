import profileModel from "../Model/profileModel.js";
import userModel from "../Model/userModel.js";
import authRequest from "../middleware/authMiddleware.js";

 
// maram choufi work flow ta3k kifah rai7 ykoun hna 
// 1 diri save ll info ta3 profile f bd mba3d bah ytafichaw fi page wa7dha lazm tjibi info ta3 user b email ta3ou mba3d nafichihom fi page jdida

// create profile function
const createProfile = async (req, res,next) => {
    try {
        console.log(req.file);
        const { email, firstName, lastName, userName, PhoneNumber, mainTrack, skillLevel,bio } = req.body;
        // verify if the user exists(has an account) before creating the profile
        const user = await userModel.findById(req.id);  // req.id is the user id that we attached to the request object in the authRequest middleware after verifying the token

        if(!user) return res.render("auth/createProfile",{error: "User not found. Please create an account first."});
        // check if the profile already exists for the user
        const existingProfile = await profileModel.findOne({user: req.id});
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
        
    } catch(err) {
        console.error(err);
        res.render("auth/createProfile",{error: "Error creating profile. Please try again by filling all the required fields."});  
    }
};

const editProfile = async (req, res,next) => {
    try {
        const { email, firstName, lastName, userName, PhoneNumber, mainTrack, skillLevel,bio } = req.body;
        const profile = await profileModel.findOne({user: req.id});
        if(!profile) return res.render("auth/editProfile",{error: "Profile not found. Please create a profile first."});

        if(req.file) {
            profile.profilePicture = `/uploads/${req.file.filename}`;
        }
        profile.email = email;
        profile.firstName = firstName;
        profile.lastName = lastName;
        profile.userName = userName;
        profile.PhoneNumber = PhoneNumber;
        profile.mainTrack = mainTrack;
        profile.skillLevel = skillLevel;
        profile.bio = bio;

        await profile.save();

        res.render("auth/Profile-view",{profile});
        
    } catch(err) {
        console.error(err);
        res.render("auth/editProfile",{error: "Error updating profile. Please try again by filling all the required fields."});
    }
};
const viewProfile = async (req, res) => {
    try {
        const profile = await profileModel.findOne({ user: req.id });

        if (!profile) {
            return res.render("auth/createProfile");
        }
        //nfara9 bin teacher w student
        if (req.role === "teacher") {
      return res.render("auth/viewProfileTeacher", { profile });
    } else {
      return res.render("auth/Profile-view", { profile });
    }

    } catch (err) {
        console.error(err);
        return res.render("auth/editProfile");
    }
};
// lyna hdi hiya view profile for teacher 

export { createProfile, editProfile, viewProfile };