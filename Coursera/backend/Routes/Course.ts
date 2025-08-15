import express, { Router, Request, Response } from 'express';
import { Course } from '../DB/MDB';
import auth  from '../Midware/Mware';
import { ObjectId } from 'mongodb';
import { Rating } from '../DB/MDB'; 
import { User } from '../DB/MDB';



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

interface resCourse{
    name: string;
    img: string;
    description: string;
    price: number;
    duration: string;
    instructor: {
        username: string;
        img: string;
        skills: string[];
    };
    content: string[];
    act_users: number;
    Role: 'pur'|'!pur'|'owns';
}

router.get('/:id', auth , async (req: Request, res: Response) => {

    const courseId = req.params.id;
    try {
        
        const course = await Course.findById(courseId).select('name img description price duration instructor content act_users').lean().exec();
        if(course) {
           
            let Role: 'pur'|'!pur'|'owns' = '!pur';
            if(req.user.pur_courses.includes(course._id)){Role = 'pur';}
            else if((req.user?._id).toString()===(course.instructor)?.toString()){Role = 'owns';}
            else {Role = '!pur';}
            const instboj = await User.findById(course.instructor).select('username img skills').lean().exec();
                  
            
            const resCourse:resCourse = {
                name: course.name || '',
                img: course.img || '',
                description: course.description || '',
                price: course.price || 0,
                duration: course.duration || '',
                instructor: {
                    username: instboj?.username || '',
                    img: instboj?.img || '',
                    skills: instboj?.skills || [],
                },
                content: course.content,
                act_users: course.act_users.length,

                Role,

            }


        res.status(200).json(resCourse);}

        
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
    const same = await Course.findOne({name});
    if (same) {
        return res.status(400).json({ error: "Course already exists" });
    }

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

    router.get('/purchase/:id', auth, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });}
    const user = req.user;
    const isPurchased = user.pur_courses.includes(course._id);
    if (isPurchased) {
        return res.status(400).json({ message: "Course already purchased" });
    }
    user.pur_courses.push(course._id);
    await user.save();
    course.act_users.push(user._id);
    await course.save();
    res.status(200).json({ message: "Course purchased successfully", course });
    })

    router.post('/postreview/:id', auth, async (req: Request, res: Response) => {
        const courseId = req.params.id;
        const user = req.user;
        
        const { review, rating } = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        const newReview = {
            review : review,
            rating : rating,
            course: course._id,
            user: user._id,
        };
         const newRating = new Rating(newReview);
          await newRating.save();
          console.log (newReview)
        course.rating.push(newRating._id);    
         user.rated.push(newRating._id);
        await user.save();

        await course.save();
        res.status(200).json({ message: "Review posted successfully", course });
    })

     router.get('/getreview/:id', async (req: Request, res: Response) => {
const courseId = req.params.id;

const course = await Course.findById(courseId)
  .populate({
    path: 'rating',               // populate Review documents
    select: 'rating review helpful user', // pick only these fields
    populate: {
      path: 'user',                // populate the user in each review
      select: 'username img -_id'  // only username and img, no _id
    }
  }).lean().exec();

if (!course) {
  return res.status(404).json({ message: "Course not found" });
}

res.status(200).json({
  message: "Review fetched successfully",
  reviews: course.rating
});

        // const reviewid = req.params.id;
        // const rawreview = await Rating.findById(reviewid);
        // if (!rawreview) {
        //     return res.status(404).json({ message: "Review not found" });
        // }
        // const user = await User.findById(rawreview.user);
        // if (!user) {
        //     const review ={
        //         userimg:null,
        //         user: null,
        //         review : rawreview.review,
        //         rating : rawreview.rating,
        //         helpful : rawreview.helpful,
        //     }
        // }else{
        // const review ={
        // userimg : user.img,
        // user : user.username,
        //  review : rawreview.review,
        // rating : rawreview.rating,
        // helpful : rawreview.helpful,}
       }
    )



    export default router;