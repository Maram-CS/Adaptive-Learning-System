import { Schema, model } from "mongoose";

const ProgressSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }, // ربط التقدم بمستخدم معين
    courseId: { 
        type: Number, 
        required: true 
    }, // معرف الدورة (1, 2, 3...)
    lessonId: { 
        type: Number, 
        required: true 
    }, // معرف الدرس (1, 2, 3...)
    progress: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 100 
    }, // النسبة المئوية للتقدم في هذا الدرس
    completed: { 
        type: Boolean, 
        default: false 
    }, // هل تم إكمال الدرس؟
    pointsEarned: { 
        type: Number, 
        default: 0 
    }, // النقاط التي حصل عليها الطالب من هذا الدرس
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    } // تاريخ آخر تحديث
});

const ProgressModel = model('Progress', ProgressSchema);
export default ProgressModel;