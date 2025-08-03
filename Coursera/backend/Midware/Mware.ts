import type { Request, Response, NextFunction } from 'express';
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { User } = require("../DB/MDB");
dotenv.config();
const { JWT_SECRET } = process.env;

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: typeof User.prototype;
    }
  }
}

async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header) {
    res.status(401).send("Unauthorized : header missing");
    return;
  }
  const token = header.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET as string);
    const user = await User.findOne({ username: decoded.username });
    if (!user) {
      res.status(401).send("Unauthorized : User not found");
      return;
    }
    req.user = user; // Attach user to request object
    next();
  } catch (err) {
    res.status(401).send("Unauthorized : Invalid token");
  }
}


