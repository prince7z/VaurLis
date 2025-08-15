import express, { Request, Response, Router } from 'express';
import { User } from '../DB/MDB';
import auth  from '../Midware/Mware';
import z from 'zod';

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
router.get('/inst', async (req: Request, res: Response) => {
    
    const instId:string = req.headers.instructorid as string;
    
    console.log("Fetching instructor for ID:", instId);
    const instructor = await User.findById(instId).select('username img skills').lean().exec();
    if (!instructor) {
        return res.status(404).json({ error: "Instructor not found" });
    }
    console.log("Instructor found for ",instId, instructor);
    res.status(200).json(instructor);

})
router.get('/me', auth,async (req: Request, res: Response) => {

    const user = req.user;
  //  console.log("User found:", user);
    const data ={_id : user._id ,username: user.username, email: user.email, img: user.img};
   
    res.status(200).json(data);
    
});
router.get('/profile', auth, async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user)   
    
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

export default router;

