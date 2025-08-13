import { useRecoilValueLoadable } from "recoil";
import  {CoursesState}  from "../Component/atoms/atoms";

export default function Courses() {
  const coursesLoadable = useRecoilValueLoadable(CoursesState);

  if (coursesLoadable.state === "loading") return <p>Loading...</p>;
  if (coursesLoadable.state === "hasError") return <p>Error loading courses</p>;

  const courses = coursesLoadable.contents;

  console.log(courses);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course: any) => (
        
        <a
          key={course.id}
          href={`/course/${course._id}`}
          className="block"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div>
            
            <h2 className="text-xl font-bold">{course.name}</h2>
            <img src={course.image} alt={course.name} className="w-full h-48 object-cover mb-4" />
            <p>{course.description}</p>
            <p className="text-sm text-gray-500">{course.duration}</p>
            <p className="text-sm text-gray-500">{course.price}</p>
          </div>
        </a>
      ))}
    </div>
  );
}
