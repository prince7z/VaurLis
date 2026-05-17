import bcrypt from 'bcrypt';
import express, { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../DB/MDB';
import { genotp, storeOtp, verifyOtp ,res} from '../utlis/otpstore';
import { sendOTPEmail } from '../config/emailService';



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


router.post('/send-otp',async(req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = genotp();
  storeOtp(email, otp);
  const emailResult  = await sendOTPEmail(email, otp);
  if(emailResult.success){
    return res.status(200).json({ message: "OTP sent successfully" });
  }
  return res.status(500).json({ error: "Failed to send OTP",res: emailResult});
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  const { email, otp, username, password,work } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }
  
  try {
    const result: res = verifyOtp(email, otp);
    
    if (result === "VALID") {
      
      // Case 1: Password Reset
      if (work === "reset") {
        if (!password || password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        
        const user = await User.findOne({ email: email });
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
        await user.save();
        
        return res.status(200).json({ message: "Password reset successfully" });
      }

      // Case 2: Registration
      if (username && password) {
        if (password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        
        const existingUser = await User.find({ email: email });
        if (existingUser.length) {
          return res.status(400).json({ error: "Email already exists" });
        }
        
        // Hash the password before saving
        const hashedPassword = await hashPassword(password);
        const newUser = new User({ email, username, password: hashedPassword });
        await newUser.save();
        
        const token: string = jwt.sign({ username: newUser.username }, JWT_SECRET as string, { expiresIn: '24h' });
        res.header('Authorization', `Bearer ${token}`);
        
        return res.status(200).json({ 
          message: "OTP Verified, User registered successfully",
          token: token 
        });
      }
      
      // If neither reset nor registration, return error
      return res.status(400).json({ error: "Invalid request. Please provide required fields." });
    
    }
    
    if (result === "NOT_FOUND") {
      return res.status(404).json({ error: "No OTP found for this email" });
    }
    if (result === "EXPIRED") {
      return res.status(410).json({ error: "OTP has expired" });
    }
    if (result === "EXCEEDED_ATTEMPTS") {
      return res.status(429).json({ error: "Exceeded maximum OTP verification attempts" });
    }
    if (result === "INVALID_OTP") {
      return res.status(401).json({ error: "Invalid OTP" });
    }
    
    // Fallback (shouldn't reach here)
    return res.status(500).json({ error: "Unexpected error occurred" });
    
  } catch(err) { 
    console.log({ err });
    return res.status(400).json({ error: err });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  
  const { email, password } = req.body //as { username: string; password: string };
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const ismatch :boolean = await verifyPassword(password,  user.password as string );
  if (!ismatch) {
    return res.status(401).json({ error: "Invalid password" });
  }
    const token : string= jwt.sign({ username: user.username }, JWT_SECRET as string, { expiresIn: '24h' });
    res.header('Authorization', `Bearer ${token}`);
    res.status(200).json({ message: "Login successful",token : token, });
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




