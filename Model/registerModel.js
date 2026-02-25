import { Schema } from "mongoose";
import {model} from "mongoose";
import bcrypt from "bcryptjs";

const registerSchema = new Schema({
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

registerSchema.pre('save',function(next) {
    const user = this;
    try {
    if(!user.isModified('password')){
        next();
    }else {
        salt  = bcrypt.genSalt(10,(err,salt)=>{
            if(err) {
                next();
            }else {
                bcrypt.hash(user.password,salt,(err,hash)=> {
                    if(err) {
                        next();
                    }
                    user.password = hash;
                    next();
                })
            }

        })
    }
}catch(err) {
    console.error(err);
}
})


 registerSchema.statics.login = async function(email,password) {
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

const registerModel = model('Register',registerSchema);
export default registerModel;