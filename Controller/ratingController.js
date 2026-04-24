import courseModel from "../Model/courseModel.js";

// ========== تقييم دورة (Rating) ==========
export const rateCourse = async (req, res) => {
    try {
        // استقبال البيانات من الطلب
        const { courseId, rating, userId } = req.body;
        
        // استخدام userId من body أو من middleware (req.id)
        const finalUserId = userId || req.id;
        
        // التحقق من وجود المستخدم
        if (!finalUserId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }
        
        // التحقق من صحة التقييم
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }
        
        // البحث عن الدورة
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        
        // البحث عن تقييم سابق للمستخدم
        const existingRatingIndex = course.rating.findIndex(r => r.userId.toString() === finalUserId);
        
        if (existingRatingIndex !== -1) {
            // تحديث التقييم الموجود
            course.rating[existingRatingIndex].value = rating;
            course.rating[existingRatingIndex].createdAt = new Date();
        } else {
            // إضافة تقييم جديد
            course.rating.push({
                userId: finalUserId,
                value: rating,
                createdAt: new Date()
            });
        }
        
        // حساب متوسط التقييم الجديد
        const total = course.rating.reduce((sum, r) => sum + r.value, 0);
        course.averageRating = total / course.rating.length;
        
        // حفظ التغييرات في قاعدة البيانات
        await course.save();
        
        // إرجاع النتيجة
        return res.json({
            success: true,
            message: "Rating saved successfully",
            averageRating: course.averageRating,
            userRating: rating
        });
        
    } catch (error) {
        console.error("rateCourse error:", error);
        return res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
};

// ========== جلب تقييم المستخدم لدورة محددة ==========
export const getUserRating = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.query.userId || req.id;
        
        if (!userId) {
            return res.json({ success: true, userRating: 0, averageRating: 0 });
        }
        
        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        
        const rating = course.rating.find(r => r.userId.toString() === userId);
        
        return res.json({
            success: true,
            userRating: rating ? rating.value : 0,
            averageRating: course.averageRating || 0
        });
        
    } catch (error) {
        console.error("getUserRating error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};