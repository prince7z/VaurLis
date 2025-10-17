import express, { Router, Request, Response } from "express";
import Razorpay from "razorpay";
import { User, Course, Certificate } from "../DB/MDB";
import { auth } from "../Midware/Mware";
import crypto from "crypto";

const router: Router = express.Router();

const razorpay_key_id = process.env.RAZORPAY_KEY_ID || "";
const razorpay_secret_key = process.env.RAZORPAY_SECRET_KEY || "";

const razorpay = new Razorpay({
  key_id: razorpay_key_id,
  key_secret: razorpay_secret_key,
});

async function updateUserCourseAndMakeCert(userId: string, courseId: string) {
  try {
    const user :  any = await User.findByIdAndUpdate(userId, { $addToSet: { pur_courses: courseId } });
    const course : any = await Course.findByIdAndUpdate(courseId, { $addToSet: { act_users: userId } });

    const instructor  = await User.findById(course.instructor).select('username').exec();
    const newCert = new Certificate({
      user: { id: user._id, name: user.username },
      courseId: { id: course._id, name: course.name, instructor: instructor?.username, duration: course.duration, issuedAt: new Date() },
    });
    await newCert.save();
  } catch (error) {
    console.error("Error updating user and course:", error);
  }

}

router.get("/create-order/:courseId", auth, async (req: Request, res: Response) => {
  try {

    const { courseId } = req.params;
    const userId = req.user?._id;
    const userEmail = req.user?.email;

    const course: any = await Course.findById(courseId).select("price name act_users");
    
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (course.act_users.includes(userId)) {
      console.log("User has already purchased this course");
      return res.status(409).json({ error: "Course already purchased" });
    }

    if (course.price === 0) {
      updateUserCourseAndMakeCert(userId, courseId);
      console.log("User has enrolled in the course");
      return res.status(200).json({ alreadyEnrolled: true, message: "Course added to your account" });
    }
    const options = {
      amount: course.price * 100,
      currency: "INR",
      receipt: `${Date.now()}_${userId}`,
      notes: {
        courseId,
        courseName: course.name,
        userId,
        email: userEmail,
      },
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ key: razorpay_key_id, order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


{/* 
   const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ message: "Course not found" });}
    const user = req.user;
    const isPurchased = user.pur_courses.includes(course._id);
    if (isPurchased) {
        return res.status(400).json({ message: "Course already purchased" });
    }
    user.pur_courses.push(course._id);
    await user.save();
    course.act_users.push(user._id);
    await course.save();
    const instructor  = await User.findById(course.instructor).select('username').exec();
    const newCert = new Certificate({
      user: { id: user._id, name: user.username },
      courseId: { id: course._id, name: course.name, instructor: instructor?.username, duration: course.duration },
    });
    await newCert.save();
    res.status(200).json({ message: "Course purchased successfully", course });
    })
  */ }



router.post("/verify-payment", auth, async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
    const userId = req.user?._id;
  
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", razorpay_secret_key).update(sign.toString()).digest("hex");

    if (razorpay_signature === expectedSign) {
      try {
        await updateUserCourseAndMakeCert(userId, courseId);
        return res.status(200).json({ message: "Payment verified successfully" });
      } catch (error) {
        console.error("Error updating user/course:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

    } else {
      console.log ("Invalid signature sent!, razorpay_signature:", razorpay_signature, "expectedSign:", expectedSign," sign:", sign);
      return res.status(400).json({ error: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
