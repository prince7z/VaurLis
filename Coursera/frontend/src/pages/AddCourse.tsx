import React, { useState } from "react";
import axios from "axios";
import { API_URL } from '../config/api';

interface ContentLink {
  name: string;
  link: string;
  thumbnail: File;
  duration: number;
}


export default function CreateCourse() {
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [contentLink, setContentLink] = useState<ContentLink[]>([
    { name: "", link: "", thumbnail: null as any, duration: 0 }
  ]);

  const [errors, setErrors] = useState({
    title: false,
    description: false,
    duration: false,
    price: false,
    
  });

  const handleCreate = async () => {
    const newErrors = {
      title: !title.trim(),
      description: !description.trim(),
      duration: !duration.trim(),
      price: !price.trim(),
      
    };

    setErrors(newErrors);

    // If any field has an error, stop here
    if (Object.values(newErrors).some(e => e)) return;
    const formdata = new FormData();
    formdata.append("title", title);
    formdata.append("description", description);
    formdata.append("duration", duration);
    formdata.append("price", price);
    contentLink.forEach((linkObj, index) => {
      formdata.append(`contentLink[${index}][name]`, linkObj.name);
      formdata.append(`contentLink[${index}][link]`, linkObj.link);
      formdata.append(`contentLink[${index}][thumbnail]`, linkObj.thumbnail);
      formdata.append(`contentLink[${index}][duration]`, linkObj.duration.toString());
    });
    if (thumbnail) {
      formdata.append("thumbnail", thumbnail);
    }
    try {
      await axios.post(`${API_URL}/api/cloud/upload`, formdata,  {
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

      <h1 className="text-2xl font-bold mb-4">Add New Course</h1>

      {/* dropbox and image picker to upload thumbnail */}
      <div className="border-dashed border-2 border-gray-300 p-4 mb-4">
        {thumbnail ? (
          <img
            src={URL.createObjectURL(thumbnail)}
            alt="Thumbnail"
            className="w-full h-auto"
          />
        ) : (
          <p>Drag and drop an image file here, or click to select one</p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              setThumbnail(e.target.files[0]);
            }
          }}
          className="hidden"
          id="thumbnail-upload"
        />
        <label
          htmlFor="thumbnail-upload"
          className="cursor-pointer text-blue-500"
        >
          Upload Thumbnail
        </label>
      </div>

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
        placeholder="Course Duration in hours"
        className={`p-2 border ${errors.duration ? "border-red-500" : "border-gray-300"}`}
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="text"
        placeholder="Course Price in INR"
        className={`p-2 border ${errors.price ? "border-red-500" : "border-gray-300"}`}
      />

      <h1 className="text-xl font-semibold mt-4 mb-2">Course Content Links</h1>
      {contentLink.map((linkObj, index) => (
        <div key={index} className="border border-gray-300 p-4 mb-4 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Content Item {index + 1}</h3>
            <button
              onClick={() => {
                const newLinks = contentLink.filter((_, i) => i !== index);
                setContentLink(newLinks);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
            >
              Remove
            </button>
          </div>
          
          {/* Content Title */}
          <input
            value={linkObj.name}
            onChange={(e) => {
              const newLinks = [...contentLink];
              newLinks[index] = { ...newLinks[index], name: e.target.value };
              setContentLink(newLinks);
            }}
            type="text"
            placeholder="Content Title (e.g., Introduction to React)"
            className="border p-2 w-full mb-2 border-gray-300 rounded"
          />
          
          {/* Content Link (YouTube) */}
          <input
            value={linkObj.link}
            onChange={(e) => {
              const newLinks = [...contentLink];
              newLinks[index] = { ...newLinks[index], link: e.target.value };
              setContentLink(newLinks);
            }}
            type="text"
            placeholder="YouTube Link (e.g., https://www.youtube.com/watch?v=...)"
            className="border p-2 w-full mb-2 border-gray-300 rounded"
          />
          
          {/* Duration */}
          <input
            value={linkObj.duration || ""}
            onChange={(e) => {
              const newLinks = [...contentLink];
              newLinks[index] = { ...newLinks[index], duration: Number(e.target.value) || 0 };
              setContentLink(newLinks);
            }}
            type="number"
            placeholder="Duration in minutes"
            className="border p-2 w-full mb-2 border-gray-300 rounded"
          />
          
          {/* Thumbnail Upload for Content */}
          <div className="border-dashed border-2 border-gray-300 p-4 rounded">
            {linkObj.thumbnail ? (
              <div className="relative">
                <img
                  src={URL.createObjectURL(linkObj.thumbnail)}
                  alt="Content Thumbnail"
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  onClick={() => {
                    const newLinks = [...contentLink];
                    newLinks[index] = { ...newLinks[index], thumbnail: null as any };
                    setContentLink(newLinks);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Upload thumbnail for this content</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const newLinks = [...contentLink];
                  newLinks[index] = { ...newLinks[index], thumbnail: e.target.files[0] };
                  setContentLink(newLinks);
                }
              }}
              className="hidden"
              id={`content-thumbnail-${index}`}
            />
            <label
              htmlFor={`content-thumbnail-${index}`}
              className="cursor-pointer text-blue-500 hover:text-blue-600 text-sm inline-block mt-2"
            >
              📁 Choose Thumbnail
            </label>
          </div>
        </div>
      ))}
      <button
        onClick={() => setContentLink([...contentLink, { name: "", link: "", thumbnail: null as any, duration: 0 }])}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        + Add Content Item
      </button>

      <div
        className="text-white bg-black cursor-pointer hover:bg-gray-800 p-4 rounded-md text-center"
        onClick={handleCreate}
      >
        Create
      </div>
    </div>
  );
}
