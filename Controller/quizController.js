import courseModel from "../Model/courseModel.js";
import userModel from "../Model/userModel.js";




const submitQuiz = async (req, res) => {
    try {
        const { courseId, quizId, answers } = req.body;

        const course = await courseModel.findById(courseId);
        if (!course) return res.send("Course not found");

        const quiz = course.quizzes.id(quizId);
        if (!quiz) return res.send("Quiz not found");

        let score = 0;

        quiz.questions.forEach((q, i) => {
            if (parseInt(answers[i]) === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / quiz.questions.length) * 100;

        let level = "beginner";
        if (percentage > 70) level = "advanced";
        else if (percentage > 40) level = "intermediate";

        // 🔥 save level to user
        await userModel.findByIdAndUpdate(req.id, {
            level: level
        });

        // 🔥 redirect to lessons
        return res.redirect(`/studentDashboard/course/${courseId}`);

    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getQuizPage = async (req, res) => {
    try {
        const { courseId, quizId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) return res.send("Course not found");

        const quiz = course.quizzes.id(quizId);
        if (!quiz) return res.send("Quiz not found");

        res.render("auth/quiz", {
            courseId,
            quiz
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
};
export {submitQuiz, getQuizPage};