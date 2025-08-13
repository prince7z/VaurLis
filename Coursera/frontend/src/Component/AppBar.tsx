
import React from "react";
import { useRecoilValueLoadable } from "recoil";
import { useNavigate } from "react-router-dom";
import {userSelector}  from "./atoms/atoms"; 


export default function AppBar() {
    const user = useRecoilValueLoadable(userSelector);
    const navigate = useNavigate();
    
    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#f0f0f0" }}>
        <div>
        Coursera
        </div>
           
           <div>
         {user.state === "hasValue" ? (
                <div>
                   <button  onClick={() => {
                                    navigate("/signup")
                                }} >Profile</button>
                </div>
            ) : user.state === "loading" ? (
                <div>Loading...</div>
            ) : user.state === "hasError" ? (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <button  onClick={() => {
                                    navigate("/signin")
                                }}>Login</button>
                    <button  onClick={() => {
                                    navigate("/signup")
                                }}>SignUp</button>
                </div>
            ) : null}


           </div>
            </div>
        </>
    );
}