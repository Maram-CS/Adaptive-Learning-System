import userModel from "../Model/userModel.js";
import courseModel from "../Model/courseModel.js";


// This controller is responsible for handling the logic related to the teacher dashboard, such as rendering the dashboard page and fetching the teacher's profile information to display on the dashboard.

const getTeacherDashboard = async (req, res) => {
    try {
        const user = await userModel.findById(req.id);
        // total courses created by the teacher
        const totalCourses = await courseModel.countDocuments({ Instructor: req.id });
        // total students in the system
        const totalStudents = await userModel.countDocuments({ role: "student" });

        // if you have a quizModel, you can count the total quizzes created by the teacher like this:
        // const totalQuizzes = await quizModel.countDocuments({ instructor: req.id });

        //finally, fetch the courses created by the teacher to display on the dashboard
        const courses = await courseModel.find({ Instructor: req.id });

        res.render("auth/teacherDashboard", {
            user,
            totalCourses,
            totalStudents,
            totalQuizzes: 0 ,// default to 0 if you don't have a quizModel, otherwise replace with the actual count
             courses
        });

    } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        res.status(500).send("Internal Server Error");
    }
};

const createQuiz = async (req, res) => {
    try {
        const { courseId, title, level, questions, passingScore } = req.body;

        const course = await courseModel.findById(courseId);

        if (!course) return res.status(404).send("Course not found");

        // Ajouter le quiz avec le niveau
        course.quizzes.push({
            title,
            level: level || "beginner",  // ← AJOUTER level
            passingScore: passingScore || 70,  // ← AJOUTER passingScore
            questions: questions.map(q => ({
                question: q.question,
                options: q.options,
                correctAnswer: parseInt(q.correctAnswer)
            })),
            createdAt: new Date()
        });

        await course.save();

        res.redirect(`/courses/content/${course.slug}`);

    } catch (error) {
        console.error("createQuiz error:", error);
        res.status(500).send(error.message);
    }
};

const getSelectCourseForQuizPage = async (req, res) => {
    try {
        const course = await courseModel.findById(req.params.courseId);
        if (!course) return res.send("Course not found");
        
        res.render("auth/createQuiz", { course });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
export { getTeacherDashboard , createQuiz , getSelectCourseForQuizPage};