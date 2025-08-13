import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const { MONGO_URI } = process.env;


if (!MONGO_URI) {
  throw Error("missing .env");
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
    pur_courses : [{type : mongoose.Schema.Types.ObjectId , ref: "Course"}],
    rel_courses : [{type: mongoose.Schema.Types.ObjectId,  ref: "Course" }],
    rated : [{ type: mongoose.Schema.Types.ObjectId, ref: "rating" }]
    });
    const User = mongoose.model("User", userSchema);
const ratingSchema = new mongoose.Schema({
    course : { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rate : Number,
    comment: String,
    helpful: Number});
    
    const Rating = mongoose.model("rating", ratingSchema);
const courseSchema = new mongoose.Schema({
    name:String,
    description:String,
    img:String,
    price:Number,
    duration:String,
    rating: [{type: ratingSchema}],
    instructor: { type: mongoose.Schema.Types.ObjectId,ref: "User" },
    content: [String],
    act_users : [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    links :[String]
});
const Course = mongoose.model("Course", courseSchema);






export { User, Course, Rating };
    