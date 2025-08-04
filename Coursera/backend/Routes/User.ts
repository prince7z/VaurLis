import express, { Request, Response, Router } from 'express';
import { User } from '../DB/MDB';
import auth  from '../Midware/Mware';

const router: Router = express.Router();


router.get('/me', auth,async (req: Request, res: Response) => {

    const user = req.user;
    res.status(200).json(user.username);
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

