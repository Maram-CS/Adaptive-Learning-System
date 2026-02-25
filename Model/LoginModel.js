import bcrypt from "bcryptjs";
import { Schema } from "mongoose";
import { model } from "mongoose";

const LoginSchema = new Schema({
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
    }
},{
    timestamps: true});


LoginSchema.pre('save', function(next) {
    const user = this; 
    try {
    if (!user.isModified('password')) {
        next();
    }else {

        salt = bcrypt.genSalt(10,(err, salt) => {
            if(err) {
                next();
            }else {
                bcrypt.hash(user.password,salt,(err, hash) => {
                    if(err) {
                        next(err);
                    }else {
                        user.password = hash;
                        next();
                    }
                })
            }
    })
       
}}catch(err){
    console.error('Error hashing password:', err);
    next(err);
}});
    
LoginSchema.static.login = async function(email, password) {
    const model = this;
    try {
        const user = await model.findOne({email});
        if(!user) {
            throw Error('Incorrect email');
            next();
        }else {
            if(bcrypt.compare(password, user.password)) {
                return user;
            }else {
                throw Error('Incorrect password');
                next();
            }
        }
    }catch(err) {
        console.error(err);
    }

}

const LoginModel = model('Login',LoginSchema);
export default LoginModel;