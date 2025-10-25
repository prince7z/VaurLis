
import React from "react";
import { useState } from "react";
import { useRecoilValueLoadable } from "recoil";
import { useNavigate } from "react-router-dom";
import {userSelector}  from "./atoms/atoms"; 
import { AlignLeft, Icon } from "lucide-react";
import { IconButton, Button, Avatar } from "@mui/material";
import logo from "../assets/logo.svg";


export default function AppBar() {
    const user :any = useRecoilValueLoadable(userSelector);

    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);


    
    return ( 
      

        <div className="w-full fixed z-50">              

            <div className="w-[100%] h-[80px] mb-4 mt-[20px] min-h-[60px] md:p-6 bg-white top-0 text-xl  md:text-lg text-black flex justify-between items-center mx-auto shadow-sm rounded-xl">
<div className=" hidden md:block transition-opacity p-4 duration-300 " >
        <div >

            <button onClick={() => document.getElementById('sidebar')?.classList.toggle('translate-x-[-100%]')}>
                <AlignLeft />
            </button>
            <div id="sidebar" className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform translate-x-[-100%] transition-transform duration-300 ease-in-out">
                <div className="" onClick={(e) => e.stopPropagation()}>
                    <ul className="space-y-2">
                        <li className="flex justify-end">
                            <button onClick={() => document.getElementById('sidebar')?.classList.toggle('translate-x-[-100%]')} 
                                    className="p-2 hover:bg-gray-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                        <img src={logo} alt="logo" className=" "/>


                        <li  onClick={() => {
                                    navigate("/")
                                }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Home</li>
                        <li  onClick={() => {
                                    navigate("/courses")
                                }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Courses</li>
                        <li  onClick={() => {
                                    navigate("/purchasedcourses")
                                }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Purchased </li>
                        <li  onClick={() => {
                                    navigate("/addcourse")
                                }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Add Course</li>        
                        <li  onClick={() => {
                                    navigate("/releasedcourses")
                                }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Released </li>
                               
                        <li  onClick={() => {
                                    navigate("/settings")
                                }} className="hover:bg-gray-100 p-2 rounded cursor-pointer">Settings</li>
                    </ul>
                </div>
            </div>
            
           
        </div>
        </div>

        <div>
        <img src={logo}  onClick={() => {
                                    navigate("/")
                                }} alt="logo" className=" pt-4 cursor-pointer w-30"/>



        </div>
           
           <div>
         {user.state === "hasValue" && user.contents?.username !== "guest" ? (
                <div>
                                       <Avatar src={user.contents.img} className="inline-block mr-2 cursor-pointer border-2 border-gray-500" onClick={() => setDropdownOpen(!dropdownOpen)} alt="User" />
                                                    {/* User dropdown menu */}
                                                    <div className="relative">
                                                        {/* State to control dropdown visibility */}
                                                        {dropdownOpen && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                                                <button
                                                                    onClick={() => {
                                                                        navigate(`/${user.contents.username}`);
                                                                        setDropdownOpen(false);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Profile
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        navigate('/settings');
                                                                        setDropdownOpen(false);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Settings
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        localStorage.removeItem("token");
                                                                        navigate("/signin");
                                                                        setDropdownOpen(false);
                                                                        window.location.reload();
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    Sign out
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                </div>
            ) : user.state === "loading" ? (
                <div>Loading...</div>
            ) : user.state === "hasError" || user.contents?.username === "guest" ? (
                <div className=" text-lg bg-black text-white px-2 mx-4 rounded-full">




                    <button  onClick={() => {
                                    navigate("/signin")
                                }}>GetStarted</button>
                    
                </div>
            ) : null}


           </div>
            </div>
            
            <div className="md:hidden flex fixed bottom-10 w-full justify-center transition-opacity duration-300 ">

                <div className="bg-white shadow-lg rounded-sm px-4 py-2 flex gap-8">
                    <li 
                    onClick={() => {
                                    navigate("/")
                                }}
                    className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Home
                    </li>
                    <li 
                    onClick={() => {
                                    navigate("/courses")
                                }}
                    className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        Courses
                    </li>
                    <li 
                    onClick={() => {
                                    navigate("/purchasedcourses")
                                }}
                    className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        My Courses
                    </li>
                </div>
            </div>
            
        </div>
       
    );
}
