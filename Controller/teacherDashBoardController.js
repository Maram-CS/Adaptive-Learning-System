import userModel from "../Model/userModel.js";
import courseModel from "../Model/courseModel.js";

const getTeacherDashboard = async (req, res) => {
    try {
        const user = await userModel.findById(req.id);

        const totalCourses = await courseModel.countDocuments({ Instructor: req.id });

        const totalStudents = await userModel.countDocuments({ role: "student" });
        
        const courses = await courseModel.find({ Instructor: req.id });

        const totalQuizzes = courses.reduce((acc, course) => {
            return acc + (course.quizzes?.length || 0);
        }, 0);

        // Calculate average rating for each course
        const enrichedCourses = courses.map(course => {
            const ratingsCount = course.rating?.length || 0;

            const average = ratingsCount > 0
                ? course.rating.reduce((sum, r) => sum + r.value, 0) / ratingsCount
                : 0;

            return {
                ...course.toObject(),
                ratingsCount,
                averageRating: average.toFixed(1)
            };
         })
        .sort((a, b) => b.averageRating - a.averageRating);

        res.render("auth/teacherDashboard", {
            user,
            totalCourses,
            totalStudents,
            totalQuizzes,
            courses: enrichedCourses
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

        course.quizzes.push({
            title,
            level: level || "beginner",
            passingScore: passingScore || 70,
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

export { getTeacherDashboard, createQuiz, getSelectCourseForQuizPage };