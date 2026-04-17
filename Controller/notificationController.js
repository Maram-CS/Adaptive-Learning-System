import userModel from "../Model/userModel.js";
import Notification from "../Model/notificationModel.js";

export const notifyNewCourse = async (teacherId, course) => {
    try {

        const teacher = await userModel.findById(teacherId);

        const students = await userModel.find({ role: "student" });

        const notifications = students.map(student => ({
            studentId: student._id,
            teacherId: teacherId,
            type: "course",
            title: "New Course 📘",
            message: `${teacher.userName} added a new course: "${course.Title}"`,
            relatedId: course._id
        }));

        await Notification.insertMany(notifications);

    } catch (err) {
        console.log(err);
    }
};