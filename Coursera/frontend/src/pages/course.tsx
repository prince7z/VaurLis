import { useRecoilValueLoadable } from 'recoil';
import { CourseState } from '../Component/atoms/atoms';
import { useParams } from 'react-router-dom';
//import { InstState } from '../Component/atoms/atoms';

export default function Course() {
    const courseId : string =  useParams().id || '';
    if (!courseId) {
        return <p>Course ID is missing</p>;
    }
  const courseLoadable = useRecoilValueLoadable(CourseState(courseId));

  if (courseLoadable.state === "loading") return <p>Loading...</p>;
  if (courseLoadable.state === "hasError") return <p>Error loading course</p>;

  const course = courseLoadable.contents;
  console.log(course.instructor);
  //const instructorLoadable = useRecoilValueLoadable(course);

  return (
    <div>
        <img src={course.img} alt={course.name} />
      <h2>{course.name}</h2>
      <p>Price: ₹{course.price}</p>
      <p>{course.description}</p>
        <p>Duration: {course.duration}</p>
        <p>Instructor: {course.instructor}</p>
        <p>Category: {course.rating}</p>
      
      
    </div>
  );
}
