const mongoose = require("mongoose");
import type { ConnectOptions } from "mongoose";
const dotenv = require("dotenv");
dotenv.config();
const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  throw new Error("missing .env");
}

mongoose.connect(MONGO_URI, {
  dbName: "Coursera"
} as ConnectOptions);

const userSchema = new mongoose.Schema({
    username:String,
    email: {
        type: String,
        required: true,
        match: /^[^@]+@[^@]+\.[cC][oO][mM]$/
    },
    password:String,
    img : String,
    skills : [String],
    pur_courses : [{typr : mongoose.Schema.Types.ObjectId , ref: "Course"}],
    rel_courses : [{type: mongoose.Schema.Types.ObjectId,  ref: "Course" }],
    rated : [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
    });
const ratingSchema = new mongoose.Schema({
    course : { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rate : Number,
    comment: String,
    helpful: Number})

const courseSchema = new mongoose.Schema({
    name:String,
    description:String,
    img:String,
    price:Number,
    duration:String,
    rating: [{type: ratingSchema}],
    instructor: [{ type: mongoose.Schema.Types.ObjectId,ref: "Admin"}]
});



const User = mongoose.model("User", userSchema);
const Course = mongoose.model("Course", courseSchema);

module.exports = { User, Course };
    