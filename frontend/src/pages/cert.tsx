import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import certTemplate from "../Component/cert/0002.png";
import signature from "../Component/cert/signature.png";
import { API_URL } from '../config/api';


const CERT_POSITIONS = {
    userName: { x: 50, y: 32 },        // Student name position
    courseName: { x: 50, y: 42 },      // Course name position
    instructor: { x: 70.5, y: 57.5 },      // Instructor position
    duration : {x: 51, y:57.5},
    date: { x: 11, y: 90 },            // Date position
    id: { x: 15.8, y: 93 },            // ID position
    url: { x: 8.2, y: 96 },           // URL position
    qrCode: { x: 50, y: 70 }       ,    // QR code position
    signature: { x: 21, y: 67 }        // Signature position
};


const printStyles = `
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    
    body * {
      visibility: hidden;
    }
    
    .certificate-container, .certificate-container * {
      visibility: visible;
    }
    
    .certificate-container {
      position: fixed !important;
      left: 0 !important;
      top: 0 !important;
      transform: none !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      page-break-after: avoid !important;
      page-break-before: avoid !important;
      page-break-inside: avoid !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    
    .certificate-container > img {
      max-width: 100% !important;
      max-height: 100vh !important;
      width: auto !important;
      height: auto !important;
      display: block !important;
      object-fit: contain !important;
    }
    
    .certificate-container .absolute {
      position: absolute !important;
    }
    
    /* Reduce signature size in print */
    .certificate-container img[alt="Signature"] {
      width: 120px !important;
    }
    
    /* Ensure text colors print correctly */
    .text-gray-800, .text-gray-700, .text-gray-600 {
      color: #1f2937 !important;
    }
    
    .text-gray-200 {
      color: #e5e7eb !important;
    }
    
    .no-print {
      display: none !important;
      visibility: hidden !important;
    }
    
    @page {
      size: landscape;
      margin: 0;
    }
  }
`;

