import { useEffect,useState } from "react";
import axios from "axios";

import { API_URL } from "../config/api";

interface Instructor {
  id: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

export default function Instructorlist() {

const [instructors, setInstructors] = useState<Instructor[]>([]);

useEffect(() => {
  const fetchInstructors = async () => {
    try { 
        const res= await axios.get(`${API_URL}/api/course/instructorlist`);
        res.data && setInstructors(res.data.instructors);
        console.log(res)
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
  };

  fetchInstructors();
}, []);


  return (
    <div>
      <h1>Instructor List</h1>
      {instructors.length > 0 ? (
        <div>
          {instructors.map((instructor, index) => (
            <div key={index}>
              <h3>{instructor.username}</h3>
              <img src={instructor.avatarUrl} alt={instructor.username} />
            </div>
          ))}
        </div>
      ) : (
        <p>No instructors found</p>
      )}
    </div>
  )
}