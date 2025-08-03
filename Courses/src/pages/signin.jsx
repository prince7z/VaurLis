import { useState } from 'react'
import Button from '@mui/material/Button'; 
import TextField from '@mui/material/TextField'; 
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';
function Signup() {
  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")

  return (
    <>
    <center>
           <div style={{padding:100}}>
                     
            <Typography variant={"h6"}>welcome to Bitron,signin here </Typography></div> 
           

        <Card variant="outlined"style={{width:400}} >

             <TextField style={{marginTop:50}} value={username} onChange={(e)=>setUsername(e.target.value) } label="Username" variant="standard" />
  <br/>
             <TextField  value={password} onChange={(e)=>setPassword(e.target.value) } label="Password" variant="standard" />
  

    <br/>
    <br/>
            <Button style={{marginBottom:20}}
            onClick={()=>{
              fetch("http://localhost:3000/admin/login",{
                  method:"POST",
                  headers:{
                      "Content-Type":"application/json"
                  },
              body:JSON.stringify({
                  username,
                  password
              })
              }).then((res)=>res.json().then((data)=>{
                localStorage.setItem('token', data.token);
               console.log("Token saved:", localStorage.getItem('token'));

               if (localStorage.token!=null && localStorage.token!=undefined) {
                window.location.href = "/add";
              }
              }))
            }
           } variant="contained">Sign in</Button>
        
        </Card>
                
      
      </center>
      </>
  )
}

export default Signup
