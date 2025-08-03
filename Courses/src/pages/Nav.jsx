import { Typography } from "@mui/material"
import Button from '@mui/material/Button'; 
import { useEffect } from "react";
import { useState } from "react";
import {useNavigate } from 'react-router-dom'; 
function Nav(){
     const navigate = useNavigate();
     const  [email,setEmail]=useState(null)
      
    useEffect(()=>{
        if (localStorage.token !== "null") {
        fetch("http://localhost:3000/admin/me",{
            headers:{
                "Authorization":`Bearer ${localStorage.getItem("token")}`
            }}).then((res)=>res.json().then((data)=>{
                
                console.log(data),
                setEmail(data.username);
            }))}
        },[])
        
        
        if (email){
            return(
        
                <div style={{
                    display:"flex",
                    justifyContent:"space-between",
                    padding:"15px",
                    backgroundColor:"navy",
                    color:"white",
                    
                }} >
                  
                    <div >
                <Typography variant="h5">Bitron</Typography>
                     </div>
        
                     <div >
                <Typography variant="h6">{email}</Typography>
                <Button 
                variant={"text"}
                onClick={() => {
                    localStorage.setItem("token", null);
                    navigate("/");
                }}>Logout</Button>
                                     
                     </div>
                     
                </div>
                )
            
        }
         
        

     return(
        
        <div style={{
            display:"flex",
            justifyContent:"space-between",
            padding:"15px",
            backgroundColor:"navy",
            color:"white",
            
        }} >
          
            <div >
        <Typography variant="h5">Bitron</Typography>
             </div>

             <div >
        <Button 
        variant={"text"}
        onClick={() => navigate("/signin")
          }>sign in</Button>
             

             
        <Button
         onClick={() => navigate("/signup")}
         variant="text">sign up</Button>
             </div>
             
        </div>
        )
    
}
export default Nav