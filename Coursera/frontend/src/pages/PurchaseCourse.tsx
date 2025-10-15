import { useParams } from "react-router-dom";
import { useRecoilValueLoadable } from "recoil";
import { CourseState } from "../Component/atoms/atoms";
import axios from 'axios';
import { API_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}


const loadscript = (src: string) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src=src;
    script.onload = () => {
      resolve(true);
    }
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };
    document.body.appendChild(script);
  });
};

const handlePayment = async (courseId: string, navigate: any, showToast: any) => {

  const res = await loadscript('https://checkout.razorpay.com/v1/checkout.js');

  if (!res) {
    alert("Razorpay SDK failed to load. check your internet connection");
    return; 
  }
  try {
    // 1️⃣ Create order on backend
    const res = await axios.get(`${API_URL}/api/secure/create-order/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // if using auth
      },
    });

    // Check if user is already enrolled (free course)
    if (res.data.alreadyEnrolled) {
      showToast("You are enrolled in the course.", 'success');
      setTimeout(() => window.location.href = `/course/${courseId}`, 1500);
      return;
    }
    
    const { key, order } = res.data;

    // 2️⃣ Open Razorpay checkout
    const options = {
      key: key,
      amount: order.amount,
      currency: order.currency,
      name: "VaurLis",
      description: order.notes.courseName,
      order_id: order.id,
      handler: async function (response:any) {
        const res = await axios.post(`${API_URL}/api/secure/verify-payment`, {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          courseId: courseId,
          
          
        },{
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, // if using auth
          }
        });
        console.log("Payment verification response:", res);
        if (res.status === 200 ) {
          showToast("Payment successful! You are now enrolled in the course.", 'success');
          setTimeout(() => {
            window.location.href = `/course/${courseId}`;
          }, 1500);
        } else {
          showToast("Payment verification failed. Please contact support.", 'error');
        }
      },
      prefill: {
        email: order.notes.email,
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err: any) {
    console.error(err);
    
    // Handle specific error cases
    if (err.response?.status === 409) {
      showToast("You have already purchased this course.", 'error');
      setTimeout(() => {
            window.location.href = `/course/${courseId}`;
          }, 1500);
    } else if (err.response?.status === 404) {
      showToast("Course not found.", 'error');
    } else if (err.response?.status === 401) {
      showToast("Please login to purchase this course.", 'error');
    } else {
      showToast(err.response?.data?.error || "Something went wrong during payment!", 'error');
    }
  }
};


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
      await handlePayment(id, navigate, showToast);
    } catch (error: any) {
      console.error("Purchase failed:", error);
      showToast(error?.response?.data?.error || "Purchase failed. Please try again.", 'error');
      return;
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
