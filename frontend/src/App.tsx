import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import SidebarDemo from './Component/st';
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
import Transactions from './pages/Transections';
import  Landing  from './pages/landing';
import Rough from './pages/Rough';
import Sender from './pages/LiveSender';
import Reciever from './pages/LiveReciever';
import Logs from './pages/Logs';
import Instructorlist from './pages/Instructorlist';
interface pathElement {
  path: string;
  element: React.JSX.Element;
}
function App() {

const paths: pathElement[] = [
  { path: "/", element: <HomePage /> },
  { path: "/courses", element: <Courses /> },
  { path: "/purchasedcourses", element: <PurchasedCourses /> },
  { path: "/releasedcourses", element: <ReleasedCourses /> },
  { path: "/addcourse", element: <AddCourse /> },
  { path: "/course/:id", element: <Course /> },
  { path: "/course/certificate/:id", element: <Certificate /> },
  { path: "/course/content/:id", element: <CourseContent /> },
  { path: "/course/purchase/:id", element: <PurchaseCourse /> },
  { path: "/course/update/:id", element: <UpdateCourse /> },
  { path: "/:username", element: <Instructor /> },
  { path: "/verify/:certId", element: <Verify /> },
  { path: "/rough", element: <Rough /> },
  { path: "/dev/logs", element: <Logs /> },
  { path: "/course/live/:id", element: <LiveClass /> },
  { path: "/live/sender/:roomId", element: <Sender /> },
  { path: "/live/receiver/:roomId", element: <Reciever /> },
  { path: "/transactions", element: <Transactions /> },
  { path: "/instructors", element: <Instructorlist /> },
  { path: "/signin", element: <AuthPage /> },
  { path: "/signup", element: <AuthPage /> },
  { path: "/login", element: <AuthPage /> },
  { path: "/register", element: <AuthPage /> },

  // default route
  { path: "/", element: <Landing /> },
];

  return (
    <div className="w-full min-h-screen">
      <RecoilRoot>
        <BrowserRouter>
          <SidebarDemo paths={paths} />
        </BrowserRouter>
      </RecoilRoot>
    </div>
  )
}

export default App
