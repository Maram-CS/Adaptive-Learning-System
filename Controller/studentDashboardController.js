import userModel from "../Model/userModel.js";
import progressModel from "../Model/Progress.js";
import courseModel from "../Model/courseModel.js";
import levelProgressModel from "../Model/progressLevelModel.js";
import {
    calculateCurrentStreak,
    calculateQuizAverage,
    calculateCourseProgressPercent,
    calculateTimeSpentMinutes,
    formatMinutesAsHoursAndMinutes,
    parseDurationToMinutes
} from "../utils/learningStats.js";

// جلب بيانات داشبورد الطالب
 const getStudentDashboardData = async (req, res) => {
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

        const allProgress = await progressModel.find({ userId }).sort({ lastUpdated: -1 });

        const completedLessons = allProgress.filter(p => p.completed === true).length;
        
        const coursesMap = new Map();
        allProgress.forEach(progress => {
            const courseKey = String(progress.courseId);
            if (!coursesMap.has(courseKey)) {
                coursesMap.set(courseKey, { lessons: [] });
            }
            coursesMap.get(courseKey).lessons.push(progress);
        });

        const courseIds = [...coursesMap.keys()];
        const courseDocs = await courseModel.find({ _id: { $in: courseIds } });
        const courseById = new Map(courseDocs.map(course => [String(course._id), course]));
        const levelProgressDocs = await levelProgressModel.find({ userId });

        const courses = [];
        for (let [courseId, data] of coursesMap.entries()) {
            const course = courseById.get(courseId);
            const latestProgress = data.lessons[0];

            const lessons = data.lessons.map(lesson => {
                const lessonDoc = course?.lessons?.find(item => String(item._id) === String(lesson.lessonId));
                return {
                    title: lessonDoc?.name || "Lesson",
                    progress: lesson.progress,
                    completed: lesson.completed,
                    icon: lesson.completed
                        ? "fas fa-check-circle"
                        : (lesson.progress > 0 ? "fas fa-play-circle" : "fas fa-lock")
                };
            });

            const latestLessonDoc = course?.lessons?.find(
                item => String(item._id) === String(latestProgress?.lessonId)
            );

            courses.push({
                id: courseId,
                title: course?.Title || "Course",
                icon: "fas fa-book",
                overallProgress: calculateCourseProgressPercent(course, data.lessons),
                lastLesson: latestLessonDoc?.name || course?.lessons?.[0]?.name || "Lesson",
                lastLessonTime: parseDurationToMinutes(latestLessonDoc?.duration || ""),
                lessons
            });
        }

        const totalLearningMinutesValue = courseDocs.reduce((sum, course) => {
            const courseProgress = allProgress.filter(progress => String(progress.courseId) === String(course._id));
            return sum + calculateTimeSpentMinutes(course, courseProgress);
        }, 0);
        const totalLearningTime = formatMinutesAsHoursAndMinutes(totalLearningMinutesValue);
        const totalLessonsCount = courseDocs.reduce((sum, course) => sum + (course.lessons?.length || 0), 0);
        const avgProgress = courseDocs.length > 0
            ? Math.round(
                courseDocs.reduce((sum, course) => {
                    const courseProgress = allProgress.filter(progress => String(progress.courseId) === String(course._id));
                    return sum + calculateCourseProgressPercent(course, courseProgress);
                }, 0) / courseDocs.length
            )
            : 0;

        const userData = {
            firstName: user.userName,
            streakDays: calculateCurrentStreak(allProgress),
            totalLearningHours: totalLearningTime.hours,
            totalLearningMinutes: totalLearningTime.minutes,
            quizAverage: calculateQuizAverage(levelProgressDocs)
        };

        res.json({
            success: true,
            userData,
            courses,
            completedLessons,
            totalLessons: totalLessonsCount,
            avgProgress
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const getLeaderboardData = async (req, res) => {
     try {
            const users = await userModel.find({}, 'userName');
            
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const leaderboardData = await progressModel.aggregate([
                { $match: { lastUpdated: { $gte: oneWeekAgo } } },
                { $group: { _id: "$userId", totalPoints: { $sum: "$pointsEarned" } } },
                { $sort: { totalPoints: -1 } },
                { $limit: 5 }
            ]);
            
            const leaderboard = leaderboardData.map((item, index) => {
                const user = users.find(u => u._id.toString() === item._id.toString());
                return {
                    name: user ? user.userName : "Unknown",
                    points: item.totalPoints,
                    badge: index === 0 ? "🔥" : (index === 1 ? "⭐" : (index === 2 ? "📈" : "")),
                    isCurrentUser: false
                };
            });
            
            res.json({ success: true, leaderboard });
            
        } catch (error) {
            console.error("Leaderboard API Error:", error);
            res.status(500).json({ success: false, message: "Server Error" });
        }
    }

 const getStudentDashboard = async (req, res) => {
     try {
            // استخدام المستخدم الحالي من التوكن (authMiddleware يضيف req.id)
            const user = await userModel.findById(req.id);
            if (user) {
                console.log('Found user:', user.userName, 'ID:', user._id);
                res.render("auth/studentDashboard", { userId: user._id.toString() });
            } else {
                console.log('No student found in database');
                res.render("auth/studentDashboard", { userId: null });
            }
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            res.render("auth/studentDashboard", { userId: null });
        }
    }


const studentCourseLessons = async (req, res) => {
    try {
        const course = await courseModel.findById(req.params.courseId);
        if (!course) return res.send("Course not found");

        const user = await userModel.findById(req.id);
        const userLevel = user?.level || "beginner";

        const lessons = course.lessons.filter(
            l => l.level === userLevel
        );

        res.render("auth/studentCourseLessons", {
            course,
            lessons,
            userLevel
        });

    } catch (error) {
        res.status(500).send(error.message);
    }
};
  
export  {getStudentDashboardData, getLeaderboardData, getStudentDashboard, studentCourseLessons};




