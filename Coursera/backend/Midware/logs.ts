
const bcrypt = require("bcrypt");
const dotenv = require('dotenv');
const express = require('express');
const { User } = require("../DB/MDB");
const jwt = require ('jsonwebtoken');
import type { Request, Response } from 'express';

dotenv.config();
const { JWT_SECRET } = process.env;

const app = express();
app.use(express.json());

 async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 5);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}



app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body //as { username: string; password: string };
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const ismatch :Boolean = await verifyPassword(password, user.password);
  if (!ismatch) {
    return res.status(401).json({ error: "Invalid password" });
  }
    const token : String= jwt.sign({ username: user.username }, JWT_SECRET as string, { expiresIn: '1h' });
    res.header('Authorization', `Bearer ${token}`);
    res.status(200).json({ message: "Login successful" });
});

app.post('/api/signup', async (req: Request, res: Response) => {
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
    res.status(201).json({ message: "User created successfully" });

}
)





