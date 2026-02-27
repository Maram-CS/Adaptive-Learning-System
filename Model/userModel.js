import { Schema } from "mongoose";
import {model} from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
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
        enum : ['student','teacher','admin']
    },
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
        try {
            const isUser = await bcrypt.compare(password,user.password);
                if(isUser) {
                    console.log("you are logged in ");
                    return user;
                }else {
                    console.log ("your password is wrong");
                }
            }catch(err) {
            console.error(err);
        }
    }else {
        throw Error ("this user not exist");
    }
}
const UserModel = model('User',UserSchema);
export default UserModel;