import { useHref, useParams } from "react-router-dom";
import { useRecoilValueLoadable } from "recoil";
import { CourseState } from "../Component/atoms/atoms";
import axios from 'axios';
const BaseUrl = 'http://localhost:5000';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

export default function PurchaseCourse() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<ToastProps>({ message: '', type: 'success', isVisible: false });

  const { id: courseIdParam } = useParams<{ id: string }>();
  const courseId = courseIdParam || '';
  const courseLoadable = useRecoilValueLoadable(CourseState(courseId));
  const course = courseLoadable.state === "hasValue" ? courseLoadable.contents : null;

  if (!courseId) return <div className="min-h-screen flex items-center justify-center">
    <p className="text-red-500 text-xl">Course ID is missing</p>
  </div>;
  
  if (courseLoadable.state === "loading" ) return <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>;
  
  if (courseLoadable.state === "hasError" ) return <div className="min-h-screen flex items-center justify-center">
    <p className="text-red-500 text-xl">Error loading course</p>
  </div>;

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
  };

  async function purchaseCourse(id: string) {
    try {
      const res = await axios.get(`${BaseUrl}/api/course/purchase/${id}`, {
        headers: {
          "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
        }
      });
      console.log(res);
      showToast('Purchase successful!', 'success');
      setTimeout(() => {
        navigate('/course/' + id);
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          showToast('Course already purchased', 'error');
        } else {
          showToast(`Error: ${error.response.data?.message || 'Something went wrong'}`, 'error');
        }
      } else {
        showToast('Network error', 'error');
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Checkout</h1>
        </div>
        
        <div className="p-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
            <p className="mt-2 text-gray-600">{course.description}</p>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="text-gray-600">Course Price</span>
              <span className="text-2xl font-bold text-gray-800">
                {course.price === 0 ? 'FREE' : `$${course.price}`}
              </span>
            </div>

            <div className="mt-8 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => purchaseCourse(courseId)}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${
                  course.price === 0 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {course.price === 0 ? 'Enroll Now' : 'Purchase Now'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {toast.isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
