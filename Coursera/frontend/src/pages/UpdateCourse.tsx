import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRecoilValueLoadable } from "recoil";
import { CourseState } from "../Component/atoms/atoms";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

export default function UpdateCourse() {
  const { id: courseIdParam } = useParams();
  const navigate = useNavigate();
  const courseId = courseIdParam || "";
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  

  const courseLoadable = useRecoilValueLoadable(CourseState(courseId));
  const course =
    courseLoadable.state === "hasValue" ? courseLoadable.contents : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [contentLink, setContentLink] = useState("");

  const [errors, setErrors] = useState({
    title: false,
    description: false,
    duration: false,
    price: false,
    contentLink: false,
  });

  // Populate form when course loads
  useEffect(() => {
    if (course) {
      setTitle(course.name || "");
      setDescription(course.description || "");
      setDuration(course.duration || "");
      setPrice(course.price || "");
      setContentLink(course.links?.[0] || "");
    }
  }, [course]);

  async function handleUpdate() {
    // Validation
    const newErrors = {
      title: !title.trim(),
      description: !description.trim(),
      duration: !duration.trim(),
      price: !price.trim(),
      contentLink: !contentLink.trim(),
    };

    setErrors(newErrors);

    // If any error is true, stop here
    if (Object.values(newErrors).some((e) => e)) return;

    try {
      await axios.put(
        `${BASE_URL}/api/course/update/${courseId}`,
        {
          name: title,
          description,
          duration,
          price: parseFloat(price),
          links: [contentLink],
        },
        {
          headers: {
            Authorization: "Bearer " + (localStorage.getItem("token") ?? ""),
          },
        }
      );

      alert("Course updated successfully!");
      navigate(`/course/${courseId}`);
    } catch (err) {
      console.error("Error updating course:", err);
      alert("Failed to update course");
    }
  }

  if (courseLoadable.state === "loading") return <p>Loading...</p>;
  if (courseLoadable.state === "hasError") return <p>Error loading course</p>;

if (currentUser !== course.instructor) {
  return <p>You are not authorized to update this course</p>;
}


  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Update Course</h1>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        placeholder="Course Title"
        className={`border p-2 mb-2 w-full ${
          errors.title ? "border-red-500" : "border-gray-300"
        }`}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        type="text"
        placeholder="Course Description"
        className={`border p-2 mb-2 w-full ${
          errors.description ? "border-red-500" : "border-gray-300"
        }`}
      />
      <input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        type="text"
        placeholder="Course Duration"
        className={`border p-2 mb-2 w-full ${
          errors.duration ? "border-red-500" : "border-gray-300"
        }`}
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="text"
        placeholder="Course Price"
        className={`border p-2 mb-2 w-full ${
          errors.price ? "border-red-500" : "border-gray-300"
        }`}
      />
      <input
        value={contentLink}
        onChange={(e) => setContentLink(e.target.value)}
        type="text"
        placeholder="Course Content Link"
        className={`border p-2 mb-4 w-full ${
          errors.contentLink ? "border-red-500" : "border-gray-300"
        }`}
      />

      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Update
      </button>
    </div>
  );
}
