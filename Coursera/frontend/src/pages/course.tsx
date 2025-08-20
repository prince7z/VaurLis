import { useRecoilValueLoadable,useRecoilState } from 'recoil';


import { CourseState } from '../Component/atoms/atoms';
import { useParams } from 'react-router-dom';
import  {  useState } from 'react';
import axios from 'axios';
import { CourseReview } from '../Component/atoms/atoms';
import { userState } from '../Component/atoms/atoms';




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
    timestamp:number;

}

interface rev{
    _id: string;
    user: { img: string;
    username: string;};
    review: string;
    rating: number;
    timestamp:number;
}



 
export default function Course() {
  const { id: courseIdParam } = useParams();
  const courseId = courseIdParam || '';
  const courseLoadable = useRecoilValueLoadable(CourseState(courseId));
  const course = courseLoadable.state === "hasValue" ? courseLoadable.contents : null;
  const reviewLoadable = useRecoilValueLoadable(CourseReview(courseId));
  const review  = reviewLoadable.state === "hasValue" ? reviewLoadable.contents : [];


  
  if (!courseId) return <p>Course ID is missing</p>;
if (courseLoadable.state === "loading") return <p className='flex justify-center items-center min-h-screen'>Loading detail...</p>;
  if (courseLoadable.state === "hasError" ) return <p className='flex justify-center items-center min-h-screen'>Error loading course,try loging again</p>;
  
  if (reviewLoadable.state === "hasError" ) return <p className='flex justify-center items-center min-h-screen'>Error loading review</p>;
  if (reviewLoadable.state === "loading" ) return <p className='flex justify-center items-center min-h-screen'>Loading review...</p>;

  




  return (
    <div >
    <div>
      <img src={course.img} alt={course.name} />
      <h2>{course.name}</h2>
      <p>Price: ₹{course.price}</p>
      <p>{course.description}</p>
       <p className="text-sm text-gray-500">posted on : {new Date(course.timestamp).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
      <p>Duration: {course.duration}</p>
      
      <div><p>Instructor: {course.instructor.username}</p>
      <img src={course.instructor.img} alt={course.instructor.username} />
      <p>Skills: {course.instructor.skills.join(', ')}</p>

      </div>
      



     <p>Category: {course.rating}</p>

    {course.Role === 'pur' && <a href={`/course/content/${courseId}`} className='text-white bg-black rad-12px'>See content</a>}
    {course.Role === '!pur' && <a href={`/course/purchase/${courseId}`} className='text-white bg-black rad-12px'>Enroll now</a>}
    {course.Role === 'owns' && <a href={`/course/update/${courseId}`} className='text-white bg-black rad-12px'>Update</a>}
   <br/>
   <br/>
   <h2>Reviews</h2>
   { review.length > 0 && review.map((item:rev) => (

    <div key={item._id}>
      <img src={item.user.img} alt={item.user.username} />
      <p>{item.user.username}</p>

      <p>{item.review}</p>
      <p>Rating: {item.rating}</p>
      <p>posted on : {new Date(item.timestamp).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        
      })}</p>
    </div>
   ))}


   <br/>
   {course.Role === 'pur' &&( <div><Review courseId={courseId}/></div>)}

    </div>
    </div>
    
  );
}

interface userdata{
  email: string;
  _id: string;
  username: string;
  img: string;
}

 function Review(props :{courseId:string}){

 const [review,setReview] = useState<string>('');
 const [rating,setRating] = useState<number>(0);
 const [reviewState,SetReview] = useRecoilState(CourseReview(props.courseId));
 const user = useRecoilValueLoadable(userState);
const userData: userdata = user.state === "hasValue" ? (user.contents as userdata) : { email: "", _id: "", username: "", img: "" };
 const username = userData.username;
 const img = userData.img;




 

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
        SetReview(
          [...reviewState,
          { _id: res.data._id,
          user: { img,
          username },
          review,
          rating,
          timestamp:Date.now()

          }]
        
        );

        
        
      }
      if (res.status===401){
        alert('Error posting review, login again ,token expired');
      }
    }} className='text-white cursor-pointer bg-black rad-12px'>Submit</button>
    </>
  )
}