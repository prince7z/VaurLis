import React, { useState } from "react";
import axios from "axios";

export default function CreateCourse() {
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
    contentLink: false
  });

  const Base_URL = "http://localhost:5000";

  const handleCreate = async () => {
    const newErrors = {
      title: !title.trim(),
      description: !description.trim(),
      duration: !duration.trim(),
      price: !price.trim(),
      contentLink: !contentLink.trim()
    };

    setErrors(newErrors);

    // If any field has an error, stop here
    if (Object.values(newErrors).some(e => e)) return;

    try {
      await axios.post(`${Base_URL}/api/course/upload`, {
        name: title,
        description,
        duration,
        price: parseFloat(price),
        links: [contentLink],
      }, {
        headers: { Authorization: "Bearer " + (localStorage.getItem("token") ?? "") }
      });

      alert("Course created successfully!");
    } catch (err: any) {
        if(err.response.status===400){
            alert(err.response.data.error);
        }
     else console.error("Error creating course:", err);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        placeholder="Course Title"
        className={`p-2 border ${errors.title ? "border-red-500" : "border-gray-300"}`}
      />
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        type="text"
        placeholder="Course Description"
        className={`p-2 border ${errors.description ? "border-red-500" : "border-gray-300"}`}
      />
      <input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        type="text"
        placeholder="Course Duration"
        className={`p-2 border ${errors.duration ? "border-red-500" : "border-gray-300"}`}
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="text"
        placeholder="Course Price"
        className={`p-2 border ${errors.price ? "border-red-500" : "border-gray-300"}`}
      />
      <input
        value={contentLink}
        onChange={(e) => setContentLink(e.target.value)}
        type="text"
        placeholder="Course content link"
        className={`p-2 border ${errors.contentLink ? "border-red-500" : "border-gray-300"}`}
      />

      <div
        className="text-white bg-black cursor-pointer hover:bg-gray-800 p-4 rounded-md text-center"
        onClick={handleCreate}
      >
        Create
      </div>
    </div>
  );
}
