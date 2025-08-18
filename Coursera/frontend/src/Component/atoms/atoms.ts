import axios from 'axios';
import { atom, atomFamily, selector, selectorFamily } from 'recoil';

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
    console.log("User data fetched:", response.data);
    localStorage.setItem("user", JSON.stringify(response.data._id));

    return response.data;
  },
});



export const userState = atom({
  key: 'userState',
  default: {    
    email: ''
      },
});

// export const CoursesState = selector({
//   key: 'CoursesState',
//   get: async ({get}) => {
//     const response = await axios.get(`${Base_URL}/api/course/${filter}`, {
      
//     });
//    // await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate network delay

//     return response.data;
//   },
// });
export const CoursesState = selectorFamily({
  key: "CoursesState",
  get: (type) => async () => {
    let endpoint = "/api/course/allcourses"; // default all


    if (type === "purchased") {
      endpoint = "/api/course/purchased";
    } else if (type === "released") {
      endpoint = "/api/course/released";
    }
    console.log(endpoint)
    const response = await axios.get(`${Base_URL}${endpoint}`,{
      headers: {
        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
      }
    });
    return response.data;
  },
});

export const CourseState = atomFamily({
  key: 'CourseState',
  default: (courseId:string) => selector({
    key: `CourseState/${courseId}`,
    get: async ({get}) => {
      const response = await axios.get(`${Base_URL}/api/course/${courseId}`, {
        headers: {
          "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
        }

        
      });
     // console.log("Course data fetched:", response.data);

      return response.data;
    },
  }),
})

export const CourseReview = atomFamily({
  key: 'CourseReview',
  default: (courseId:string) => selector({
    key: `CourseReview/${courseId}`,
    get: async ({get}) => {
      const response = await axios.get(`${Base_URL}/api/course/getreview/${courseId}`, {
        headers: {
          "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
        }

        
      })
      
      return response.data.reviews;

      ;}})})
     // console.log("Course data fetched:", response.data);

      
