import mongoose, { ConnectOptions } from 'mongoose';




const { MONGO_URI } = process.env;


if (!MONGO_URI) {
  throw Error("missing .env");
}

mongoose.connect(MONGO_URI, {
  dbName: "VaurLis",
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
} as ConnectOptions);

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

const userSchema = new mongoose.Schema({
    username:String,
    email: {
        type: String,
        required: true,
        match: /^[^@]+@[^@]+\./
    },
    password:String,
    bio: String,
    img : String,
    bgimg: String,
    skills : [String],
    socialLinks:{
      github : String,
      linkedin : String,
      X:String,
      mail:String
    },
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
    timestamp : {type : Date, default : Date.now},
    tags : [String]
    
});
const Course = mongoose.model("Course", courseSchema);

const CertSchema = new mongoose.Schema({
  user: { id : {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
   name: String },
  
  courseId: {id:{ type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true}, 
  name: String,
  instructor: String ,
  duration: String },
  issuedAt: { type: Date, default: Date.now }
});

const liveClassSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  link: { type: String } // Made required since it was causing errors
});

const LiveClass = mongoose.model("LiveClass", liveClassSchema);

const Certificate = mongoose.model("Certificate", CertSchema);

export { User, Course, Rating, Tracking, LiveClass, Certificate };


