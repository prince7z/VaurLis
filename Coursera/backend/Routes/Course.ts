import express, { Router, Request, Response } from 'express';
import auth  from '../Midware/Mware';
import { User,Tracking,Rating,Course } from '../DB/MDB';




const router: Router = express.Router();



router.get ('/allcourses',  async (req: Request, res: Response) => {
    

    const courses = await Course.find({})
        .select('img name description  price instructor timestamp')
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
    const purchasedCourses = await Course.find({ _id: { $in: user.pur_courses } }).select('img name description  price instructor timestamp')
        .lean()
        .exec();

    if (!purchasedCourses || purchasedCourses.length === 0) {
        return res.status(404).json({ error: "No purchased courses found" });
    }
    res.status(200).json(purchasedCourses);
}
)

router.get('/released',auth, async (req: Request, res: Response) => {
 const user=req.user;
 const releasedCourses = await Course.find({ instructor: user._id }).select('img name description  price instructor timestamp')
        .lean()
        .exec();
        if (!releasedCourses || releasedCourses.length === 0) {
            return res.status(404).json({ message: "No released courses found" });
        }
        res.status(200).json(releasedCourses);
    })
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
    
    act_users: number;
    timestamp:number ,
    Role: 'pur'|'!pur'|'owns';
}

router.get('/:id', auth , async (req: Request, res: Response) => {
    
    
    const courseId = req.params.id;
    try {
        //console.log(courseId);
        
        const course = await Course.findById(courseId).select('name img description price duration instructor content act_users').lean().exec();
      

        if(course) {
           // console.log(course);

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
                
                act_users: course.act_users.length || 0,

                timestamp: course.timestamp?.getTime() || 0,

                Role,

            }


        res.status(200).json(resCourse);}
        else{
            return res.status(404).json({ error: "Course not found" });
        }


        
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
    select: 'rating review helpful user timestamp', // pick only these fields
    populate: {
      path: 'user',                // populate the user in each review
      select: 'username img -_id'  // only username and img, no _id
    }
  }).lean().exec();

if (!course) {
  return res.status(404).json({ message: "Course not found" });
}
console.log(course.rating)


res.status(200).json({
  message: "Review fetched successfully",
  reviews: course.rating
});


})


interface vid{
    id : string,
    courseId : string,
    userId : string,
    name : string,
    finished : boolean,
    lastViewedTime : Date,  
    link : string,
    thumbnail : string,
    duration : string,

}

router.get('/getcontent/:id', auth, async (req: Request, res: Response) => {
  const courseId = req.params.id;
  const user = req.user;
 console.log(courseId);
 

  // 1️⃣ Fetch the course
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // 2️⃣ Fetch tracking info for this user & course
  const tracking = await Tracking.find({ userId: user._id, courseId: courseId });

  // 3️⃣ Map content + tracking to vid interface
  const content: any = course.content.map(video => {
    // Find tracking for this video
    const track = tracking.find(t => t.videoId.toString() === video._id.toString());

    return {
      id: track?._id.toString() || '',     // Tracking record ID (empty if not watched)
      
      
      name: video.name,
      finished: track?.finished || false,
      lastViewedTime: track?.lastViewedTime || null,
      link: video.link,
      thumbnail: video.thumbnail,
      duration: video.duration,
      watchedInt: track?.watchedInt || 0,
    };
  });

  // 4️⃣ Send response
  res.status(200).json({
    message: "Content fetched successfully",
    content: content,
  });
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
    


    export default router;