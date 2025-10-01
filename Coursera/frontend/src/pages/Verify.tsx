import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
const Base_url =  'http://localhost:5000';
interface VerificationData {
  user: {
    id: {
      _id: string;
      username: string;
      img: string;
    };
    name: string;
  };
  courseId: {
    id: string;
    name: string;
    instructor: string;
    duration: string;
  };
  _id: string;
  issuedAt: string;
  __v: number;
}

export default function Verify() {
    const { certId } = useParams();
    const [data, setData] = useState<VerificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const detail = async () => {
            try {
                const response = await axios.get(`${Base_url}/api/user/verify/${certId}`);
                setData(response.data);
                console.log(response.data);
            } catch (err) {
                setError('Certificate not found or invalid');
            } finally {
                setLoading(false);
            }
        };
        detail();
    }, [certId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verifying certificate...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Certificate</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Verified</h1>
                    <p className="text-gray-600">This certificate is authentic and verified</p>
                </div>

                {/* Certificate Card */}
                <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
                    {/* Certificate Header */}
                    <div className="text-center border-b border-gray-200 pb-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Completion</h2>
                        <div className="text-sm text-gray-500">Certificate ID: {data._id}</div>
                    </div>

                    {/* Student Info */}
                    <div className="flex items-center justify-center mb-8">
                        <li className="text-center">
                            <a href={`/${data.user.id.username}`}>
                            <img 
                                src={data.user.id.img} 
                                alt={data.user.name}
                                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-blue-100"
                            />
                            <h3 className="text-xl font-semibold text-gray-900">{data.user.name}</h3>
                            <p className="text-gray-600">@{data.user.id.username}</p>
                            </a>
                        </li>
                    </div>

                    {/* Course Details */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Course Title</label>
                                <a href={`/course/${data.courseId.id}`} className="text-gray-900 font-medium">{data.courseId.name}</a>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Instructor</label>
                                <a href={`/${data.courseId.instructor}`} className="text-gray-900 font-medium">{data.courseId.instructor}</a>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                                <p className="text-gray-900 font-medium">{data.courseId.duration}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Issue Date</label>
                                <p className="text-gray-900 font-medium">{formatDate(data.issuedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Verified & Authentic
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            This certificate has been verified and is authentic
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-sm">
                        © 2025 VsurLis - Certificate Verification System
                    </p>
                </div>
            </div>
        </div>
    );
}