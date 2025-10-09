import { useRecoilValueLoadable } from "recoil";
import { useState, useEffect, useRef } from "react";
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


//  {
//     "videoId": "68a610ee362cacd31f680cce",
//     "trackingId": "",
//     "name": "corroboro concedo accusator",
//     "link": "https://www.youtube.com/watch?v=f0QDPllYdTo",
//     "thumbnail": "https://picsum.photos/seed/ZEKzr/1274/2319",
//     "duration": 28,
//     "finished": false,
//     "lastViewedTime": null,
//     "watchedInt": 0
//   },
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
    axios.post(`${BASE_URL}/api/user/updatestats`,
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

          <div id="progress-bar">
          <p>Progress</p>
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(content?.filter((item: vid) => item.finished).length || 0) / (content?.length || 1) * 100}%` }} />
          </div>
        </div>
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
                    vidtoplay === item
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setvidtoplay(item)

                  }}
                >
                  {/* Video Thumbnail */}
                  <div className="relative flex-shrink-0 mr-4">
                    <img 
                      src={item.thumbnail} 
                      alt={item.name} 
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                      {vidtoplay === item ? (
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
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showControls, setShowControls] = useState(false);

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    let videoId = '';
    
    // Extract video ID from various YouTube URL formats
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    
    // Return embed URL with parameters to hide branding
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0&showinfo=0&fs=1&iv_load_policy=3&controls=0&disablekb=1&playsinline=1`;
  };

  useEffect(() => {
    if (!vidtoplay || !playerRef.current) return;

    // YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    let player: any;

    (window as any).onYouTubeIframeAPIReady = () => {
      player = new (window as any).YT.Player(playerRef.current, {
        events: {
          onReady: (event: any) => {
            setDuration(event.target.getDuration());
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === 1);
          }
        }
      });

      // Update time
      const interval = setInterval(() => {
        if (player && player.getCurrentTime) {
          setCurrentTime(player.getCurrentTime());
        }
      }, 100);

      return () => clearInterval(interval);
    };
  }, [vidtoplay]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    const iframe = playerRef.current;
    
    if (isPlaying) {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    } else {
      iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    playerRef.current?.contentWindow?.postMessage(
      `{"event":"command","func":"seekTo","args":[${newTime}, true]}`,
      '*'
    );
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    playerRef.current?.contentWindow?.postMessage(
      `{"event":"command","func":"setVolume","args":[${newVolume}]}`,
      '*'
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!vidtoplay) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
        <div className="text-center p-8">
          <svg className="w-20 h-20 mx-auto mb-4 opacity-40" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Ready to Learn?</h3>
          <p className="text-gray-400">Select a video from the course content below</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full group bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* YouTube IFrame */}
      <iframe
        ref={playerRef}
        className="w-full h-full"
        src={getYouTubeEmbedUrl(vidtoplay.link)}
        title={vidtoplay.name}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      {/* Custom Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="text-white hover:text-blue-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume}%, #4b5563 ${volume}%, #4b5563 100%)`
                }}
              />
              <span className="text-white text-sm w-8">{volume}%</span>
            </div>
          </div>

          {/* Video Title */}
          <div className="flex-1 mx-4">
            <p className="text-white text-sm font-medium truncate">{vidtoplay.name}</p>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => {
              if (playerRef.current) {
                playerRef.current.requestFullscreen();
              }
            }}
            className="text-white hover:text-blue-400 transition-colors p-2 hover:bg-white/10 rounded-full"
            aria-label="Fullscreen"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center Play Button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/60 rounded-full p-6 backdrop-blur-sm">
            <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}