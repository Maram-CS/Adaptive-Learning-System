import userModel from "../Model/userModel.js";
import progressModel from "../Model/Progress.js";
import courseModel from "../Model/courseModel.js";

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

        const allProgress = await progressModel.find({ userId });

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

       // const course = await courseModel.findById(progress.courseId);

        const courses = [];
            for (let [courseId, data] of coursesMap.entries()) {

        const course = await courseModel.findById(courseId);

        const lessons = data.lessons.map(lesson => ({
        title: `Lesson ${lesson.lessonId}`,
        progress: lesson.progress,
        completed: lesson.completed,
        icon: lesson.completed 
        ? "fas fa-check-circle" 
        : (lesson.progress > 0 
        ? "fas fa-play-circle" 
        : "fas fa-lock")
        }));

        const courseOverallProgress =
        lessons.length > 0
        ? Math.round(
        lessons.reduce((sum, l) => sum + l.progress, 0) / lessons.length
        )
        : 0;

        courses.push({
        id: courseId,
        title: course?.Title || "Course",
        icon: "fas fa-book",
        overallProgress: courseOverallProgress,
        lastLesson: course?.lessons?.[0]?.name || "Lesson",
        lastLessonTime: 10,
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




