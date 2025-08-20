import { useRecoilValueLoadable } from "recoil";
import { useState } from "react";
import { useParams } from 'react-router-dom';

import { courseContentState } from "../Component/atoms/atoms";

interface vid {
  id : string,
  courseId : string,
  userId : string,
  name : string,
  finished : boolean,
  lastViewedTime : Date,  
  link : string,
  thumbnail : string,

}

export default function CourseContent() {
    const courseId = useParams().id;
    if(!courseId){
      return <div>Course not found</div>;
    }

  

  const Contentloadable = useRecoilValueLoadable(courseContentState(courseId));

  const content = Contentloadable.contents;
  

  const startwith = content.forEach((item:vid) => {
    if(item.finished === false){
      return item;
    }
    return content[0];
  });
  const [vidtoplay,setvidtoplay] = useState(startwith);
  

console.log(content);





  return (
    <>
   {/* <div>
      <h2>vid to play</h2>
      name : {vidtoplay?.name}
      link : {vidtoplay?.link}
      thumbnail : {vidtoplay?.thumbnail}
      finished : {vidtoplay?.finished}
      lastViewedTime : {vidtoplay?.lastViewedTime}
      
    </div>
    <div>
      <h2>vid list</h2>
      {content.map((item:vid) => (
        <div key={item.id}>
          <img src={item.thumbnail} alt={item.name} />
          <p>{item.name}</p>
          <p>finished : {item.finished}</p>
          <p>lastViewedTime : {item.lastViewedTime?.toLocaleString()}</p>
          <p>link : {item.link}</p>


          <button onClick={() => setvidtoplay(item)}>play</button>
        </div>
      ))}

    </div>*/}
    </>
  );
}
