import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, Button, TextField, Typography } from'@mui/material'




// Main Course component
function Course() {
    const [course, setCourse] = useState([]);
    let { courseId } = useParams();
    console.log(courseId); // Log the course ID for verificatio
     // Replace with the actual course ID you want to fetch inf

    useEffect(() => {
        fetch(`http://localhost:3000/admin/courses/${courseId}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.token}`
            }
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            setCourse(data.course);
        });
    }, [courseId]);

    return (
        <>
        <h3>HEre is course</h3> 
            <CourseDetail course={course} />
            <Update setCourse={setCourse} />
        </>
    );
}
function CourseDetail(props) {
    const { title, description, image } = props.course;
    return (
        <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
            <img className="w-full h-48 object-cover" src={image} alt={title} />
            <div className="p-4">
                <h2 className="text-xl font-bold mb-2 text-gray-800">{title}</h2>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>
        </div>
    );
}
function Update(props){
    const [title,setTitle] = useState("")
    const [description,setDescription] = useState("")
    const [image,setImage] = useState("")
    let { courseId } = useParams();
   // Log the course ID for verification

    return(
        <center>
        <Card variant="outlined"style={{width:400}} >
            <Typography variant="h5" style={{marginTop:20}}>Update Course</Typography>

        <TextField style={{marginTop:50}} value={title} onChange={(e) => setTitle(e.target.value)} label="Title" variant="standard" />
    <br/>
        <TextField  value={description} onChange={(e) => setDescription(e.target.value)}label="Descripton" variant="standard" />
        <TextField  value={image} onChange={(e) => setImage(e.target.value)}label="Image link" variant="standard" />


    <br/>   
    <br/>
        <Button onClick={async () => {
             console.log("will update "+ courseId); 
            // Log the course ID for verification
            try {
                const token = localStorage.getItem('token'); // Get token from localStorage
                const response = await fetch(`http://localhost:3000/admin/courses/${courseId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`  // Add token to headers
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        image
                        
                    })
                }).then((res)=>res.json())
                .then((data)=>{
                    console.log(data.message)
                    props.setCourse(data.course);
                   // setcourses(data.courses)
                })
               
                //props.setCourse(data.course);

            } catch (error) {
                console.error("Error:", error);
            }
         }}
         style={{marginBottom:20}} 
         variant="contained">Update</Button>

</Card>
</center>
    )
}
export default Course;