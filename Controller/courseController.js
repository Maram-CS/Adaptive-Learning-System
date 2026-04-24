import courseModel from "../Model/courseModel.js";
import { notifyNewCourse } from "./notificationController.js";
import levelProgressModel from "../Model/progressLevelModel.js";
import progressModel from "../Model/Progress.js";
import QuizMistake from "../Model/recommandation.js";
import { extractTopic } from "../utils/topicExtractor.js";
import {
    calculateCurrentStreak,
    calculateQuizAverage,
    calculateCourseProgressPercent,
    calculateTimeSpentMinutes,
    formatMinutesAsHoursAndMinutes
} from "../utils/learningStats.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseLessons(bodyLessons = {}, lessonFiles = []) {
    const lessonsArray = Object.values(bodyLessons);
    return lessonsArray.map((lesson, index) => ({
        name: lesson.name || "",
        type: lesson.type || "video",
        duration: lesson.duration || "",
        file: lessonFiles[index]?.filename ? `/uploads/${lessonFiles[index].filename}` : ""
    }));
}

// Parse questions from req.body for all 4 question types
function parseQuestions(rawQuestions = []) {
    return rawQuestions.map(q => {
        const base = {
            question: q.question || "",
            questionType: q.questionType || "multiple-choice",
        };

        switch (base.questionType) {
            case "true-false":
                return {
                    ...base,
                    options: ["True", "False"],
                    correctAnswer: parseInt(q.correctAnswer) || 0,
                };

            case "multiple-choice":
                return {
                    ...base,
                    options: Array.isArray(q.options) ? q.options : [],
                    correctAnswer: parseInt(q.correctAnswer) || 0,
                };

            case "multi-select":
                return {
                    ...base,
                    options: Array.isArray(q.options) ? q.options : [],
                    correctAnswers: Array.isArray(q.correctAnswers)
                        ? q.correctAnswers.map(Number)
                        : [],
                };

            case "written":
                return {
                    ...base,
                    correctAnswerText: q.correctAnswerText || "",
                };

            default:
                return base;
        }
    });
}

// ─── CREATE COURSE ────────────────────────────────────────────────────────────
const createCourse = async (req, res) => {
    try {
        const instructorId = req.id;
        if (!instructorId) return res.status(401).json({ message: "Unauthorized" });

        const existingCourse = await courseModel.findOne({
            Title: req.body.Title,
            Instructor: instructorId
        });
        if (existingCourse) return res.status(400).json({ message: "Course already exists" });

        const imagePath = req.files?.image?.[0]
            ? `/uploads/${req.files.image[0].filename}`
            : null;
        if (!imagePath) return res.status(400).json({ message: "Course thumbnail is required" });

        const uploadedFiles = req.files?.lessonFiles || [];
        const lessonsFromForm = Object.values(req.body.lessons || {});
        const lessons = lessonsFromForm.map((lesson, index) => ({
            name: lesson.name || "",
            type: lesson.type || "video",
            duration: lesson.duration || "",
            level: lesson.level,
            file: uploadedFiles[index] ? `/uploads/${uploadedFiles[index].filename}` : ""
        }));

        let resources = [];
        if (req.body.resources) {
            try { resources = JSON.parse(req.body.resources); } catch { resources = []; }
        }

        const isPublished = req.body.isPublished === "on";

        const course = new courseModel({
            Title: req.body.Title,
            Description: req.body.Description,
            category: req.body.category,
            totalDuration: req.body.totalDuration || "Coming soon",
            level: req.body.level || "beginner",
            price: parseFloat(req.body.price) || 0,
            slug: req.body.slug || undefined,
            Instructor: instructorId,
            isPublished,
            image: imagePath,
            lessons,
            resources
        });

        const savedCourse = await course.save();
        await notifyNewCourse(instructorId, savedCourse);

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({ success: true, course: savedCourse });
        }
        return res.redirect("/teacherDashboard/get");

    } catch (err) {
        console.error("createCourse error:", err);
        if (err.code === 11000) return res.status(400).json({ message: "A course with this title already exists" });
        return res.status(500).json({ message: "Internal server error: " + err.message });
    }
};

