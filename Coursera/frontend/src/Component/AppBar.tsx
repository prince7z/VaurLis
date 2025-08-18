
import React from "react";
import { useRecoilValueLoadable } from "recoil";
import { useNavigate } from "react-router-dom";
import {userSelector}  from "./atoms/atoms"; 
import { AlignLeft } from "lucide-react";
import logo from "/VS/coursera/Coursera/Coursera/frontend/src/assets/logo.svg";;




export default function AppBar() {
    const user = useRecoilValueLoadable(userSelector);
    const navigate = useNavigate();
    
    return ( 
      

        <div className="w-full fixed z-50">              

            <div className="w-[90%] h-[80px] mb-4 mt-[20px] min-h-[60px] md:p-6 bg-white top-0 text-xl md:text-lg text-black flex justify-between items-center mx-auto shadow-lg rounded-full">
<div className="md:hidden">
        <div className=" transition-opacity duration-300 ">

            <button onClick={() => document.getElementById('sidebar')?.classList.toggle('translate-x-[-100%]')}>
                <AlignLeft className="transition-opacity duration-300  mx-4 w-6"/>
            </button>
            <div id="sidebar" className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform translate-x-[-100%] transition-transform duration-300 ease-in-out">
                <div className="p-4" onClick={(e) => e.stopPropagation()}>
                    <ul className="space-y-2">
                        <li className="flex justify-end">
                            <button onClick={() => document.getElementById('sidebar')?.classList.toggle('translate-x-[-100%]')} 
                                    className="p-2 hover:bg-gray-100 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </li>
                        <img src={logo} alt="logo" className=""/>

                        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">Home</li>
                        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">Courses</li>
                        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">Purchased </li>
                        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">Released </li>

                        <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">Settings</li>
                    </ul>
                </div>
            </div>
            
           
        </div>
        </div>

        <div>
        <img src={logo}  onClick={() => {
                                    navigate("/Landing")
                                }} alt="logo" className=" pt-4 cursor-pointer w-30"/>



        </div>
           
           <div>
         {user.state === "hasValue" ? (
                <div>
                   <button  onClick={() => {
                                    navigate("/courses")
                                }} >Profile</button>
                </div>
            ) : user.state === "loading" ? (
                <div>Loading...</div>
            ) : user.state === "hasError" ? (
                <div className=" text-lg bg-black text-white px-2 mx-4 rounded-full">




                    <button  onClick={() => {
                                    navigate("/signin")
                                }}>GetStarted</button>
                    
                </div>
            ) : null}


           </div>
            </div>
            
            <div className="md:hidden flex fixed bottom-10 w-full justify-center transition-opacity duration-300 ">

                <div className="bg-white shadow-lg rounded-full px-8 py-4 flex gap-8">
                    <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        Home
                    </li>
                    <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        Courses
                    </li>
                    <li className="hover:bg-gray-100 p-2 rounded cursor-pointer flex items-center gap-2">
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
// export default function AppBar() {

//     return(
//     <div className="navbar bg-base-100 shadow-sm">
//   <div className="navbar-start">
//     <div className="dropdown">
//       <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
//       </div>
//       <ul
//         tabIndex={0}
//         className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
//         <li><a>Homepage</a></li>
//         <li><a>Portfolio</a></li>
//         <li><a>About</a></li>
//       </ul>
//     </div>
//   </div>
//   <div className="navbar-center">
//     <a className="btn btn-ghost text-xl">daisyUI</a>
//   </div>
//   <div className="navbar-end">
//     <button className="btn btn-ghost btn-circle">
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> </svg>
//     </button>
//     <button className="btn btn-ghost btn-circle">
//       <div className="indicator">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> </svg>
//         <span className="badge badge-xs badge-primary indicator-item"></span>
//       </div>
//     </button>
//   </div>
// </div>
//     )
// }
