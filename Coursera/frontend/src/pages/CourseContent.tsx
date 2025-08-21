import { useRecoilValueLoadable } from "recoil";
import { useState ,useEffect } from "react";

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
    return <div>Course not found</div>;
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

const duration: number = 3600; //logic to find duration of lacture

const interval = duration/4;
const  where : number= Math.floor(duration/interval);//{/* Logic acc to streaming*/}

if (where === 3){
if (vidtoplay) {
  vidtoplay.finished = true;
}

} 
else{}
  useEffect(()=>{
    const res = axios.post(`${BASE_URL}/api/user/updatestats`,
      {Headers:{
        authorization: `Bearer ${localStorage.getItem('token')}`
      },
        body:
      {
        vidId: vidtoplay?.id,
        courseID: courseId,
        IntervalFinished: where
      }
    }
  
  
  ).then((res)=>{
    if (res.status === 200) {
      console.log("Enterval updated at DB");
    }
  })
 



  },[where])

  
  return (
    <>
    <div className="w-full flex justify-center ">


    <div className="w-full top-0 position-fixed max-w-2xl bg-white rounded-lg shadow-lg p-6 space-y-4">

       <h1 className="text-3xl font-bold text-gray-800 mb-4">Now Playing</h1>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-700">
          {vidtoplay?.name}
        </h2>

        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img 
            src={vidtoplay?.thumbnail} 
            alt={vidtoplay?.name} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              vidtoplay?.finished 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {vidtoplay?.finished ? 'Completed' : 'In Progress'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Last Viewed:</span>
            <span className="text-gray-700">
              {vidtoplay?.lastViewedTime 
                ? vidtoplay.lastViewedTime.toLocaleString()
                : 'Never viewed'}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h1 className="text-2xl">vid list</h1>
      {content?.map((item: vid) => (
        <div key={item.id} className="mb-4 p-4 border rounded">
          <img 
            src={item.thumbnail} 
            alt={item.name} 
            className="w-48 h-auto"
          />
          <p className="text-lg font-semibold mt-2">{item.name}</p>
          <p>Status: {item.finished ? 'Completed' : 'In Progress'}</p>
          <p>Last Viewed: {item.lastViewedTime?.toLocaleString()}</p>
          <button 
            onClick={() => setvidtoplay(item)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Play
          </button>
        </div>
      ))}
    </div>

    </div>
    </>
  );
}