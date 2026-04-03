import slugify from "slugify";
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
        console.error(err)
        return res.status(500).json({message: "Internal server error"});
    }
}

const getAllCourses = async (req,res) => {
    try {
        const AllCourses = await courseModel.find({isPublished : true});
        if(AllCourses) {
            return res.status(200).json({courses: AllCourses});
        }else {
            return res.status(404).json({message: "No courses found"});
        }
    } catch (err) {
        return res.status(500).json({message: "Internal server error"});
    }
}

const editCourse = async (req, res) => {
    try {
        const { Title, Description, category, image, totalDuration, level, price } = req.body;

        // نجيب course بالـ slug و Instructor = req.user.id
        const course = await courseModel.findOne({ slug: req.params.slug, Instructor: req.user.id });
        if (!course) {
            return res.status(404).json({ message: "Course not found or not authorized" });
        }

        if (Title) {
            course.Title = Title;
            course.slug = slugify(Title, { lower: true, strict: true }); // تحديث slug لو Title تغير
        }
        course.Description = Description || course.Description;
        course.category = category || course.category;
        course.image = image || course.image;
        course.totalDuration = totalDuration || course.totalDuration;
        course.level = level || course.level;
        course.price = price || course.price;

        const updatedCourse = await course.save();

        return res.status(200).json({
            message: "Course updated successfully",
            course: updatedCourse
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const getCourseBySlug = async(req,res) => {
    try {
        const course = await courseModel.findOne({slug: req.params.slug}).populate('Instructor','userName email');
        if(!course) {
            return res.status(404).json({message: "course not found"});
        }

        res.render("auth/coursesDetail",{course});
    }catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal server error"});
    }
}

const deleteCourse = async (req,res) => {
    try {
        
        const course = await courseModel.findOne({ slug: req.params.slug, Instructor: req.user.id }).populate('Instructor');
        if(!course) {
            return res.status(404).json({message: "Course not found"});
        }

        
        if(course.Instructor._id.toString() !== req.user.id){
            return res.status(403).json({ message: "Not authorized to delete this course" });
        }

        await course.deleteOne();
        return res.status(200).json({message: "Course deleted successfully"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal server error"});
    }
}

export {createCourse, getAllCourses, editCourse, deleteCourse,getCourseBySlug};
