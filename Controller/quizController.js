import courseModel from "../Model/courseModel.js";
import userModel from "../Model/userModel.js";
import levelProgressModel from "../Model/progressLevelModel.js";

// ─── Score a single question based on its type ────────────────────────────────
function scoreQuestion(question, rawAnswer) {
    const type = question.questionType || "multiple-choice";

    switch (type) {
        case "multiple-choice":
        case "true-false": {
            // rawAnswer is a string like "0", "1", "2" …
            return parseInt(rawAnswer) === question.correctAnswer ? 1 : 0;
        }

        case "multi-select": {
            // rawAnswer is an array of strings ["0","2"] or a single string
            const submitted = (Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer])
                .map(Number)
                .sort();
            const correct = [...(question.correctAnswers || [])].sort();

            if (submitted.length !== correct.length) return 0;
            return submitted.every((v, i) => v === correct[i]) ? 1 : 0;
        }

        case "written": {
            // case-insensitive exact match (trimmed)
            const expected = (question.correctAnswerText || "").trim().toLowerCase();
            const given = (rawAnswer || "").toString().trim().toLowerCase();
            return given === expected ? 1 : 0;
        }

        default:
            return 0;
    }
}

// ─── Submit a level quiz ──────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
    try {
        const { courseId, quizId, answers, level } = req.body;
        const userId = req.id;

        const course = await courseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const quiz = course.quizzes.id(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        // Score every question
        let score = 0;
        quiz.questions.forEach((q, i) => {
            score += scoreQuestion(q, answers[i]);
        });

        const percentage = Math.round((score / quiz.questions.length) * 100);
        const passingScore = quiz.passingScore || 70;
        const passed = percentage >= passingScore;

        // Update LevelProgress
        let levelProgress = await levelProgressModel.findOne({ userId, courseId });
        if (!levelProgress) {
            levelProgress = await levelProgressModel.create({
                userId,
                courseId,
                currentLevel: level || "beginner"
            });
        }

        const levelKey = level || levelProgress.currentLevel;
        const levelData = levelProgress.levels[levelKey];
        if (levelData) {
            levelData.quizPassed = passed;
            levelData.lastScore = percentage;
            levelData.quizAttempts += 1;
        }

        let nextLevel = null;
        let message = "";

        if (passed) {
            const levels = ["beginner", "intermediate", "advanced"];
            const currentIndex = levels.indexOf(levelKey);

            if (currentIndex < levels.length - 1) {
                nextLevel = levels[currentIndex + 1];
                levelProgress.currentLevel = nextLevel;
                message = `🎉 Congratulations! Score: ${percentage}%. You advance to ${nextLevel.toUpperCase()}!`;
            } else {
                levelProgress.currentLevel = "completed";
                levelProgress.completedAt = new Date();
                message = `🎓 BRAVO! You completed the course with ${percentage}%! 🎓`;
            }
        } else {
            message = `❌ Score: ${percentage}%. Review the lessons and try again! (Minimum: ${passingScore}%)`;
        }

        await levelProgress.save();

        await userModel.findByIdAndUpdate(userId, { level: levelProgress.currentLevel });

        // Always respond with JSON (page uses fetch)
        return res.json({
            success: true,
            passed,
            percentage,
            nextLevel,
            currentLevel: levelProgress.currentLevel,
            message,
            needsRetry: !passed
        });

    } catch (error) {
        console.error("submitQuiz error:", error);
        return res.status(500).json({ message: error.message });
    }
};

// ─── Get quiz page (legacy fallback) ─────────────────────────────────────────
const getQuizPage = async (req, res) => {
    try {
        const { courseId, quizId } = req.params;

        const course = await courseModel.findById(courseId);
        if (!course) return res.send("Course not found");

        const quiz = course.quizzes.id(quizId);
        if (!quiz) return res.send("Quiz not found");

        res.render("auth/quiz", { courseId, quiz });

    } catch (error) {
        res.status(500).send(error.message);
    }
};

export { submitQuiz, getQuizPage };