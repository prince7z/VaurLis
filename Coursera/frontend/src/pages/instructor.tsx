import React, { useEffect, useState, type JSX } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CourseCard from "../Component/coursecard";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

const BASEURL = "http://localhost:5000";

export default function Instructor() {
    const { username } = useParams();
    const [instructorDetails, setInstructorDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rel,Setrel] = useState([]);
    const [pur,Setpur] = useState([]);
    const id = username || '';

    useEffect(() => {
        const fetchInstructorDetails = async (id: string) => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${BASEURL}/api/user/instructor/${id}`, {
                    headers: {
                        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
                    }
                });
                setInstructorDetails(response.data);
                Setrel(response.data.rel_courses);
                if (response.data.pur_courses){
                    Setpur(response.data.pur_courses);
                }
            } catch (error) {
                setError("Error fetching instructor details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInstructorDetails(id);
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                {error}
            </div>
        );
    }
    if (!instructorDetails) {
        return null;
    }

    // Social icon mapping
    const socialIcons: Record<string, JSX.Element> = {
        github: <FaGithub className="inline mr-2" />,
        linkedin: <FaLinkedin className="inline mr-2" />,
        x: <FaTwitter className="inline mr-2" />,
        mail: <FaEnvelope className="inline mr-2" />,
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-5xl mx-auto">
                {/* Main Profile Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                    {/* Banner */}
                    <div className="relative">
                        {instructorDetails.bgimg ? (
                            <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500">
                                <img src={instructorDetails.bgimg} alt="Background" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                        )}
                        
                        {/* Profile image */}
                        <div className="absolute -bottom-16 left-8">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                <img src={instructorDetails.img} alt={instructorDetails.username} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="pt-20 pb-6 px-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                            <div className="mb-4">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{instructorDetails.username}</h1>
                                <p className="text-lg text-gray-600 mb-3">Professional Instructor</p>
                                
                                {/* Social links */}
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {instructorDetails.socialLinks &&
                                        Object.entries(instructorDetails.socialLinks).map(([key, value]) => (
                                            <a
                                                key={key}
                                                href={key === "mail" ? `mailto:${String(value)}` : String(value)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                                            >
                                                {socialIcons[key.toLowerCase()] || null}
                                                <span className="capitalize text-sm">{key}</span>
                                            </a>
                                        ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Skills & Expertise</h3>
                            <div className="flex flex-wrap gap-2">
                                {instructorDetails.skills && instructorDetails.skills.length > 0 ? (
                                    instructorDetails.skills.map((skill: string, idx: number) => (
                                        <span key={idx} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No skills listed</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Courses Sections */}
                {rel.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="w-1 h-6 bg-blue-500 rounded mr-3"></span>
                                Released Courses
                            </h3>
                            <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
                                {rel.map((course: any) => (
                                    <div key={course._id} className="min-w-[280px] flex-shrink-0">
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {pur.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <span className="w-1 h-6 bg-green-500 rounded mr-3"></span>
                                Purchased Courses
                            </h3>
                            <div className="flex gap-4 overflow-x-auto pb-2" style={{scrollbarWidth: 'thin'}}>
                                {pur.map((course: any) => (
                                    <div key={course._id} className="min-w-[280px] flex-shrink-0">
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
