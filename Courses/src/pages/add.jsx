import { useState } from 'react'
import Button from '@mui/material/Button'; 
import TextField from '@mui/material/TextField'; 
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Typography } from '@mui/material';


/*
<Button
                onClick={() => {
                    fetch("http://localhost:3000/add", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            title,
                            description
                        })
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log(data);
                    })
                }}
*/
function Add(){
    const [title,setTitle] = useState("")
    const [description,setDescription] = useState("")
    const [image,setImage] = useState("")
    return(
        <>
        <center>
        <Card variant="outlined"style={{width:400}} >

        <TextField style={{marginTop:50}} value={title} onChange={(e) => setTitle(e.target.value)} label="Title" variant="standard" />
    <br/>
        <TextField  value={description} onChange={(e) => setDescription(e.target.value)}label="Descripton" variant="standard" />
        <TextField  value={image} onChange={(e) => setImage(e.target.value)}label="Image link" variant="standard" />


    <br/>   
    <br/>
        <Button onClick={async () => {
            try {
                const token = localStorage.getItem('token'); // Get token from localStorage
                const response = await fetch("http://localhost:3000/admin/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`  // Add token to headers
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        image
                        
                    })
                });
                const data = await response.json();
                console.log(data);
            } catch (error) {
                console.error("Error:", error);
            }
         }}
         style={{marginBottom:20}} 
         variant="contained">Add</Button>

</Card>
</center>
        </>
    )
    

}
export default Add;