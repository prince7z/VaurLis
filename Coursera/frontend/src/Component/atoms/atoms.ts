import axios from 'axios';
import { atom, atomFamily, selector } from 'recoil';
//import dotenv from 'dotenv';
//dotenv.config();
const  Base_URL  = "http://localhost:5000"; 
if (!Base_URL) {
  throw new Error('Base_URL is not defined in the environment variables');
    }


export const userSelector = selector({
  key: 'userSelector',
  get: async ({get}) => {
    const response = await axios.get(`${Base_URL}/api/user/me`, {
      headers: {
        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
      }
    });
    
    return response.data;
  },
});



export const userState = atom({
  key: 'userState',
  default: {    
    email: ''
      },
});

export const CoursesState = selector({
  key: 'CoursesState',
  get: async ({get}) => {
    const response = await axios.get(`${Base_URL}/api/course/allcourses`, {
      
    });
   // await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate network delay

    return response.data;
  },
});

export const CourseState = atomFamily({
  key: 'CourseState',
  default: (courseId:string) => selector({
    key: `CourseState/${courseId}`,
    get: async ({get}) => {
      const response = await axios.get(`${Base_URL}/api/course/${courseId}`, {
        
      });
      
      return response.data;
    },
  }),
})

// export const InstState = selector({
// key: 'InstState',
// get: async ({get}) => {
//   const course = get(CourseState); // Assuming you want to get the instructor of a specific course
//   if (!course || !course.instructor) {
//     return null; // Handle case where course or instructor is not available
//   }
  
//   const response = await axios.get(`${Base_URL}/api/inst/${course.instructor}`, {
    
//   });
  
//   return response.data;

// }
// });
