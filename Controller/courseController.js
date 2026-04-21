import courseModel from "../Model/courseModel.js";
import { notifyNewCourse } from "./notificationController.js";
import levelProgressModel from "../Model/progressLevelModel.js";
import progressModel from "../Model/Progress.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper: parse lessons for CREATE (new course)
function parseLessons(bodyLessons = {}, lessonFiles = []) {
    const lessonsArray = Object.values(bodyLessons);
    return lessonsArray.map((lesson, index) => ({
        name: lesson.name || "",
        type: lesson.type || "video",
        duration: lesson.duration || "",
        file: lessonFiles[index] && lessonFiles[index].filename ? `/uploads/${lessonFiles[index].filename}` : ""
    }));
}

// CREATE COURSE
// CREATE COURSE - Version simplifiée
const createCourse = async (req, res) => {
    try {
        const instructorId = req.id;

        if (!instructorId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        console.log("Request files:", req.files);

        // Duplicate check
        const existingCourse = await courseModel.findOne({
            Title: req.body.Title,
            Instructor: instructorId
        });
        if (existingCourse) {
            return res.status(400).json({ message: "Course already exists" });
        }

        // Image
        const imagePath = req.files?.image?.[0]
            ? `/uploads/${req.files.image[0].filename}`
            : null;

        if (!imagePath) {
            return res.status(400).json({ message: "Course thumbnail is required" });
        }

        // Récupérer les fichiers uploadés pour les lessons
        const uploadedFiles = req.files?.lessonFiles || [];
        
        // Récupérer les lessons du formulaire
        const lessonsFromForm = Object.values(req.body.lessons || {});
        
        // Construire les lessons avec les fichiers (par ordre d'index)
        const lessons = lessonsFromForm.map((lesson, index) => ({
            name: lesson.name || "",
            type: lesson.type || "video",
            duration: lesson.duration || "",
            level: lesson.level,
            file: uploadedFiles[index] ? `/uploads/${uploadedFiles[index].filename}` : ""
        }));

        console.log("Lessons created:", lessons);

        // Resources
        let resources = [];
        if (req.body.resources) {
            try {
                resources = JSON.parse(req.body.resources);
            } catch {
                resources = [];
            }
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
        
        console.log("Course saved with ID:", savedCourse._id);
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({ success: true, course: savedCourse });
        }
        return res.redirect("/teacherDashboard/get");

    } catch (err) {
        console.error("createCourse error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ message: "A course with this title already exists" });
        }
        return res.status(500).json({ message: "Internal server error: " + err.message });
    }
};

// GET ALL COURSES
const getAllCourses = async (req, res) => {
    try {
        const allCourses = await courseModel.find({ isPublished: true });
        return res.render("auth/courses", { courses: allCourses });
    } catch (err) {
        console.error("getAllCourses error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// GET BY SLUG
const getCourseBySlug = async (req, res) => {
    try {
        const course = await courseModel
            .findOne({ slug: req.params.slug })
            .populate("Instructor", "userName email");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (req.role === "student") {
            return res.render("auth/courseDetailStudent", { course });
        }
        return res.render("auth/editCourse", { course });

    } catch (err) {
        console.error("getCourseBySlug error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getCourseBySlugForStudent = async (req, res) => {
    try {
        const course = await courseModel.findOne({ slug: req.params.slug })
            .populate("Instructor", "userName email");

        if (!course) {
            return res.status(404).send("Course not found");
        }

        const userId = req.id;
        
        // Vérifier si l'étudiant a déjà passé le placement quiz
        let levelProgress = await levelProgressModel.findOne({ userId, courseId: course._id });
        
        // Si l'étudiant a déjà un niveau (placement quiz déjà fait)
        if (levelProgress && levelProgress.placementCompleted) {
            // Rediriger vers la page d'apprentissage avec son niveau
            return res.redirect(`/course/${course.slug}/learn`);
        }
        
        // Sinon, afficher la page course.ejs avec le placement quiz
        return res.render("auth/course", {  // ← CHANGER ICI : course au lieu de courseDetailStudent
            course,
            showPlacementQuiz: true,
            placementQuiz: course.placementQuiz
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send("Error loading course");
    }
};
// GET COURSE LESSONS PAGE
const getCourseLessonsPage = async (req, res) => {
    try {
        const course = await courseModel.findOne({
            slug: req.params.slug,
            Instructor: req.id
        });

        if (!course) {
            return res.status(404).send("Course not found");
        }

        // Grouper les quizzes par niveau
        const quizzesByLevel = {
            beginner: course.quizzes?.filter(q => q.level === "beginner") || [],
            intermediate: course.quizzes?.filter(q => q.level === "intermediate") || [],
            advanced: course.quizzes?.filter(q => q.level === "advanced") || []
        };

        return res.render("auth/courseLessons", { 
            course: course,
            lessons: course.lessons || [],
            quizzesByLevel
        });

    } catch (err) {
        console.error("getCourseLessonsPage error:", err);
        return res.status(500).send("Server error");
    }
};

// Dans courseController.js
const completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        const userId = req.id;
        
        // Mettre à jour ou créer le progress
        let progress = await progressModel.findOne({
            userId,
            courseId,
            lessonId
        });
        
        if (!progress) {
            progress = new progressModel({
                userId,
                courseId,
                lessonId,
                completed: true,
                progress: 100,
                pointsEarned: 10, // 10 points par leçon
                lastUpdated: new Date()
            });
        } else {
            progress.completed = true;
            progress.progress = 100;
            progress.pointsEarned = 10;
            progress.lastUpdated = new Date();
        }
        
        await progress.save();
        
        // Vérifier si toutes les leçons du niveau actuel sont complétées
        const course = await courseModel.findById(courseId);
        const levelProgress = await levelProgressModel.findOne({ userId, courseId });
        
        const currentLevelLessons = course.lessons.filter(l => l.level === levelProgress.currentLevel);
        const completedLessons = await progressModel.find({
            userId,
            courseId,
            lessonId: { $in: currentLevelLessons.map(l => l._id) },
            completed: true
        });
        
        const allCompleted = completedLessons.length === currentLevelLessons.length;
        
        res.json({ 
            success: true, 
            allCompleted,
            message: allCompleted ? "🎉 All lessons completed! You can now take the quiz!" : "Lesson completed!"
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// EDIT COURSE

const editCourse = async (req, res) => {
    try {
        const course = await courseModel.findOne({
            slug: req.params.slug,
            Instructor: req.id
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        console.log("=== EDIT COURSE DEBUG ===");
        console.log("req.files:", req.files);
        console.log("req.body.lessons:", req.body.lessons);

        // Mettre à jour les champs de base
        const { Title, Description, category, totalDuration, level, price, slug, isPublished } = req.body;
        
        if (Title) course.Title = Title;
        if (Description) course.Description = Description;
        if (category) course.category = category;
        if (totalDuration) course.totalDuration = totalDuration;
        if (level) course.level = level;
        if (price !== undefined) course.price = parseFloat(price) || 0;
        if (slug) course.slug = slug;
        if (isPublished !== undefined) course.isPublished = isPublished === "on";

        // Mettre à jour l'image
        if (req.files?.image?.[0]) {
            course.image = `/uploads/${req.files.image[0].filename}`;
        }

        // Mettre à jour les lessons - CORRIGÉ
        if (req.body.lessons) {
            const uploadedFiles = req.files?.lessonFiles || [];
            const lessonsFromForm = Object.values(req.body.lessons);
            
            console.log("Uploaded files count:", uploadedFiles.length);
            console.log("Lessons from form count:", lessonsFromForm.length);
            
            const updatedLessons = [];
            
            // Compteur pour les fichiers uploadés
            let fileCounter = 0;
            
            for (let i = 0; i < lessonsFromForm.length; i++) {
                const lesson = lessonsFromForm[i];
                let filePath = "";
                
                // Vérifier si cette lesson a un fichier uploadé
                // Pour les nouvelles lessons (existingFile vide), on prend le prochain fichier
                if (!lesson.existingFile || lesson.existingFile === "") {
                    // C'est une nouvelle lesson
                    if (fileCounter < uploadedFiles.length) {
                        filePath = `/uploads/${uploadedFiles[fileCounter].filename}`;
                        console.log(`Lesson ${i} (new): assigned file ${filePath}`);
                        fileCounter++;
                    } else {
                        console.log(`Lesson ${i} (new): no file available`);
                    }
                } else {
                    // C'est une ancienne lesson, garder l'ancien fichier
                    filePath = lesson.existingFile;
                    console.log(`Lesson ${i} (existing): keeping file ${filePath}`);
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
            console.log("Final lessons:", JSON.stringify(updatedLessons, null, 2));
        }

        await course.save();
        console.log("Course saved successfully");
        
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.json({ success: true, course });
        }
        return res.redirect("/teacherDashboard/get");

    } catch (err) {
        console.error("editCourse error:", err);
        if (req.xhr || req.headers.accept?.includes('application/json')) {
            return res.status(500).json({ message: "Internal server error: " + err.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};
// get edit course page
const getEditCoursePage = async (req, res) => {
try {

const course = await courseModel.findOne({
slug: req.params.slug
})

if(!course){
return res.send("Course not found")
}

res.render("auth/editCourse",{course})

} catch(err){
console.log(err)
res.send("Error loading edit page")
}
}
// get course by level
const getLessonsByLevel = async (req, res) => {

try {

    const { courseId, level } = req.params;

    const course = await courseModel.findById(courseId);

    
    const userLevel = level;

    const lessons = course.lessons.filter(
    l => l.level === userLevel
    );

    console.log("User level:", userLevel);
    console.log("Filtered lessons:", lessons);

    res.render("auth/courseLessons", {
    course,
    lessons,
    level: userLevel
    });

} catch (error) {
res.send(error.message);
}

};
// DELETE COURSE
const deleteCourse = async (req, res) => {
    try {
        const course = await courseModel.findOne({
            slug: req.params.slug,
            Instructor: req.id
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.Instructor.toString() !== req.id) {
            return res.status(403).json({ message: "Not authorized to delete this course" });
        }

        await course.deleteOne();
        return res.status(200).json({ message: "Course deleted successfully" });

    } catch (err) {
        console.error("deleteCourse error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getCourseLearnPage = async (req, res) => {
    try {
        const course = await courseModel.findOne({ slug: req.params.slug });
        
        if (!course) {
            return res.status(404).send("Course not found");
        }
        
        const userId = req.id;
        
        // Récupérer LevelProgress
        let levelProgress = await levelProgressModel.findOne({ userId, courseId: course._id });
        
        // Vérifier si l'étudiant a passé le placement quiz
        if (!levelProgress || !levelProgress.placementCompleted) {
            return res.redirect(`/course/${course.slug}`);
        }
        
        // Récupérer les progrès des leçons
        const lessonProgress = await progressModel.find({ 
            userId, 
            courseId: course._id,
            completed: true
        });
        
        const completedLessonIds = lessonProgress.map(p => p.lessonId.toString());
        
        // Filtrer les leçons du niveau déterminé par le placement quiz
        const currentLessons = course.lessons.filter(l => l.level === levelProgress.currentLevel);
        
        // Vérifier si toutes les leçons sont complétées
        const allLessonsCompleted = currentLessons.every(lesson => 
            completedLessonIds.includes(lesson._id.toString())
        );
        
        // Trouver le quiz du niveau actuel
        const currentQuiz = course.quizzes?.find(q => q.level === levelProgress.currentLevel);
        const levelData = levelProgress.levels[levelProgress.currentLevel];
        const showQuiz = allLessonsCompleted && !levelData.quizPassed && currentQuiz;
        
        return res.render("auth/courseLearn", {
            course,
            currentLevel: levelProgress.currentLevel,
            currentLessons,
            completedLessonIds,
            allLessonsCompleted,
            showQuiz,
            quiz: currentQuiz,
            levelProgress,
            placementScore: levelProgress.placementScore
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading course");
    }
};

const submitPlacementQuiz = async (req, res) => {
    try {
        const { courseId, answers } = req.body;
        const userId = req.id;

        const course = await courseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const placementQuiz = course.placementQuiz;
        if (!placementQuiz) return res.status(404).json({ message: "Placement quiz not found" });

        // Calculer le score
        let score = 0;
        placementQuiz.questions.forEach((q, i) => {
            if (parseInt(answers[i]) === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / placementQuiz.questions.length) * 100;
        
        // Déterminer le niveau basé sur le score
        let determinedLevel = "beginner";
        if (percentage >= 70) {
            determinedLevel = "advanced";
        } else if (percentage >= 40) {
            determinedLevel = "intermediate";
        } else {
            determinedLevel = "beginner";
        }

        // Créer ou mettre à jour LevelProgress
        let levelProgress = await levelProgressModel.findOne({ userId, courseId });
        
        if (!levelProgress) {
            levelProgress = await levelProgressModel.create({
                userId,
                courseId,
                currentLevel: determinedLevel,
                placementCompleted: true,
                placementScore: percentage,
                levels: {
                    beginner: { quizPassed: false, quizAttempts: 0, lastScore: 0 },
                    intermediate: { quizPassed: false, quizAttempts: 0, lastScore: 0 },
                    advanced: { quizPassed: false, quizAttempts: 0, lastScore: 0 }
                }
            });
        } else {
            levelProgress.currentLevel = determinedLevel;
            levelProgress.placementCompleted = true;
            levelProgress.placementScore = percentage;
            await levelProgress.save();
        }

        // Retourner le résultat
        return res.json({
            success: true,
            score: percentage,
            level: determinedLevel,
            message: `Votre score: ${percentage}%. Niveau déterminé: ${determinedLevel.toUpperCase()}`,
            redirectUrl: `/course/${course.slug}/learn`
        });

    } catch (error) {
        console.error("submitPlacementQuiz error:", error);
        res.status(500).json({ message: error.message });
    }
};

export { createCourse, getAllCourses, editCourse, deleteCourse, getCourseBySlug, getCourseLessonsPage, getCourseBySlugForStudent ,getEditCoursePage , getLessonsByLevel, getCourseLearnPage, completeLesson, submitPlacementQuiz};