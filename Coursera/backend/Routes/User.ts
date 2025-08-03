const express = require('express');
const { User } = require("../DB/MDB");
import type { Request, Response } from 'express';
const auth = require('./Mware').auth;
const router = express.Router();