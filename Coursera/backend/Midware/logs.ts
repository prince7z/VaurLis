import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../DB/MDB';


dotenv.config();

const router: Router = express.Router();


const { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  throw new Error("missing .env");
}

const app = express();
app.use(express.json());

 async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 5);
}

async function verifyPassword(password: string | null | undefined, hash: string): Promise<boolean> {
  let result = await bcrypt.compare(password || '', hash);
  if (!result) {
    if (password === hash) result = true;
  }
  return Boolean(result);
}



router.post('/login', async (req: Request, res: Response) => {
  
  const { email, password } = req.body //as { username: string; password: string };
  console.log("Login attempt for username:", email ,password);
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const ismatch :boolean = await verifyPassword(password,  user.password as string );
  console.log("Password match result:", ismatch);
  if (!ismatch) {
    console.log("real password:", user.password ,"provided password:", password);
    return res.status(401).json({ error: "Invalid password" });
  }
    const token : string= jwt.sign({ username: user.username }, JWT_SECRET as string, { expiresIn: '1h' });
    res.header('Authorization', `Bearer ${token}`);
    res.status(200).json({ message: "Login successful",token : token });
});

router.post('/signup', async (req: Request, res: Response) => {
    const { username, email, password, img, skills } = req.body; //as { username: string; email: string; password: string; img?: string; skills?: string[]; role: string };
    const existingUser = await User.find({ $or: [ { username: username }, { email: email } ] });
    
    if (existingUser.length) {
        return res.status(400).json({ error: "Username or email already exists" });
    }


    const hashedPassword = await hashPassword(password);
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        img,
        skills,
        rel_courses: [],
        pur_courses: [],
            });
    await newUser.save();
    const token: string = jwt.sign({ username: newUser.username}, JWT_SECRET as string, { expiresIn: '1h' });
    res.header('Authorization', `Bearer ${token}`);
    res.status(201).json({ message: "User created successfully",token : token  });

    })
export default router;




