import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import certTemplate from "../component/cert/0001.png";
const BASE_URL = "http://localhost:5000";


function Cert(props:{ _id :string; name:string; course:string; instructor:string; date:string}) {


    return (
        <div className="flex flex-col items-center w-full">
            <div className="mb-6 w-full max-w-2xl mx-auto bg-white/80 rounded-lg shadow p-6">
                <div className="text-xl font-semibold mb-2">{props.name}</div>
                <div className="text-lg mb-2">{props.course}</div>
                <div className="mb-2">Instructor: {props.instructor}</div>
                <div className="mb-2">Date: {props.date}</div>
                <div className="flex justify-center mt-4">
                    <QRCode value={`${BASE_URL}/verify/cert/${props._id}`} size={100} style={{ background: 'transparent', mixBlendMode: 'multiply' }} fgColor="#000000" />
                </div>
            </div>
            <div className="w-full max-w-4xl mx-auto">
                <img src={certTemplate} alt="Certificate" className="w-full h-auto" />
            </div>
        </div>
    );
}




export default function Certificate() {
    const [res, setRes] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id: courseIdParam } = useParams();

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${BASE_URL}/api/course/cert/${courseIdParam}`, {
                    headers: {
                        "Authorization": "Bearer " + (localStorage.getItem("token") ?? "")
                    }
                });
                setRes(response.data);
            } catch (error) {
                console.error("Error fetching certificate:", error);
                setError("Failed to load certificate. Please try again or check if you have access to this course.");
            } finally {
                setLoading(false);
            }
        };

        if (courseIdParam) {
            fetchCertificate();
        } else {
            setError("Course ID is missing");
            setLoading(false);
        }
    }, [courseIdParam]);
            

    return (
        <div className="flex justify-center items-center min-h-screen">
            {loading ? (
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">Loading Certificate...</h2>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-600">
                    <h2 className="text-2xl font-semibold mb-4">Error</h2>
                    <p>{error}</p>
                </div>
            ) : res ? (
                <div className="text-center">
                <h1 className="text-4xl font-bold ">Certificate of Completion</h1>
                   <Cert _id={res._id} name={res.user.name} course={res.courseId.name} instructor={res.courseId.instructor} date={res.date} />
                </div>
            ) : (
                <div className="text-center text-gray-600">
                    <h2 className="text-2xl font-semibold">No certificate data available</h2>
                </div>
            )}
        </div>
    );
}
