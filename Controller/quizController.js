import courseModel from "../Model/courseModel.js";
import userModel from "../Model/userModel.js";
import levelProgressModel from "../Model/progressLevelModel.js";
import progressModel from "../Model/Progress.js";


const submitQuiz = async (req, res) => {
    try {
        const { courseId, quizId, answers, level } = req.body;
        const userId = req.id;

        const course = await courseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const quiz = course.quizzes.id(quizId);
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        // Calculer le score
        let score = 0;
        quiz.questions.forEach((q, i) => {
            if (parseInt(answers[i]) === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / quiz.questions.length) * 100;
        const passingScore = quiz.passingScore || 70;
        const passed = percentage >= passingScore;

        // Récupérer LevelProgress
        let levelProgress = await levelProgressModel.findOne({ userId, courseId });
        
        if (!levelProgress) {
            levelProgress = await levelProgressModel.create({
                userId,
                courseId,
                currentLevel: level || "beginner"
            });
        }

        // Mettre à jour le niveau correspondant
        const levelData = levelProgress.levels[level || levelProgress.currentLevel];
        if (levelData) {
            levelData.quizPassed = passed;
            levelData.lastScore = percentage;
            levelData.quizAttempts += 1;
        }

        let nextLevel = null;
        let message = "";

        if (passed) {
            const levels = ["beginner", "intermediate", "advanced"];
            const currentIndex = levels.indexOf(level || levelProgress.currentLevel);
            
            if (currentIndex < levels.length - 1) {
                nextLevel = levels[currentIndex + 1];
                levelProgress.currentLevel = nextLevel;
                message = `🎉 Félicitations ! Score: ${percentage}%. Tu passes au niveau ${nextLevel.toUpperCase()}!`;
            } else {
                levelProgress.currentLevel = "completed";
                levelProgress.completedAt = new Date();
                message = `🎓 BRAVO ! Tu as complété le cours avec ${percentage}% ! 🎓`;
            }
        } else {
            message = `❌ Score: ${percentage}%. Tu dois revoir les leçons et réessayer le quiz! (Minimum: ${passingScore}%)`;
        }

        await levelProgress.save();

        // Mettre à jour le niveau de l'utilisateur
        await userModel.findByIdAndUpdate(userId, {
            level: levelProgress.currentLevel
        });

        // Si c'est une requête AJAX (depuis courseLearn.ejs)
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({
                success: true,
                passed,
                percentage,
                nextLevel,
                currentLevel: levelProgress.currentLevel,
                message,
                needsRetry: !passed
            });
        }
        
        // Sinon redirection normale (pour l'ancien système)
        if (passed) {
            return res.redirect(`/studentDashboard/course/${courseId}`);
        } else {
            return res.redirect(`/quiz/course/${courseId}/quiz/${quizId}?error=low_score`);
        }

    } catch (error) {
        console.error("submitQuiz error:", error);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(500).json({ message: error.message });
        }
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

export { submitQuiz, getQuizPage };


