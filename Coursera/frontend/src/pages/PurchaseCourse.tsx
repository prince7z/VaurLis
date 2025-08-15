import { useParams } from "react-router-dom";
import { useRecoilValueLoadable } from "recoil";
import { CourseState } from "../Component/atoms/atoms";
import axios from 'axios';
const BaseUrl = 'http://localhost:5000';
import { useNavigate } from 'react-router-dom';





export default function PurchaseCourse() {
    const navigate = useNavigate();

  const { id: courseIdParam } = useParams<{ id: string }>();

    const courseId = courseIdParam || '';
    const courseLoadable = useRecoilValueLoadable(CourseState(courseId));
    const course = courseLoadable.state === "hasValue" ? courseLoadable.contents : null;
  if (!courseId) return <p>Course ID is missing</p>;
  if (courseLoadable.state === "loading" ) return <p>Loading...</p>;
  if (courseLoadable.state === "hasError" ) return <p>Error loading course</p>;

  async function purchaseCourse(id:string) {
     try {
    const res = await axios.get(`${BaseUrl}/api/course/purchase/${id}`, {
      headers: {
        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
      }
    });
    console.log(res);

    // If the purchase was successful
    alert('Purchase successful!');
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 400) {
        alert('Course already purchased');
      } else {
        alert(`Error: ${error.response.status} - ${error.response.data?.message || 'Something went wrong'}`);
      }
    } else {
      alert('Network error');
    }
  }

  }

  return (
    <div>
      <h1>Checkout</h1>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <p>Price: ${course.price}</p>
      { course.price === 0 && 
        <button 
          onClick={() => purchaseCourse(courseId)}
          className='text-white bg-black p-2 rounded cursor-pointer hover:bg-gray-800'
        >
          Enroll now
        </button>
      }
      { course.price !== 0 && 
        <button
          onClick={() => purchaseCourse(courseId)}
          className='text-white bg-black p-2 rounded cursor-pointer hover:bg-gray-800'
        >
          Purchase now
        </button>
      }
    </div>
  );
}
