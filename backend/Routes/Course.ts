import express, { Router, Request, Response } from 'express';
import {auth , authlite}  from '../Midware/Mware';
import { User,Tracking,Rating,Course , Certificate } from '../DB/MDB';




const router: Router = express.Router();



router.get ('/allcourses', authlite,  async (req: Request, res: Response) => {
    

    const courses = await Course.find({})
        .select('img name description price rating tag instructor timestamp institution').populate({path : 'instructor', select: 'username img' } ).populate({path : 'rating', select: 'rating' })
        .lean()
        .exec();
        
    // Calculate average rating for each course
    const rating = courses.map(course => {
      if (course.rating && course.rating.length > 0) {
        const totalRating = course.rating.reduce((sum: number, r: any) => sum + r.rating, 0);
        return (totalRating / course.rating.length).toFixed(1);
      }
      return 0;
    });
    
    const coursess = courses.map(course => ({
        ...course,
        rating: rating[courses.indexOf(course)] || 0, // Assign average rating or 0 if no ratings
        }
    ));

    if (!courses) {
        return res.status(404).json({ error: "No courses found" });
    }
    res.status(200).json(coursess);
})

router.get('/cert/:id', auth, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    const user = req.user;
    const cert = await Certificate.findOne({ 'user.id': user._id, 'courseId.id': courseId }).lean();
    if (!cert) {
        return res.status(404).json({ error: "Certificate not found" });
    }
    if(!cert.institution){cert.institution = 'VaurLis Educations'};
    res.status(200).json(cert);
})


router.get('/instructorlist', async (req: Request, res: Response) => {

  const instructors =await User.find({rel_courses: { $exists: true, $not: { $size: 0 } } })

  .select('_id username bio img verified').lean().exec();

  if (!instructors || instructors.length === 0) {
      return res.status(404).json({ message: "No instructors found" });
  }

  res.status(200).json({
    message: "Instructors fetched successfully",
    instructors: instructors
  });

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
        _id: string;
        username: string;
        img: string;
        skills: string[];
    };
    
    act_users: number;
    timestamp:number ,
    Role: 'pur'|'!pur'|'owns';
}

router.get('/:id', authlite,async (req: Request, res: Response) => {
    
    
    const courseId = req.params.id;
    try {
        //console.log(courseId);
        
        const course = await Course.findById(courseId).select('name img description price duration instructor content act_users').lean().exec();
      

        if(course) {

            let Role: 'pur'|'!pur'|'owns' = '!pur';
            if (req.user.username!="guest"){
            if((req.user?._id).toString()===(course.instructor)?.toString()){Role = 'owns';}
            else  if(req.user.pur_courses.includes(course._id)){Role = 'pur';}
           
            else {Role = '!pur';}

            }
            const instboj = await User.findById(course.instructor).select('username img skills').lean().exec();
                  
           

            const resCourse:resCourse = {
                name: course.name || '',
                img: course.img || '',
                description: course.description || '',
                price: course.price || 0,
                duration: course.duration || '',
                instructor: {
                    _id: instboj?._id.toString() || '',
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
    const instructor  = await User.findById(course.instructor).select('username').exec();
    const newCert = new Certificate({
      user: { id: user._id, name: user.username },
      courseId: { id: course._id, name: course.name, instructor: instructor?.username, duration: course.duration },
    });
    await newCert.save();
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
      //    console.log (newReview)
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
//console.log(course.rating)


res.status(200).json({
  message: "Review fetched successfully",
  reviews: course.rating
});


})


router.get('/getcontent/:id', auth, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const user = req.user;
    
    // 1️⃣ Fetch course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2️⃣ Check if user has access (purchased or owns the course)
    const isPurchased = user.pur_courses.some((id: any) => id.toString() === courseId);
    const isOwner = course.instructor?.toString() === user._id.toString();
    
    if (!isPurchased && !isOwner) {
      return res.status(403).json({ message: "You need to purchase this course to access the content" });
    }

    // 3️⃣ Fetch tracking data for this user and course
    const tracking = await Tracking.find({ 
      userId: user._id, 
      courseId: courseId 
    });

    // 4️⃣ Map content with tracking data
    const content = course.content.map((video: any) => {
      const track = tracking.find(t => t.videoId.toString() === video._id.toString());

      return {
        videoId: video._id.toString(),           // Content item ID (needed for tracking)
        trackingId: track?._id.toString() || '', // Tracking record ID (empty if not watched)
        name: video.name,
        link: video.link,
        thumbnail: video.thumbnail || '',
        duration: video.duration || 0,
        finished: track?.finished || false,
        lastViewedTime: track?.lastViewedTime || null,
        watchedInt: track?.watchedInt || 0,
      };
    });

    // 5️⃣ Send response
    res.status(200).json({
      message: "Content fetched successfully",
      content: content,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
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