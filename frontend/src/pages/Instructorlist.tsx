import { useEffect, useState } from "react";
import axios from "axios";
import Instructor from "../Component/instructor";
import { API_URL } from "../config/api";

interface InstructorType {
  id: string;
  username: string;
  bio: string;
  img: string;
  verified?: boolean;
}

export default function Instructorlist() {
  const [instructors, setInstructors] = useState<InstructorType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try { 
        const res = await axios.get(`${API_URL}/api/course/instructorlist`);
        if (res.data && res.data.instructors) {
          setInstructors(res.data.instructors);
        }
        console.log(res);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Meet Our Instructors
        </h1>
        
        {instructors.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {instructors.map((instructor, index) => (
              <Instructor
                key={instructor.id || index}
                id={instructor.id}
                username={instructor.username}
                bio={instructor.bio}
                img={instructor.img}
                verified={instructor.verified? instructor.verified : true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h10M17 24h10M17 28h10M21 12H31A2 2 0 0133 14V34A2 2 0 0131 36H21" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
            <p className="text-gray-500">Check back later for more instructors.</p>
          </div>
        )}
      </div>
    </div>
  );
}