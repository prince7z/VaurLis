import { useRecoilValueLoadable } from "recoil";
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import axios from 'axios';
const BASE_URL = "http://localhost:5000";

import { courseContentState } from "../Component/atoms/atoms";

interface vid {
  id: string;
  name: string;
  finished: boolean;
  lastViewedTime: Date;
  link: string;
  thumbnail: string;
}

export default function CourseContent() {
  const courseId = useParams().id;

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Course not found</h2>
          <p className="text-gray-600 mt-2">The requested course could not be found.</p>
        </div>
      </div>
    );
  }

  const Contentloadable = useRecoilValueLoadable(courseContentState(courseId));
  const content = Contentloadable.contents.content;

  const [start, setStart] = useState<vid | undefined>(
    content?.[0] ?? undefined
  );

  useEffect(() => {
    if (content && content.length > 0) {
      const unfinished = content.find((item: vid) => !item.finished);
      if (unfinished) {
        setStart(unfinished);
      }
    }
  }, [content]);

  const [vidtoplay, setvidtoplay] = useState<vid | undefined>(start);

  useEffect(() => {
    if (start) {
      setvidtoplay(start);
    }
  }, [start]);

  const duration: number = 3600;
  const interval = duration / 4;
  const where: number = Math.floor(duration / interval);

  if (where === 3) {
    if (vidtoplay) {
      vidtoplay.finished = true;
    }
  }

  useEffect(() => {
    const res = axios.post(`${BASE_URL}/api/user/updatestats`,
      {
        Headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: {
          vidId: vidtoplay?.id,
          courseID: courseId,
          IntervalFinished: where
        }
      }
    ).then((res) => {
      if (res.status === 200) {
        console.log("Interval updated at DB");
      }
    })
  }, [where])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Video Player Section */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {vidtoplay?.name || "Select a video to play"}
              </h1>
              {vidtoplay?.finished && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
            
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              <Player vidtoplay={vidtoplay} />
            </div>
          </div>
        </div>

        {/* Course Content List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Course Content</h2>
            <p className="text-gray-600 text-sm mt-1">
              {content?.filter((item: vid) => item.finished).length || 0} of {content?.length || 0} videos completed
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {content?.map((item: vid, index: number) => (
                <div 
                  key={item.id} 
                  className={`flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                    vidtoplay?.id === item.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setvidtoplay(item)}
                >
                  {/* Video Thumbnail */}
                  <div className="relative flex-shrink-0 mr-4">
                    <img 
                      src={item.thumbnail} 
                      alt={item.name} 
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                      {vidtoplay?.id === item.id ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {index + 1}. {item.name}
                      </h3>
                      {item.finished && (
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.finished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.finished ? 'Completed' : 'In Progress'}
                      </span>
                      {item.lastViewedTime && (
                        <span className="ml-3">
                          Last viewed: {new Date(item.lastViewedTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Play Button */}
                  <button 
                    className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                      vidtoplay?.id === item.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vidtoplay?.id === item.id ? 'Playing' : 'Play'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Player({ vidtoplay }: { vidtoplay: vid | undefined }) {
  if (!vidtoplay) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <p className="text-lg opacity-75">Select a video to start learning</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Replace this with your actual video player component */}
      <video 
        className="w-full h-full" 
        controls 
        poster={vidtoplay.thumbnail}
        src={vidtoplay.link}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}