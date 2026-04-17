import Notification from "../Model/notificationModel.js";
import userModel from "../Model/userModel.js";

// 📘 إشعار course
export const notifyNewCourse = async (teacherId, course) => {
    try {
        const students = await userModel.find({ role: "student" });

        const notifications = students.map(student => ({
            studentId: student._id,
            teacherId: teacherId,
            type: "course",
            title: "New Course 📘",
            message: `New course "${course.Title}" is available`,
            relatedId: course._id
        }));

        await Notification.insertMany(notifications);
    } catch (err) {
        console.error("notifyNewCourse error:", err);
    }
};