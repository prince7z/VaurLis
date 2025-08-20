import mongoose, { Types } from "mongoose";
import { faker } from "@faker-js/faker";

// Make sure the path to your models file is correct
import { User, Course, Tracking, Rating } from "./DB/MDB";

// --- TypeScript Interface Definitions ---
// Describes the shape of the documents, including relationship arrays.

interface IVideo {
    _id: Types.ObjectId;
    name: string;
    link: string;
    thumbnail: string;
    duration: number;
}

interface ICourse {
    _id: Types.ObjectId;
    name: string;
    description: string;
    img: string;
    price: number;
    duration: string;
    instructor: Types.ObjectId;
    content: IVideo[];
    rating: Types.ObjectId[];
    act_users: Types.ObjectId[];
}

interface IUser {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    skills: string[];
    img: string;
    pur_courses: Types.ObjectId[];
    rated: Types.ObjectId[];
}

interface ITracking {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    videoId: Types.ObjectId;
    finished: boolean;
    lastViewedTime: Date;
    watchedTime: number;
}

interface IRating {
    _id: Types.ObjectId;
    course: Types.ObjectId;
    user: Types.ObjectId;
    rating: number;
    review: string;
    helpful: number;
    timestamp: Date;
}

// --- Main Seeding Script ---

const MONGO_URI = "mongodb://localhost:27017/Coursera";

const NUM_USERS = 200;
const NUM_COURSES = 50;
const MAX_VIDEOS_PER_COURSE = 10;
const MAX_COURSES_PER_USER = 5;
const MAX_VIDEOS_PER_USER = 10;
const MAX_RATINGS_PER_USER = 10;

const seedDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Database connected for seeding...");

        await User.deleteMany({});
        await Course.deleteMany({});
        await Tracking.deleteMany({});
        await Rating.deleteMany({});
        console.log("🧹 Cleared existing data.");

        // --- STAGE 1: GENERATE ALL DOCUMENTS IN MEMORY ---

        // 1️⃣ Generate Users
        const users: IUser[] = [];
        for (let i = 0; i < NUM_USERS; i++) {
            users.push({
                _id: new mongoose.Types.ObjectId(),
                username: faker.internet.username(),
                email: faker.internet.email().toLowerCase(),
                password: faker.internet.password(),
                skills: faker.helpers.arrayElements(["JS", "Python", "C++", "Java", "MongoDB"], { min: 2, max: 4 }),
                img: faker.image.avatar(),
                pur_courses: [],
                rated: [],
            });
        }

        // 2️⃣ Generate Courses with Videos
        const courses: ICourse[] = [];
        for (let i = 0; i < NUM_COURSES; i++) {
            const content: IVideo[] = [];
            const numVideos = faker.number.int({ min: 5, max: MAX_VIDEOS_PER_COURSE });
            for (let j = 0; j < numVideos; j++) {
                content.push({
                    _id: new mongoose.Types.ObjectId(),
                    name: faker.lorem.words(3),
                    link: faker.internet.url(),
                    thumbnail: faker.image.url(),
                    duration: faker.number.int({ min: 5, max: 30 }),
                });
            }

            courses.push({
                _id: new mongoose.Types.ObjectId(),
                name: faker.company.catchPhrase(),
                description: faker.lorem.paragraph(),
                img: faker.image.url(),
                price: faker.number.int({ min: 0, max: 5000 }),
                duration: `${faker.number.int({ min: 100, max: 200 })} min`,
                instructor: faker.helpers.arrayElement(users)._id,
                content,
                rating: [],
                act_users: [],
            });
        }

        // 3️⃣ Generate Tracking Data
        const tracking: ITracking[] = [];
        users.forEach(user => {
            const enrolledCourses = faker.helpers.arrayElements(courses, { min: 1, max: MAX_COURSES_PER_USER });
            enrolledCourses.forEach(course => {
                const watchedVideos = faker.helpers.arrayElements(course.content, { min: 1, max: MAX_VIDEOS_PER_USER });
                watchedVideos.forEach(video => {
                    tracking.push({
                        _id: new mongoose.Types.ObjectId(),
                        userId: user._id,
                        courseId: course._id,
                        videoId: video._id,
                        finished: faker.datatype.boolean(),
                        lastViewedTime: faker.date.recent(),
                        watchedTime: faker.number.int({ min: 0, max: video.duration * 60 }),
                    });
                });
            });
        });

        // 4️⃣ Generate Ratings
        const ratings: IRating[] = [];
        users.forEach(user => {
            const ratedCourses = faker.helpers.arrayElements(courses, { min: 0, max: MAX_RATINGS_PER_USER });
            ratedCourses.forEach(course => {
                ratings.push({
                    _id: new mongoose.Types.ObjectId(),
                    course: course._id,
                    user: user._id,
                    rating: faker.number.int({ min: 1, max: 5 }),
                    review: faker.lorem.sentences(2),
                    helpful: faker.number.int({ min: 0, max: 50 }),
                    timestamp: faker.date.recent(),
                });
            });
        });
        
        console.log("🌱 Generated all documents in memory.");

        // --- STAGE 2: LINK THE DOCUMENTS TOGETHER ---
        
        console.log("🔗 Linking documents...");

        // Create Maps for efficient lookups
        const userMap = new Map(users.map(u => [u._id.toHexString(), u]));
        const courseMap = new Map(courses.map(c => [c._id.toHexString(), c]));

        // Link ratings to courses and users
        for (const rating of ratings) {
            const course = courseMap.get(rating.course.toHexString());
            const user = userMap.get(rating.user.toHexString());
            if (course) {
                course.rating.push(rating._id);
            }
            if (user) {
                user.rated.push(rating._id);
            }
        }

        // Link tracking data to create purchased courses and active users
        for (const track of tracking) {
            const course = courseMap.get(track.courseId.toHexString());
            const user = userMap.get(track.userId.toHexString());
            // Add active user to course if not already present
            if (course && !course.act_users.some(id => id.equals(track.userId))) {
                course.act_users.push(track.userId);
            }
            // Add purchased course to user if not already present
            if (user && !user.pur_courses.some(id => id.equals(track.courseId))) {
                user.pur_courses.push(track.courseId);
            }
        }
        
        // --- STAGE 3: SAVE EVERYTHING TO THE DATABASE ---

        await User.insertMany(users);
        await Course.insertMany(courses);
        await Tracking.insertMany(tracking);
        await Rating.insertMany(ratings);

        console.log("🚀 Database has been successfully seeded with all relationships!");

    } catch (error: any) {
        console.error("❌ Error seeding database:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from database.");
    }
};

seedDatabase();