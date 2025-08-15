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
import CourseContent from './pages/CourseContent';
import PurchaseCourse from './pages/PurchaseCourse';
import UpdateCourse from './pages/UpdateCourse';


import  Landing  from './pages/landing';

function App() {
  const authPaths = ["/signin", "/signup", "/login", "/register"];

  return (
    <>
     <RecoilRoot>
      <BrowserRouter>
       
       <div>
       
        <AppBar/>
        <div className="container mx-auto p-4" style={{ backgroundColor: "Green" }}>
          
        <Routes>
        <Route path={"/addcourse"} element={<AddCourse />} />
        <Route path={"/courses"} element={<Courses />} />
        <Route path={"/course/:id"} element={<Course />} />
        <Route path={"/course/content/:id"} element={<CourseContent />} />
        <Route path={"/course/purchase/:id"} element={<PurchaseCourse />} />
        <Route path={"/course/update/:id"} element={<UpdateCourse />} />
        
       {authPaths.map((path) => (
    <Route key={path} path={path} element={<AuthPage />} />
  ))}
        <Route path={"/"} element={<Landing />} />
        </Routes>
       </div>
              </div>

       </BrowserRouter>
     </RecoilRoot>
      <footer className="bg-gray-800 text-white text-center py-4 bottom-0 w-full sticky">
          <p>© 2023 Coursera Clone. All rights reserved.</p>
        </footer>
    </>
  )
}



export default App
