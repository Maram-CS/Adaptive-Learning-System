import courseModel from "../Model/courseModel.js";

const getAllCourses = async (req, res) => {
    try {
        const course = await courseModel.find({});
        if(course) {
            return res.render("auth/favoriteCourses",{courses: course});
        }else {
            return res.status(404).json({message: "No courses found"});
        }
    }catch (err) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export {getAllCourses};