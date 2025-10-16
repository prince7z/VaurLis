import { useRecoilValueLoadable } from "recoil";
import { CoursesState } from "../Component/atoms/atoms";
import Coursecard from "../Component/coursecard";
import { useEffect, useState } from "react";

export default function Courses() {
  const coursesLoadable = useRecoilValueLoadable(CoursesState("all"));
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (coursesLoadable.state === "hasValue") {
      const filteredCourses = coursesLoadable.contents.filter((course: any) =>
        (course.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (course.description?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (course.instructor?.username?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
      );
      setCourses(filteredCourses);
    }
  }, [coursesLoadable, searchTerm]);

  return (
    <div className="px-4 py-8">
      <div className="max-w-md mx-auto mb-8">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mt-14 border border-gray-300 p-2 rounded shadow-sm"
          placeholder="Search courses by title, description, or instructor..."
        />
      </div>
      {coursesLoadable.state === "loading" ? (
        <p>Loading...</p>
      ) : coursesLoadable.state === "hasError" ? (
        <p>Error loading courses</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <Coursecard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
