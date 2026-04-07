import userModel from "../Model/userModel.js";
import courseModel from "../Model/courseModel.js";

// This controller is responsible for handling the logic related to the teacher dashboard, such as rendering the dashboard page and fetching the teacher's profile information to display on the dashboard.

const getTeacherDashboard = async (req, res) => {
    try {
        const user = await userModel.findById(req.id);
        // عدد الكورسات تاع هذا الأستاذ فقط
        const totalCourses = await courseModel.countDocuments({ Instructor: req.id });
        // عدد الطلاب (مثلا كامل ولا مربوطين بالكورسات)
        const totalStudents = await userModel.countDocuments({ role: "student" });

        // إذا عندك quizModel
        // const totalQuizzes = await quizModel.countDocuments({ instructor: req.id });

        //njib courses t3 prof
        const courses = await courseModel.find({ Instructor: req.id });

        res.render("auth/teacherDashboard", {
            user,
            totalCourses,
            totalStudents,
            totalQuizzes: 0 ,// مؤقت حتى تديري quizModel
             courses
        });

    } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        res.status(500).send("Internal Server Error");
    }
};

export { getTeacherDashboard };