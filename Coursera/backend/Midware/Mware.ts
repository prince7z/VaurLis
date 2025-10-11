import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { User } from '../DB/MDB';
import { ObjectId } from 'mongodb';

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("missing .env");
}

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: typeof User.prototype;
    }
  }
}


export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {

  const header = req.headers.authorization;
  
 
  if (!header) {
    res.status(401).send("Unauthorized : header missing");
    return;
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
          const user = await User.findOne({ username: decoded.username });
    if (!user) {
      res.status(401).send("Unauthorized : User not found");
      return;
    }
    req.user = user;

    next();
   

  } catch (err) {
          console.log("JWT Verification Error:", err);

    res.status(401).send("Unauthorized : Invalid token");
  }
}


export async function authlite(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ") || header.split(" ").length < 2) {
    console.log("No valid auth header, proceeding as guest");
    req.user = { username: "guest" };
    return next();
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as jwt.JwtPayload;
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
      req.user = { username: "guest" };
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    req.user = { username: "guest" };
    next();
  }
}



