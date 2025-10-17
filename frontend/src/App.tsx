import { useState } from 'react'
import React from 'react'
import { RecoilRoot } from 'recoil'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import  AppBar  from './Component/AppBar';
import  AddCourse  from './pages/AddCourse';
import  Course  from './pages/course';
import  Courses  from './pages/Courses';
import AuthPage  from './pages/Auth';
import './index.css'
import HomePage from './pages/Home';
import CourseContent from './pages/CourseContent';
import PurchaseCourse from './pages/PurchaseCourse';
import UpdateCourse from './pages/UpdateCourse';
import PurchasedCourses from './pages/PurchasedCourse';
import ReleasedCourses from './pages/ReleasedCourse';
import Certificate from './pages/cert';
import Instructor from './pages/instructor';
import Verify from './pages/Verify';
import LiveClass from './pages/LiveClass';


import  Landing  from './pages/landing';
import Rough from './pages/Rough';
import Sender from './pages/LiveSender';
import Reciever from './pages/LiveReciever';
import Logs from './pages/Logs';

function App() {
  const authPaths = ["/signin", "/signup", "/login", "/register"];

  return (
    <>
     <RecoilRoot>
      <BrowserRouter>
       <AppBar/>
       <div className="pt-20"> 
        <Routes>
         <Route path={"/Home"} element={<HomePage />} />
        <Route path={"/courses"} element={<Courses />} />
        <Route path={"/purchasedcourses"} element={<PurchasedCourses />} />
        <Route path={"/releasedcourses"} element={<ReleasedCourses />} />        
        <Route path={"/addcourse"} element={<AddCourse />} />
        <Route path={"/course/:id"} element={<Course />} />
        <Route path={"/course/certificate/:id"} element={<Certificate />} />
        <Route path={"/course/content/:id"} element={<CourseContent />} />
        <Route path={"/course/purchase/:id"} element={<PurchaseCourse />} />
        <Route path={"/course/update/:id"} element={<UpdateCourse />} />
        <Route path={"/:username"} element={<Instructor />} />
        <Route path ={"/verify/:certId"} element ={<Verify/>} />
        <Route path ={"/rough"} element ={<Rough/>} />
        <Route path ={"/dev/logs"} element ={<Logs/>} />
        <Route path ={"/course/live/:id"} element ={<LiveClass />} />
        <Route path ={"/live/sender/:roomId"} element ={<Sender />} /> 
        <Route path ={"/live/receiver/:roomId"} element ={<Reciever />} />

       {authPaths.map((path) => (
    <Route key={path} path={path} element={<AuthPage />} />
  ))}
        <Route path={"/"} element={<Landing />} />
        </Routes>
       </div>
       </BrowserRouter>
     </RecoilRoot>
    </>
  )
}

export default App