// ─── GET ALL COURSES ──────────────────────────────────────────────────────────
const getAllCourses = async (req, res) => {
    try {
        const allCourses = await courseModel.find({ isPublished: true });
        return res.render("auth/courses", { courses: allCourses });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET BY SLUG (teacher/admin) ──────────────────────────────────────────────
const getCourseBySlug = async (req, res) => {
    try {
        const course = await courseModel
            .findOne({ slug: req.params.slug })
            .populate("Instructor", "userName email");

        if (!course) return res.status(404).json({ message: "Course not found" });

        if (req.role === "student") return res.render("auth/courseDetailStudent", { course });
        return res.render("auth/editCourse", { course });

    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET COURSE PAGE FOR STUDENT ─────────────────────────────────────────────
// Logic:
//   1. If student already completed the placement quiz → redirect to /learn
//   2. Otherwise → render course.ejs with the placement quiz embedded
const getCourseBySlugForStudent = async (req, res) => {
    try {
        const course = await courseModel
            .findOne({ slug: req.params.slug })
            .populate("Instructor", "userName email");

        if (!course) return res.status(404).send("Course not found");

        const userId = req.id;
        const levelProgress = await levelProgressModel.findOne({ userId, courseId: course._id });
        const courseProgress = await progressModel.find({ userId, courseId: course._id }).sort({ lastUpdated: -1 });
        const allUserProgress = await progressModel.find({ userId }).sort({ lastUpdated: -1 });
        const completedLessons = courseProgress.filter(item => item.completed).length;
        const timeSpent = formatMinutesAsHoursAndMinutes(
            calculateTimeSpentMinutes(course, courseProgress)
        );
        const courseStats = {
            completedLessons,
            totalLessons: course.lessons?.length || 0,
            progressPercent: calculateCourseProgressPercent(course, courseProgress),
            currentStreak: calculateCurrentStreak(allUserProgress),
            timeSpentText: `${timeSpent.hours}h ${timeSpent.minutes}m`,
            quizAverage: calculateQuizAverage(levelProgress ? [levelProgress] : [])
        };

        // Already placed → go straight to learning
        if (levelProgress && levelProgress.placementCompleted) {
            return res.redirect(`/courses/course/${course.slug}/learn`);
        }

        // Find the placement quiz (quizType = "placement")
        const placementQuiz = course.quizzes.find(q => q.quizType === "placement")
            || course.placementQuiz   // fallback: old structure
            || null;

        return res.render("auth/course", {
            course,
            courseStats,
            placementQuiz,
            showPlacementQuiz: !!placementQuiz
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send("Error loading course");
    }
};

// ─── GET LESSONS PAGE (teacher) ───────────────────────────────────────────────
const getCourseLessonsPage = async (req, res) => {
    try {
        const course = await courseModel.findOne({
            slug: req.params.slug,
            Instructor: req.id
        });
        if (!course) return res.status(404).send("Course not found");

        const placementQuiz = course.quizzes.find(q => q.quizType === "placement") || null;
        const quizzesByLevel = {
            beginner:     course.quizzes.filter(q => q.quizType === "level" && q.level === "beginner"),
            intermediate: course.quizzes.filter(q => q.quizType === "level" && q.level === "intermediate"),
            advanced:     course.quizzes.filter(q => q.quizType === "level" && q.level === "advanced"),
        };

        return res.render("auth/courseLessons", {
            course,
            lessons: course.lessons || [],
            quizzesByLevel,
            placementQuiz
        });

    } catch (err) {
        console.error("getCourseLessonsPage error:", err);
        return res.status(500).send("Server error");
    }
};

// ─── COMPLETE A LESSON ────────────────────────────────────────────────────────
const completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.id;

        let progress = await progressModel.findOne({ userId, courseId, lessonId });
        if (!progress) {
            progress = new progressModel({
                userId, courseId, lessonId,
                completed: true, progress: 100, pointsEarned: 10, lastUpdated: new Date()
            });
        } else {
            progress.completed = true;
            progress.progress = 100;
            progress.pointsEarned = 10;
            progress.lastUpdated = new Date();
        }
        await progress.save();

        const course = await courseModel.findById(courseId);
        const levelProgress = await levelProgressModel.findOne({ userId, courseId });
        const currentLevelLessons = course.lessons.filter(l => l.level === levelProgress.currentLevel);
        const completedLessons = await progressModel.find({
            userId, courseId,
            lessonId: { $in: currentLevelLessons.map(l => l._id) },
            completed: true
        });
        const allCompleted = completedLessons.length === currentLevelLessons.length;

        return res.json({
            success: true,
            allCompleted,
            message: allCompleted
                ? "🎉 All lessons completed! You can now take the quiz!"
                : "Lesson completed!"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

// ─── EDIT COURSE ──────────────────────────────────────────────────────────────
const editCourse = async (req, res) => {
    try {
        const course = await courseModel.findOne({ slug: req.params.slug, Instructor: req.id });
        if (!course) return res.status(404).json({ message: "Course not found" });

        const { Title, Description, category, totalDuration, level, price, slug, isPublished } = req.body;
        if (Title) course.Title = Title;
        if (Description) course.Description = Description;
        if (category) course.category = category;
        if (totalDuration) course.totalDuration = totalDuration;
        if (level) course.level = level;
        if (price !== undefined) course.price = parseFloat(price) || 0;
        if (slug) course.slug = slug;
        if (isPublished !== undefined) course.isPublished = isPublished === "on";

        if (req.files?.image?.[0]) course.image = `/uploads/${req.files.image[0].filename}`;

        if (req.body.lessons) {
            const uploadedFiles = req.files?.lessonFiles || [];
            const lessonsFromForm = Object.values(req.body.lessons);
            let fileCounter = 0;
            const updatedLessons = [];

            for (let i = 0; i < lessonsFromForm.length; i++) {
                const lesson = lessonsFromForm[i];
                let filePath = "";
                if (!lesson.existingFile || lesson.existingFile === "") {
                    if (fileCounter < uploadedFiles.length) {
                        filePath = `/uploads/${uploadedFiles[fileCounter].filename}`;
                        fileCounter++;
                    }
                } else {
                    filePath = lesson.existingFile;
                }
                updatedLessons.push({
                    name: lesson.name || "",
                    type: lesson.type || "video",
                    duration: lesson.duration || "",
                    level: lesson.level || "beginner",
                    file: filePath
                });
            }
            course.lessons = updatedLessons;
        }

        await course.save();

        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.json({ success: true, course });
        }
        return res.redirect("/teacherDashboard/get");

    } catch (err) {
        console.error("editCourse error:", err);
        return res.status(500).json({ message: "Internal server error: " + err.message });
    }
};

const getEditCoursePage = async (req, res) => {
    try {
        const course = await courseModel.findOne({ slug: req.params.slug });
        if (!course) return res.send("Course not found");
        res.render("auth/editCourse", { course });
    } catch (err) {
        console.error(err);
        res.send("Error loading edit page");
    }
};

const getLessonsByLevel = async (req, res) => {
    try {
        const { courseId, level } = req.params;
        const course = await courseModel.findById(courseId);
        const lessons = course.lessons.filter(l => l.level === level);
        res.render("auth/courseLessons", { course, lessons, level });
    } catch (error) {
        res.send(error.message);
    }
};

const deleteCourse = async (req, res) => {
    try {
        const course = await courseModel.findOne({ slug: req.params.slug, Instructor: req.id });
        if (!course) return res.status(404).json({ message: "Course not found" });
        if (course.Instructor.toString() !== req.id) return res.status(403).json({ message: "Not authorized" });
        await course.deleteOne();
        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── GET COURSE LEARN PAGE ────────────────────────────────────────────────────
const getCourseLearnPage = async (req, res) => {
    try {
        const course = await courseModel.findOne({ slug: req.params.slug });
        if (!course) return res.status(404).send("Course not found");

        const userId = req.id;
        let levelProgress = await levelProgressModel.findOne({ userId, courseId: course._id });

        if (!levelProgress || !levelProgress.placementCompleted) {
            return res.redirect(`/courses/course/${course.slug}`);
        }

        const lessonProgress = await progressModel.find({ userId, courseId: course._id, completed: true });
        const completedLessonIds = lessonProgress.map(p => p.lessonId.toString());

        const currentLessons = course.lessons.filter(l => l.level === levelProgress.currentLevel);
        const allLessonsCompleted = currentLessons.every(lesson =>
            completedLessonIds.includes(lesson._id.toString())
        );

        const currentQuiz = course.quizzes?.find(
            q => q.quizType === "level" && q.level === levelProgress.currentLevel
        );
        const levelData = levelProgress.levels[levelProgress.currentLevel];
        const showQuiz = allLessonsCompleted && levelData && !levelData.quizPassed && currentQuiz;

        return res.render("auth/courseLearn", {
            course,
            currentLevel: levelProgress.currentLevel,
            currentLessons,
            completedLessonIds,
            allLessonsCompleted,
            showQuiz,
            quiz: currentQuiz || null,
            levelProgress,
            placementScore: levelProgress.placementScore
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading course");
    }
};

function scoreQuestionLocal(question, rawAnswer) {
    const type = question.questionType || "multiple-choice";
    switch (type) {
        case "multiple-choice":
        case "true-false":
            return parseInt(rawAnswer) === question.correctAnswer ? 1 : 0;
        case "multi-select": {
            const submitted = (Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer]).map(Number).sort();
            const correct = [...(question.correctAnswers || [])].sort();
            if (submitted.length !== correct.length) return 0;
            return submitted.every((v, i) => v === correct[i]) ? 1 : 0;
        }
        case "written": {
            const expected = (question.correctAnswerText || "").trim().toLowerCase();
            const given = (rawAnswer || "").toString().trim().toLowerCase();
            return given === expected ? 1 : 0;
        }
        default:
            return 0;
    }
}

function getCorrectDisplay(question) {
    const type = question.questionType || "multiple-choice";
    if (type === "written") return question.correctAnswerText || "";
    if (type === "multi-select") return (question.correctAnswers || []).join(", ");
    const idx = question.correctAnswer ?? 0;
    return question.options?.[idx] ?? String(idx);
}

// ─── SUBMIT PLACEMENT QUIZ ────────────────────────────────────────────────────
// Returns JSON with { success, score, level, message } — displayed inline on course.ejs
const submitPlacementQuiz = async (req, res) => {
    try {
        const { courseId, quizId, answers } = req.body;
        const userId = req.id;

        const course = await courseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Find the placement quiz
        let placementQuiz = quizId ? course.quizzes.id(quizId) : null;
        if (!placementQuiz) placementQuiz = course.quizzes.find(q => q.quizType === "placement");
        if (!placementQuiz) return res.status(404).json({ message: "Placement quiz not found" });

        // Score all questions
        let score = 0;
        placementQuiz.questions.forEach((q, i) => {
            score += scoreQuestionLocal(q, answers?.[i]);
        });

        const percentage = Math.round((score / placementQuiz.questions.length) * 100);

        // ── Save wrong answers as QuizMistakes ────────────────────────────────
        const mistakeDocs = [];
        placementQuiz.questions.forEach((q, i) => {
            const correct = scoreQuestionLocal(q, answers?.[i]);
            if (!correct) {
                mistakeDocs.push({
                    userId,
                    courseId,
                    quizId:        placementQuiz._id,
                    quizType:      "placement",
                    level:         null,
                    questionIndex: i,
                    questionText:  q.question || `Question ${i + 1}`,
                    studentAnswer: answers?.[i],
                    correctAnswer: getCorrectDisplay(q),
                    topic:         extractTopic(q.question || "")
                });
            }
        });

        if (mistakeDocs.length > 0) {
            await QuizMistake.deleteMany({ userId, courseId, quizId: placementQuiz._id });
            await QuizMistake.insertMany(mistakeDocs);
        }
        // ─────────────────────────────────────────────────────────────────────

        // Determine level
        const determineLevel = (p) => {
            if (p >= 70) return "advanced";
            if (p >= 40) return "intermediate";
            return "beginner";
        };
        const level = determineLevel(percentage);

        // Find or create LevelProgress
        let levelProgress = await levelProgressModel.findOne({ userId, courseId });
        if (!levelProgress) {
            levelProgress = new levelProgressModel({
                userId,
                courseId,
                currentLevel: level,
                placementCompleted: true,
                placementScore: percentage,
                levels: {
                    beginner:     { quizPassed: false, quizAttempts: 0, lastScore: 0 },
                    intermediate: { quizPassed: false, quizAttempts: 0, lastScore: 0 },
                    advanced:     { quizPassed: false, quizAttempts: 0, lastScore: 0 }
                }
            });
        } else {
            levelProgress.currentLevel = level;
            levelProgress.placementCompleted = true;
            levelProgress.placementScore = percentage;
            if (!levelProgress.levels) levelProgress.levels = {};
            if (!levelProgress.levels[level]) {
                levelProgress.levels[level] = { quizPassed: false, quizAttempts: 0, lastScore: 0 };
            }
        }

        await levelProgress.save();

        const levelDescriptions = {
            beginner:     "You're just starting out. We'll build your foundation step by step.",
            intermediate: "Great foundation! You're ready for more challenging concepts.",
            advanced:     "Excellent knowledge! Jump straight into advanced topics."
        };

        return res.json({
            success: true,
            score: percentage,
            level,
            levelDescription: levelDescriptions[level],
            redirectUrl: `/courses/course/${course.slug}/learn`
        });

    } catch (error) {
        console.error("submitPlacementQuiz error:", error);
        return res.status(500).json({ message: error.message });
    }
};

// ─── ADD / SAVE QUIZ (teacher creates quizzes from courseLessons.ejs) ─────────
const saveQuiz = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, quizType, level, passingScore, questions } = req.body;

        const course = await courseModel.findOne({ slug, Instructor: req.id });
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Parse questions (supports all 4 types)
        const parsedQuestions = parseQuestions(Array.isArray(questions) ? questions : []);

        const newQuiz = {
            title: title || "Quiz",
            quizType: quizType || "level",
            passingScore: parseInt(passingScore) || 70,
            questions: parsedQuestions
        };

        if (quizType === "level") {
            newQuiz.level = level || "beginner";
        }

        course.quizzes.push(newQuiz);
        await course.save();

        return res.json({ success: true, message: "Quiz saved successfully!" });

    } catch (err) {
        console.error("saveQuiz error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─── DELETE QUIZ ──────────────────────────────────────────────────────────────
const deleteQuiz = async (req, res) => {
    try {
        const { slug, quizId } = req.params;
        const course = await courseModel.findOne({ slug, Instructor: req.id });
        if (!course) return res.status(404).json({ message: "Course not found" });

        course.quizzes = course.quizzes.filter(q => q._id.toString() !== quizId);
        await course.save();

        return res.json({ success: true, message: "Quiz deleted" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getLevelQuiz = async (req, res) => {
    try {
        const { courseId, level } = req.query;
        const userId = req.id;

        const course = await courseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const normalizedLevel = level?.toLowerCase();

        const quiz = course.quizzes?.find(q =>
            q.quizType === "level" &&
            q.level?.toLowerCase() === normalizedLevel
        ) || null;

        const levelProgress = await levelProgressModel.findOne({ userId, courseId });

        const quizPassed = levelProgress?.levels?.[normalizedLevel]?.quizPassed || false;

        return res.json({
            success: true,
            quiz,
            quizPassed
        });

    } catch (err) {
        console.error("getLevelQuiz error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// ─── GET LESSONS FOR A LEVEL (called by frontend to load next level) ──────────
// GET /courses/api/level-lessons?courseId=&level=
const getLevelLessons = async (req, res) => {
    try {
        const { courseId, level } = req.query;
        const userId = req.id;

        const course = await courseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        // Filter lessons for this level
        const lessons = course.lessons.filter(l => l.level === level);

        // Find which ones the student already completed
        const progressRecords = await progressModel.find({
            userId,
            courseId,
            lessonId: { $in: lessons.map(l => l._id) },
            completed: true
        });
        const completedIds = progressRecords.map(p => p.lessonId.toString());

        return res.json({
            success: true,
            lessons,
            completedIds
        });

    } catch (err) {
        console.error("getLevelLessons error:", err);
        return res.status(500).json({ message: err.message });
    }
};
// ========== Rating Course ==========
const rateCourse = async (req, res) => {
    try {
        const { courseId, rating } = req.body;
        const userId = req.id;
        const numericRating = Number(rating);

        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const existingIndex = course.rating.findIndex(r => String(r.userId) === String(userId));

        if (existingIndex !== -1) {
            course.rating[existingIndex].value = numericRating;
            course.rating[existingIndex].createdAt = new Date();
        } else {
            course.rating.push({
                userId,
                value: numericRating,
                createdAt: new Date()
            });
        }

        await course.save();

        return res.json({
            success: true,
            averageRating: course.averageRating,
            userRating: numericRating,
            ratingsCount: course.rating.length
        });

    } catch (error) {
        console.error("rateCourse error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ========== Get User Rating ==========
const getUserRating = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.id;

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const rating = course.rating.find(r => String(r.userId) === String(userId));

        return res.json({
            success: true,
            userRating: rating ? rating.value : 0,
            averageRating: course.averageRating || 0,
            ratingsCount: course.rating.length
        });

    } catch (error) {
        console.error("getUserRating error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
export {
    createCourse, getAllCourses, editCourse, deleteCourse,
    getCourseBySlug, getCourseLessonsPage, getCourseBySlugForStudent,
    getEditCoursePage, getLessonsByLevel, getCourseLearnPage,
    completeLesson, submitPlacementQuiz, saveQuiz, deleteQuiz, getLevelQuiz, getLevelLessons, rateCourse, getUserRating 
};

