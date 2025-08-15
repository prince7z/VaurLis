import { useRecoilValueLoadable } from 'recoil';
import { CourseState } from '../Component/atoms/atoms';
import { useParams } from 'react-router-dom';
import  { useEffect, useState } from 'react';
import axios from 'axios';
import { CourseReview } from '../Component/atoms/atoms';



const Base_URL = "http://localhost:5000";

interface resCourse{
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
    Role: 'pur'|'!pur'|'owns';
}

interface rev{
    _id: string;
    user: { img: string;
    username: string;};
    review: string;
    rating: number;
}



 
export default function Course() {
  const { id: courseIdParam } = useParams();
  const courseId = courseIdParam || '';
  const courseLoadable = useRecoilValueLoadable(CourseState(courseId));
  const course = courseLoadable.state === "hasValue" ? courseLoadable.contents : null;
  const reviewLoadable = useRecoilValueLoadable(CourseReview(courseId));
  const review = reviewLoadable.state === "hasValue" ? reviewLoadable.contents : null;

  
  if (!courseId) return <p>Course ID is missing</p>;
  if (courseLoadable.state === "loading" ) return <p>Loading...</p>;
  if (courseLoadable.state === "hasError" ) return <p>Error loading course</p>;
  
  if (reviewLoadable.state === "hasError" ) return <p>Error loading review</p>;
  if (reviewLoadable.state === "loading" ) return <p>Loading...</p>;



  return (
    <div>
      <img src={course.img} alt={course.name} />
      <h2>{course.name}</h2>
      <p>Price: ₹{course.price}</p>
      <p>{course.description}</p>
      <p>Duration: {course.duration}</p>
      <p>Instructor: {course.instructor.username}</p>

     <p>Category: {course.rating}</p>

    {course.Role === 'pur' && <a href={`/course/content/${courseId}`} className='text-white bg-black rad-12px'>See content</a>}
    {course.Role === '!pur' && <a href={`/course/purchase/${courseId}`} className='text-white bg-black rad-12px'>Enroll now</a>}
    {course.Role === 'owns' && <a href={`/course/update/${courseId}`} className='text-white bg-black rad-12px'>Update</a>}
   <br/>
   <br/>
   <h2>Reviews</h2>
   {review.map((item:rev) => (
    <div key={item._id}>
      <img src={item.user.img} alt={item.user.username} />
      <p>{item.user.username}</p>

      <p>{item.review}</p>
      <p>Rating: {item.rating}</p>
    </div>
   ))}


   <br/>
   {course.Role === 'pur' &&( <div><Review courseId={courseId}/></div>)}

    </div>
    
  );
}


 function Review(props :{courseId:string}){

 const [review,setReview] = useState<string>('');
 const [rating,setRating] = useState<number>(0);


  return(
    <>
    <h2>Review</h2>
    <br/>
    <input value={rating} onChange={(e) => setRating(Number(e.target.value))} type='number' placeholder='Rating'/>
    <input value={review} onChange={(e) => setReview(e.target.value)} type='text' placeholder='Write a review'/>
    
    <br/>
    <button onClick={async () => {
      const res= await axios.post(`${Base_URL}/api/course/postreview/${props.courseId}`,{ review,rating, }
        ,{headers: { "Authorization": `Bearer ${localStorage.getItem("token")}`, }
      })
      if(res.status===200){
        alert('Review posted successfully');
      }
    }} className='text-white cursor-pointer bg-black rad-12px'>Submit</button>
    </>
  )
}