function Cert(props: { _id: string; name: string; course: string; duration: String; instructor: string; date: string }) {

const name = props.name.replace(/[^a-zA-Z\s]/g, '');
const instructor = props.instructor.replace(/[^a-zA-Z\s]/g, '');

const duration = props.duration.replace(/[^0-9]/g, '');
const date = new Date(props.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});
    return (
        <>
            <style>{printStyles}</style>
            <div className="certificate-container relative w-full max-w-4xl mx-auto shadow-2xl">
                {/* Certificate Template Image */}
                <img 
                    src={certTemplate} 
                    alt="Certificate Template" 
                    className="w-full h-auto"
                    crossOrigin="anonymous"
                />
                
                {/* Overlay Certificate Data */}
                <div className="absolute inset-0">
                    {/* Student Name */}
                    <div 
                        className="absolute text-center w-full"
                        style={{ 
                            left: `${CERT_POSITIONS.userName.x}%`, 
                            top: `${CERT_POSITIONS.userName.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 font-glacial">
                            {name}
                        </h2>
                    </div>

                    {/* Course Name */}
                    <div 
                        className="absolute text-center w-full px-8"
                        style={{ 
                            left: `${CERT_POSITIONS.courseName.x}%`, 
                            top: `${CERT_POSITIONS.courseName.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <p className="text-base md:text-l text-gray-700 italic font-glacial">
                            has successfully completed the <span className="font-semibold">{props.course}</span> course, demonstrating proficiency in essential skills and knowledge. This achievement reflects dedication to professional development and continuous learning.
                        </p>
                    </div>

                    {/* Instructor */}
                    <div 
                        className="absolute text-center w-full"
                        style={{ 
                            left: `${CERT_POSITIONS.instructor.x}%`, 
                            top: `${CERT_POSITIONS.instructor.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <p className="text-sm md:text-m text-gray-800 font-glacial">
                            {instructor.length > 8 ? (
                                <span className="font-semibold">{instructor} from MIT</span>
                            ) : (
                                <>Instructor: <span className="font-semibold">{instructor} from MIT</span></>
                            )}
                        </p>
                    </div>

                         <div 
                        className="absolute text-center w-full"
                        style={{ 
                            left: `${CERT_POSITIONS.duration.x}%`, 
                            top: `${CERT_POSITIONS.duration.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <p className="text-sm md:text-m text-gray-800 font-glacial">
                            <span className="">{duration} Training hours</span>
                        </p>
                    </div>

                    {/* Date */}
                    <div 
                        className="absolute text-center w-full"
                        style={{ 
                            left: `${CERT_POSITIONS.date.x}%`, 
                            top: `${CERT_POSITIONS.date.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <p className="text-sm md:text-m text-gray-200 font-glacial">
                            Issued Date: {" "}
                            {date}
                        </p>
                    </div>
                    {/* Certificate ID */}
                    <div 
                        className="absolute text-center w-full"
                        style={{ 
                            left: `${CERT_POSITIONS.id.x}%`, 
                            top: `${CERT_POSITIONS.id.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <p className="text-sm md:text-m text-gray-200 font-glacial">
                            Certificate ID: {" "}
                            {props._id}
                        </p>
                    </div>
                    {/* Verification URL */}
                    <div 
                        className="absolute text-center w-full"
                        style={{ 
                            left: `${CERT_POSITIONS.url.x}%`, 
                            top: `${CERT_POSITIONS.url.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <p className="text-sm md:text-m text-gray-200 font-glacial">
                            
                            
                           
                            {API_URL}
                        </p>
                    </div>
                    {/* Signature */}
                    <div 
                        className="absolute"
                        style={{
                            left: `${CERT_POSITIONS.signature.x}%`, 
                            top: `${CERT_POSITIONS.signature.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <img 
                            src={signature} 
                            alt="Signature" 
                            className="w-32 md:w-60"
                            crossOrigin="anonymous"
                        />
                    </div>

                    {/* QR Code */}
                    <div 
                        className="absolute flex justify-center"
                        style={{ 
                            left: `${CERT_POSITIONS.qrCode.x}%`, 
                            top: `${CERT_POSITIONS.qrCode.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="bg-white p-2 ">
                            <QRCode 
                                value={`${API_URL}/verify/cert/${props._id}`} 
                                size={80}
                                style={{ background: 'white' }}
                                fgColor="#000000" 
                            />
                            <p className="text-xs text-center mt-1 font-glacial">Scan to Verify</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}




export default function Certificate() {
    const [res, setRes] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id: courseIdParam } = useParams();
    const certificateRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${API_URL}/api/course/cert/${courseIdParam}`, {
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
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            {loading ? (
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">Loading Certificate...</h2>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-600 bg-red-50 p-8 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Error</h2>
                    <p>{error}</p>
                </div>
            ) : res ? (
                <div className="w-full max-w-5xl">
                    <div className="text-center mb-8 no-print">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                            Certificate of Completion
                        </h1>
                        <p className="text-gray-600">
                            Awarded to {res.user.name} for completing {res.courseId.name}
                        </p>
                    </div>
                    <div ref={certificateRef}>
                        <Cert 
                            _id={res._id} 
                            name={res.user.name} 
                            course={res.courseId.name} 
                            duration={res.courseId.duration}
                            instructor={res.courseId.instructor} 
                            date={res.createdAt || new Date().toISOString()} 
                        />
                    </div>
                    <div className="mt-8 text-center space-x-4 no-print">
                        <button 
                            onClick={() => window.print()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                        >
                            Download/Print Certificate
                        </button>
                      
                    </div>
                </div>
            ) : (
                <div className="text-center text-gray-600 bg-gray-100 p-8 rounded-lg">
                    <h2 className="text-2xl font-semibold">No certificate data available</h2>
                </div>
            )}
        </div>
    );
}
