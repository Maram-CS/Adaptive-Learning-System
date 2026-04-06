import userModel from "../Model/userModel.js";


// This controller is responsible for handling the logic related to the teacher dashboard, such as rendering the dashboard page and fetching the teacher's profile information to display on the dashboard.

const getTeacherDashboard = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.id });
        res.render("auth/teacherDashboard", { user });
    } catch (error) {
        console.error("Error fetching teacher dashboard data:", error);
        res.status(500).send("Internal Server Error");
    }
};

export { getTeacherDashboard };