import { useState } from 'react'
import './App.css'
import Signup from './pages/signup'
import Nav from './pages/Nav'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signin from './pages/signin'
import Add from './pages/add'
import Courses from './pages/courses'
import Course from './pages/course'

function App() {

  return (
    <>
    <div style={{
      width: "100%",
      minHeight: "100vh",
      height: "100%",
      backgroundColor: "lightblue"
      }}>
        
        <BrowserRouter>
        <Nav></Nav>
        <Routes>
          <Route path = "/admin/courses/:courseId" element={<Course/>}> </Route>
          <Route path = "/admin/courses" element={<Courses/>}> </Route>
          <Route path ="/add" element={<Add/>}> </Route>
          <Route path = "/signin" element={<Signin/>}> </Route>
          <Route path = "/signup" element={<Signup/>}> </Route>
        </Routes>
        </BrowserRouter>
      
    
    </div>
    </>
  )
}

export default App
