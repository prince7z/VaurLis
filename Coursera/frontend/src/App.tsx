import { useState } from 'react'
import React from 'react'
import { RecoilRoot } from 'recoil'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import  AppBar  from './Component/AppBar';
import  AddCourse  from './pages/AddCourse';
import  Course  from './pages/course';
import  Courses  from './pages/Courses';
import AuthPage  from './pages/Auth';


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
        <Route path={"/course/:id"} element={<Course />} />
        <Route path={"/courses"} element={<Courses />} />
       {authPaths.map((path) => (
    <Route key={path} path={path} element={<AuthPage />} />
  ))}
        <Route path={"/"} element={<Landing />} />
        </Routes>
       </div>
              </div>

       </BrowserRouter>
     </RecoilRoot>
    </>
  )
}



export default App
