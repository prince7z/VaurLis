import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import { finished } from 'stream';

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

const trackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, required: true }, // 👈 reference to course.content._id

  finished: { type: Boolean, default: false },
  lastViewedTime: { type: Date, default: Date.now },
  watchedInt: { type: Number, default: 0 }, // in seconds
}, { timestamps: true });

trackingSchema.index({ userId: 1, courseId: 1, videoId: 1 }, { unique: true });
const Tracking = mongoose.model("Tracking", trackingSchema);

const ratingSchema = new mongoose.Schema({
    course : { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating : Number,
    review: String,
    helpful: Number,
    timestamp : {type : Date, default : Date.now}

  });
    
    const Rating = mongoose.model("rating", ratingSchema);
const courseSchema = new mongoose.Schema({
    name:String,
    description:String,
    img:String,
    price:Number,
    duration:String,
    rating: [{type: mongoose.Schema.Types.ObjectId, ref: "rating" }],
    instructor: { type: mongoose.Schema.Types.ObjectId,ref: "User" },
      content: [{
    name: { type: String, required: true },     // Lecture title
    link: { type: String, required: true },     // Video URL
    thumbnail: String,                          // Preview image
    duration: Number                            // Video length in seconds/minutes
  }],
    act_users : [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    links :[String],
    timestamp : {type : Date, default : Date.now}
});
const Course = mongoose.model("Course", courseSchema);




export { User, Course, Rating, Tracking };

//export { User, Course, Rating ,Tracking};

    