import { Schema,model } from "mongoose";

const courseSchema = new Schema({
    Title : {
        type : String,
        required : true,
    },
    Description : {
        type : String,
        required : true,
    },
    Instructor : {
        type : Schema.Types.ObjectId,
        ref : "userModel",
        required : true,
    },
    category : {
        type : String,
        required : true,
        enum : ["frontend", "backend", "database", "tools", "design", "deployment"],
    },
    image : {
        type : String,
        required : true,
    },
    rating : [
        {
            userId : String,
            value : Number,
        }
    ]

},{timestamps : true});

const courseModel = model("course",courseSchema);
export default courseModel;