import { useRecoilValueLoadable, useRecoilState } from 'recoil';
import { CourseState, CourseReview, userState } from '../Component/atoms/atoms';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import ReviewItem from '../Component/review';
import axios from 'axios';

const BASE_URL = "http://localhost:5000";

interface Course {
    name: string;
    img: string;
    description: string;
    price: number;
    duration: string;
    instructor: {
        username: string;
        img: string;
        skills: string[];
    };
    content: string[];
    act_users: number;
    Role: 'pur' | '!pur' | 'owns';
    timestamp: number;
}

interface Review {
    _id: string;
    user: {
        img: string;
        username: string;
    };
    review: string;
    rating: number;
    timestamp: number;
}



export default function Course() {
    const { id: courseIdParam } = useParams();

    const courseId = courseIdParam || '';
    const courseLoadable = useRecoilValueLoadable(CourseState(courseId));
    const course = courseLoadable.state === "hasValue" ? courseLoadable.contents : null;
    const reviewLoadable = useRecoilValueLoadable(CourseReview(courseId));
    const reviews = reviewLoadable.state === "hasValue" ? reviewLoadable.contents : [];

    if (!courseId) return <div className="flex justify-center items-center min-h-screen">Course ID is missing</div>;
    if (courseLoadable.state === "loading") return <div className="flex justify-center items-center min-h-screen">Loading details...</div>;
    if (courseLoadable.state === "hasError") return <div className="flex justify-center items-center min-h-screen">Error loading course. Please try logging in again.</div>;
    if (reviewLoadable.state === "hasError") return <div className="flex justify-center items-center min-h-screen">Error loading reviews</div>;
    if (reviewLoadable.state === "loading") return <div className="flex justify-center items-center min-h-screen">Loading reviews...</div>;
    if (!course) return <div className="flex justify-center items-center min-h-screen">Course not found</div>;
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <img src={course.img} alt={course.name} className="w-full h-64 object-cover" />
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
                    <p className="text-2xl font-semibold mb-4">₹{course.price}</p>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    <p className="text-sm text-gray-500 mb-4">
                        Posted on: {new Date(course.timestamp).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                    <p className="text-gray-700 mb-6">Duration: {course.duration}</p>

                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <div className="flex items-center mb-4">
                            <img src={course.instructor.img} alt={course.instructor.username} className="w-12 h-12 rounded-full mr-4" />
                            <li >
                                <a href={`/${course.instructor.username}`}>
                                <h3 className="font-semibold">Instructor: {course.instructor.username}</h3>
                                <p className="text-gray-600">Skills: {course.instructor.skills.join(', ')}</p>
                            </a>
                          </li>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                        {(course.Role === 'pur' || course.Role === 'owns') && <a href={`/course/content/${courseId}`} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">View Recorded Content</a>}
                         {course.Role ==='pur'&& <a href={`/course/live/${courseId}`} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Go Live</a>}
                        {course.Role === '!pur' && <a href={`/course/purchase/${courseId}`}  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Enroll Now</a>}
                        {course.Role === 'owns' && <a href={`/course/update/${courseId}`} className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">Update Course</a>}
                        {course.Role === 'owns' && <a href={`/course/live/${courseId}`} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Shedule LiveClass</a>}
                        {course.Role ==='pur'&& <a href={`/course/certificate/${courseId}`} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">Claim Certificate</a>}
                    </div>
                        {course.Role === 'pur' && <div className="mt-8"><Review courseId={courseId}/></div>}

                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                        <div className="space-y-6">
                            {reviews.length > 0 ? reviews.map((item: Review) => (
                                <ReviewItem key={item._id} item={item} />
                            )) : <p className="text-gray-500">No reviews yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface UserData {
    email: string;
    _id: string;
    username: string;
    img: string;
}

function Review({ courseId }: { courseId: string }) {
    const [review, setReview] = useState<string>('');
    const [rating, setRating] = useState<number>(0);
    const [helpful, setHelpful] = useState<boolean | null>();
    const [reviewState, setReviewState] = useRecoilState(CourseReview(courseId));
    const user = useRecoilValueLoadable(userState);
    const userData: UserData = user.state === "hasValue" ? (user.contents as UserData) : { email: "", _id: "", username: "", img: "" };

    const handleSubmit = async () => {
        try {
            const res = await axios.post(
                `${BASE_URL}/api/course/postreview/${courseId}`,
                { review, rating },
                { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }}
            );

            if (res.status === 200) {
                alert('Review posted successfully');
                setReviewState([
                    ...reviewState,
                    {
                        _id: res.data._id,
                        user: {
                            img: userData.img,
                            username: userData.username
                        },
                        review,
                        rating,
                        timestamp: Date.now()
                    }
                ]);
                setReview('');
                setRating(0);
            }
        } catch (error) {
            alert('Error posting review. Please login again as your token may have expired.');
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-gray-700 mb-2">Rating (1-5)</label>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Your Review</label>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Share your thoughts about this course..."
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Submit Review
                </button>
            </div>
        </div>
    );
}