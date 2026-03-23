import courseModel from "../Model/courseModel.js";

const createCourse = async (req,res)=> {
    try {
        const course = new courseModel(req.body);
        const savedCourse = await course.save();
        if(savedCourse) {
            return res.status(201).json({message: "Course created successfully", course: savedCourse});
        }else {
            return res.status(400).json({message: "Failed to create course"});
        }


    } catch (err) {
        return res.status(500).json({message: "Internal server error"});
    }
}

const getAllCourses = async (req,res) => {
    try {
        const AllCourses = await courseModel.find({});
        if(AllCourses) {
            return res.status(200).json({courses: AllCourses});
        }else {
            return res.status(404).json({message: "No courses found"});
        }
    } catch (err) {
        return res.status(500).json({message: "Internal server error"});
    }
}

const editCourse = async (req,res) => {
    try {
        const {Title, Description, Instructor,category,image,rating} = req.body;
        const course = await courseModel.findById(req.params.id);
        if(!course) {
            return res.status(404).json({message: "Course not found"});
        }
        course.Title = Title || course.Title;
        course.Description = Description || course.Description;
        course.Instructor = Instructor || course.Instructor;//hna lazm nhaz mn middleware authRequest role ta3 user w id ta3ou w nverifyi wach houwa instructor wala laa w id ta3ou ymatchi m3a instructor id ta3 course puique ghir howa eli yagder ydir cearte edite delete course
        course.category = category || course.category;
        course.image = image || course.image;
        course.rating = rating || course.rating;
        const updatedCourse = await course.save();

        if(updatedCourse) {
            return res.status(200).json({message: "Course updated successfully", course: updatedCourse});
        }else {
            return res.status(400).json({message: "Failed to update course"});
        }
    } catch (err) {
        return res.status(500).json({message: "Internal server error"});
    }
}

const deleteCourse = async (req,res) => {
    try {
        const course = await courseModel.findById(req.params.id);
        if(!course) {
            return res.status(404).json({message: "Course not found"});
        }
        await course.remove();
        return res.status(200).json({message: "Course deleted successfully"});
    } catch (err) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export {createCourse, getAllCourses, editCourse, deleteCourse};
