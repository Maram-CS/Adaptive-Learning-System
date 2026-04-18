import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({

userId:{
type: mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

courseId:{
type: mongoose.Schema.Types.ObjectId,
ref:"Course",
required:true
},

lessonId:{
type: mongoose.Schema.Types.ObjectId,
required:true
},

progress:{
type:Number,
default:0
},

completed:{
type:Boolean,
default:false
},

pointsEarned:{
type:Number,
default:0
},

lastUpdated:{
type:Date,
default:Date.now
}

})

export default mongoose.model("Progress",progressSchema)