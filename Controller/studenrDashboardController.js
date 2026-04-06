import userModel from "../Model/userModel.js";
import ProgressModel from "../Model/Progress.js";

// جلب بيانات داشبورد الطالب
export const getStudentDashboardData = async (req, res) => {
    try {
        // نحاول استخدام الـ userId من البارامز إن وُجد، وإلا نستخدم req.id من الـ authMiddleware
        const userId = req.params.userId || req.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const allProgress = await ProgressModel.find({ userId });

        const completedLessons = allProgress.filter(p => p.completed === true).length;
        
        let totalProgress = 0;
        if (allProgress.length > 0) {
            totalProgress = allProgress.reduce((sum, p) => sum + p.progress, 0);
        }
        const avgProgress = allProgress.length > 0 ? Math.round(totalProgress / allProgress.length) : 0;

        const coursesMap = new Map();
        allProgress.forEach(progress => {
            if (!coursesMap.has(progress.courseId)) {
                coursesMap.set(progress.courseId, { lessons: [] });
            }
            coursesMap.get(progress.courseId).lessons.push(progress);
        });

        const courseDetails = {
            1: { title: "Full-Stack Development", icon: "fab fa-react", lastLesson: "React Hooks", lastLessonTime: 15 },
            2: { title: "Python for Data Science", icon: "fab fa-python", lastLesson: "Pandas", lastLessonTime: 10 },
            3: { title: "Mobile App Development (Flutter)", icon: "fab fa-android", lastLesson: "Flutter Basics", lastLessonTime: 25 }
        };

        const courses = [];
        for (let [courseId, data] of coursesMap.entries()) {
            const lessons = data.lessons.map(lesson => ({
                title: `Lesson ${lesson.lessonId}`,
                progress: lesson.progress,
                completed: lesson.completed,
                icon: lesson.completed ? "fas fa-check-circle" : (lesson.progress > 0 ? "fas fa-play-circle" : "fas fa-lock")
            }));
            
            const courseOverallProgress = lessons.length > 0 ? Math.round(lessons.reduce((sum, l) => sum + l.progress, 0) / lessons.length) : 0;
            
            courses.push({
                id: courseId,
                title: courseDetails[courseId]?.title || `Course ${courseId}`,
                icon: courseDetails[courseId]?.icon || "fas fa-book",
                overallProgress: courseOverallProgress,
                lastLesson: courseDetails[courseId]?.lastLesson || "Lesson",
                lastLessonTime: courseDetails[courseId]?.lastLessonTime || 10,
                lessons: lessons
            });
        }

        const userData = {
            firstName: user.userName,
            streakDays: 5,
            totalLearningHours: Math.floor(allProgress.reduce((sum, p) => sum + (p.progress / 100), 0)),
            totalLearningMinutes: 20,
            quizAverage: 85
        };

        res.json({
            success: true,
            userData,
            courses,
            completedLessons,
            totalLessons: allProgress.length,
            avgProgress
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}




