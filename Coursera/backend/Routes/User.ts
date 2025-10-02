import express, { Request, Response, Router } from 'express';
import { User, Tracking, Rating, Certificate, LiveClass ,Course} from '../DB/MDB';

import { auth, authlite } from '../Midware/Mware';
import z from 'zod';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';


const router: Router = express.Router();

router.get('/check',async (req: Request, res: Response) => {
   
    try 
    {  z.string().email().parse(req.query.email)}catch (error) {
res.status(400).json({ error: "Invalid email format" });
return;
    }
    
    try {
 const mail = req.query.email;

 console.log("Checking user existence for email:", mail);
 
 
 if (!mail) {
    return res.status(400).json({ error: "Email is required" });
  }
    const user = await User.findOne({ email: mail });
    //console.log("User found:", user);
    if (user) {
        return res.status(200).json({ exist: true });
    }
    return res.status(200).json({ exist: false });
    } catch (error) {
        console.error("Error checking user existence:", error);

}
})
router.put('/cmnt/helpful/:id', async (req: Request, res: Response) => {
    const commentId = req.params.id;
    const { helpful } = req.body;

    if (typeof helpful !== 'boolean') {
        return res.status(400).json({ error: "Invalid request body" });
    }

    try {
        const comment = await Rating.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (helpful===true) {
comment.helpful = (comment.helpful ?? 0) + 1;}
        else if (helpful===false) {
            comment.helpful= (comment.helpful ?? 0) - 1;
        }
        await comment.save();
        console.log("Updated helpful count:", comment.helpful);
        res.status(200).json({ message: "Comment updated successfully", totalHelpful: comment.helpful });
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).json({ error: "Error updating comment" });
    }

});
router.get('/instructor/:id' ,authlite, async (req: Request, res: Response) => {
const uname = req.params.id;



    if (req.user.username === uname) {
        
    const userData= await User.findById(req.user._id).select('username bio email img bgimg socialLinks skills pur_courses rel_courses ').populate({
        path: 'rel_courses',
        select: 'img name description price instructor timestamp'
    }).populate({
        path: 'pur_courses',
        select: 'img name description price instructor timestamp'
    }).lean().exec();
    
    const instructorWithRole = { ...userData, role: "owns" };
    res.status(200).json(instructorWithRole);

    }

    else {
        const instructor = await User.findOne({ username: uname }).select('username bio img bgimg skills socialLinks rel_courses').populate({
        path: 'rel_courses',
        select: 'img name description price instructor timestamp'
    }).lean().exec();
    if (!instructor) {
        return res.status(404).json({ error: "Instructor not found" });
    }
    const instructorWithRole = { ...instructor, role: "guest" };
    res.status(200).json(instructorWithRole);

    }
 
})
router.get('/me', auth,async (req: Request, res: Response) => {

    const user = req.user;
  //  console.log("User found:", user);
    const data ={_id : user._id ,username: user.username, email: user.email, img: user.img};
   
    res.status(200).json(data);
    
});

router.get('/rated', auth, async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const ratings= await User.findById(user._id).populate('rated');
    res.status(200).json(ratings);
    }
);

router.post('/updatestats', auth, async (req: Request, res: Response) => {
    const user = req.user;
    try {

    const {vidId, courseID, IntervalFinished} = req.body;
    if (!vidId || !courseID || !IntervalFinished  || !user._id) {
        return res.status(400).json({ error: "Missing required fields" });
      }
    const tracks =  await Tracking.findOne({userId: user._id, courseId: courseID, videoId: vidId});
    if (!tracks) {
        return res.status(404).json({ error: "Tracking not found" });
      }
      if (IntervalFinished === 3) {
        tracks.finished = true;
      }

    
    tracks.lastViewedTime = new Date();

    tracks.watchedInt = IntervalFinished ;
    await tracks.save();
    res.status(200).json({ message: "Stats updated successfully" });
    } catch (error) {
        res.status(500).json({ error: " Error saving stats" });
    }
}
);


router.get("/check-username",authlite, async (req, res) => {

  const { username } = req.query;
  if (username===req.user.username) {
    return res.json({ available: true });
  }
  const user = await User.findOne({ username });
  res.json({ available: !user }); // true if username is available
});



const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // @ts-ignore
        folder: 'profile_pics',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });





router.post('/update',auth, upload.fields(
        [{ name: 'profileImage', maxCount: 1 }, 
        { name: 'bannerImage', maxCount: 1 }]), 
        async (req: Request, res: Response) => {
            try{
                const userid=req.user.id;
                if (!userid){               
                  return res.status(401).json({ error: 'Unauthorized' });

            }
            
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const profileImage = files?.profileImage?.[0];
        const bannerImage = files?.bannerImage?.[0];
            
        const { username, bio, skills, socialLinks } = req.body;

        console.log("Received data:", { username, bio, skills, socialLinks, profileImage, bannerImage });
                }
                catch(e){
                    console.log("error",e)
                    return res.status(402).json({massage:"error"+e})
                }

        })


       router.get('/verify/:certid', async (req: Request, res: Response) => {
        const certid = req.params.certid;

        try {
            const certificate = await Certificate.findById(certid).populate({ path: "user.id", select: "username img" });
            if (!certificate) {
                return res.status(404).json({ error: "Certificate not found" });
            }
            res.status(200).json(certificate);
        } catch (error) {
            console.error("Error fetching certificate:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    })

    router.post('/schedule/liveclass/:id', auth, async (req: Request, res: Response) => {
    const { title, description, scheduledAt, duration } = req.body;
    const courseId = req.params.id;

    const instructorId: any = await Course.findById(courseId).select('instructor').lean().exec();
    if (!instructorId) {
        return res.status(404).json({ error: "Course not found" });
    }
    if (instructorId.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: "Forbidden: You are not authorized to schedule live classes for this course" });
    }

    try {
        const liveClass = new LiveClass({
            courseId,
            title,
            description,
            scheduledAt,
            duration,
                       
            instructorId: req.user._id
        });
        await liveClass.save();
        res.status(201).json({ message: "Live class scheduled successfully", liveClass });
    } catch (error) {
        console.error("Error scheduling live class:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

 router.get('/liveclass/:id', auth, async (req: Request, res: Response) => {
    const courseId = req.params.id;
    let Role="!pur";
    const user = req.user;
   
    if (user.pur_courses.includes(courseId)) {
        Role = "pur";
    } if (user.rel_courses.includes(courseId)) {
        Role = "owns";
    }
    try {
        const liveClass = await LiveClass.findOne({ courseId }).select('title description scheduledAt duration link courseId instructorId').populate({ path: 'instructorId', select: 'username img' }).populate({path: 'courseId', select: 'name img'}).lean().exec();
        if (!liveClass) {
            return res.status(250).json({ Role,message: "Live class not found" });
        }

        res.status(200).json({ Role, liveClass });
    } catch (error) {
        console.error("Error fetching live class:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

