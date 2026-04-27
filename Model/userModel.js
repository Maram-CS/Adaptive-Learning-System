import { Schema } from "mongoose";
import {model} from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role : {
        type : String,
        required: true,
        enum : ['student','teacher','admin'],
    },
    PhoneNumber : {
        type : String,
        required : false,
    },
    mainTrack : {
        type : String,
        required : false,
        enum: ['Web Development','Mobile Development','Frontend Development','Backend Development','Full Stack Development','DevOps','Cloud Computing','Other'],
    },
    skillLevel : {
        type : String,
        required : false,   
        enum: ['Beginner','Intermediate','Advanced','Expert'],
    },
    profilePicture : {
        type : String,
        required : false,
    },
    
    bio: {
    type: String,
    required: false,  
    },
    
    resetToken: String,
    resetTokenExpire: Date,
    
},{timestamps: true});

UserSchema.pre("save",async function(next) {
    const user = this;
    try {
        if(!user.isModified("password")) {
         next();
        }else {
        const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password,salt);
            user.password = hash;
            next();
        }
    }catch(err) {
        console.error(err);
    }});
               
        



 UserSchema.statics.login = async function(email,password) {
    const model = this;
    const user = await model.findOne({email});
    if(user) {
        
            const isUser = await bcrypt.compare(password,user.password);
                if(isUser) {
                    console.log("you are logged in ");
                    return user;
                }else {
                    console.log ("your password is wrong");
                    throw Error ("your password or email is wrong");
                }
            
            console.error(err);
        
    }else {
        throw Error ("this user not exist");
    }
}
const userModel = model('User',UserSchema);
export default userModel;