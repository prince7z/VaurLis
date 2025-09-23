import express, { Request, Response, Router } from 'express';
import { User, Tracking, Rating } from '../DB/MDB';

import { auth, authlite } from '../Midware/Mware';
import z from 'zod';
import path from 'path';


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
    const userData= await User.findById(req.user._id).select('username email img bgimg socialLinks skills pur_courses rel_courses ').populate({
        path: 'rel_courses',
        select: 'img name description price instructor timestamp'
    }).populate({
        path: 'pur_courses',
        select: 'img name description price instructor timestamp'
    }).lean().exec();
    
    res.status(200).json(userData);
    }


    else if (req.user.username === "guest") {

        const instructor = await User.findOne({ username: uname }).select('username img bgimg skills socialLinks rel_courses').populate({
        path: 'rel_courses',
        select: 'img name description price instructor timestamp'
    }).lean().exec();
    if (!instructor) {
        return res.status(404).json({ error: "Instructor not found" });
    }
    res.status(200).json(instructor);

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
router.put('/update', auth, async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const { username, email, img, skills } = req.body;
    if (email && !/^[^@]+@[^@]+\.[cC][oO][mM]$/.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
    }  user.username = username || user.username;
    user.email = email || user.email;
    user.img = img || user.img;
    user.skills = skills || user.skills;
  
    try {
      await user.save();
      res.status(200).json({ message: " Profile updated successfully", user });
    } catch (error) {
      res.status(500).json({ error: " Error saving user" });
    }
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






       


export default router;

