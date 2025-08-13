import express, { Router, Request, Response } from 'express';
import { Course } from '../DB/MDB';
import auth  from '../Midware/Mware';

const router: Router = express.Router();


router.get ('/allcourses',  async (req: Request, res: Response) => {
    const courses = await Course.find({})
        .select('img name description  price instructor')
        .lean()
        .exec();
        
    
    const coursess = courses.map(course => ({
        ...course,
        reviewCount: course.rating ? course.rating.length : 0
    }));

    if (!courses) {
        return res.status(404).json({ error: "No courses found" });
    }
    res.status(200).json(coursess);
})
router.get('/purchased', auth, async (req: Request, res: Response)=>{
    const user = req.user;
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const purchasedCourses = await Course.find({ _id: { $in: user.pur_courses } });
    if (!purchasedCourses || purchasedCourses.length === 0) {
        return res.status(404).json({ error: "No purchased courses found" });
    }
    res.status(200).json(purchasedCourses);
}
)
router.get('/:id',  async (req: Request, res: Response) => {
    const courseId = req.params.id;
    try {
        const course = await Course.findById(courseId);
        res.status(200).json(course);
    }
    catch (error) {
        return res.status(404).json({ error: "Course not found" });
    }
    
   
   

})
router.post('/upload', auth, async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const { name,description,duration,img, content } = req.body;
    const newCourse = new Course({
        name,
        description,
        duration,
        img,
        content,
        instructor: user._id,
    });
    await newCourse.save();
    user.rel_courses.push(newCourse._id);
    await user.save();
    res.status(201).json({ message: "Course uploaded successfully", course: newCourse });
    })

    router.put('/update/:id', auth, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }
        const user = req.user;
   
        if (!course.instructor || course.instructor.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "You are not authorized to update this course" });
        }
        const { name, description, duration, img, content } = req.body;
        course.name = name || course.name;
        course.description = description || course.description;
        course.duration = duration || course.duration;
        course.img = img || course.img;
        course.content = content || course.content;
        await course.save();
        res.status(200).json({ message: "Course updated successfully", course });
        }
       
        catch (error) {
            return res.status(404).json({ error: "Course not found" });
        }
    
    })

    router.put('/purchase/:id', auth, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ error: "Course not found" });}
    const user = req.user;
    const isPurchased = user.pur_courses.includes(course._id);
    if (isPurchased) {
        return res.status(400).json({ error: "Course already purchased" });
    }
    user.pur_courses.push(course._id);
    await user.save();
    course.act_users.push(user._id);
    await course.save();
    res.status(200).json({ message: "Course purchased successfully", course });
    })

    export default router;