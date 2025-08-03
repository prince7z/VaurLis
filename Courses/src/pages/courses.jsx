import { useEffect, useState } from "react"
import React from "react"
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom"

function Courses() {
    const [courses,setcourses] = useState([])
 useEffect( ()=>{
    fetch("http://localhost:3000/admin/courses",
        
       { headers:{
            "Content-Type":"application/json",
            "Authorization": `Bearer ${localStorage.token}`
            // "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
    }
    ).then((res)=>res.json())
    .then((data)=>{
        console.log(data)
        setcourses(data.courses)
    })
 },[])
    return (
        <>
        <Typography variant={"h3"}>welcome to Bitron,Courses are here </Typography>
        
        <div style={{
            flexWrap:"wrap",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
        }}>
            {
            courses.map((course) => {
                return <Course key={course.id} course={course} />
            })}
        </div>
       </>
    )
        
    }
  
    function Course(props) {
        return (
            <div>
    <Card style={{
        width:300,
        height:450,
        minheight:400,
        margin:15,

    }} >
        <Typography variant="h5" style={{fontFamily :" bold " }} >{props.course.title}</Typography>
        <img src={props.course.image} ></img>
        <Typography variant="h6" >{props.course.description}</Typography>
        
    </Card>           
               
        </div>
        )

            
    }
export default Courses