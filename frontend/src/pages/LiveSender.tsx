import React, { useState, useRef, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, WS_URL } from '../config/api';

interface PeerConnection {
  receiverId: string;
  connection: RTCPeerConnection;
}

interface ChatMessage {
  message: string;
  senderName: string;
  senderId: string;
  timestamp: number;
}
export default function LiveSender() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([]);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionsRef = useRef<PeerConnection[]>([]); // Add ref to avoid closure issues
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { roomId } = useParams();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axios.get(`${API_URL}/api/user/checkLive`, {
          params: { LID: roomId, role: 'sender' },
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        
        if (res.status === 200) {
          console.log('Auth check passed:', res.data);
          setIsAuthChecking(false);
        }
      } catch (error: any) {
        console.error('Error checking auth:', error);
        
        if (error.response) {
          if (error.response.status === 401) {
            window.location.href = '/login';
            return;
          }
          if (error.response.status === 403) {
            setAuthError('Room not created yet');
            setIsAuthChecking(false);
            return;
          }
          if (error.response.status === 402) {
            setAuthError('You are not the instructor for this course');
            setCourseId(error.response.data?.courseId || null);
            setIsAuthChecking(false);
            return;
          }
        }
        
        setAuthError('Authentication failed. Please try again.');
        setIsAuthChecking(false);
      }
    }

    checkAuth();
  }, [roomId]);




  const createPeerConnectionForReceiver = (receiverId: string, currentStream?: MediaStream): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Use the passed stream parameter first, then fall back to state
    const streamToUse = currentStream || mediaStream;

    // Add tracks immediately if stream is available
    if (streamToUse) {
      console.log('🎬 Adding tracks during peer connection creation...');
      console.log('MediaStream details:', {
        id: streamToUse.id,
        active: streamToUse.active,
        tracks: streamToUse.getTracks().length
      });
      
      streamToUse.getTracks().forEach((track: MediaStreamTrack) => {
        console.log(`Adding ${track.kind} track during creation:`, {
          id: track.id,
          readyState: track.readyState,
          enabled: track.enabled,
          muted: track.muted,
          label: track.label
        });
        peerConnection.addTrack(track, streamToUse);
      });
      
      // Verify tracks were added
      const senders = peerConnection.getSenders();
      console.log('Peer connection senders after adding tracks:', 
        senders.map(s => ({ 
          track: s.track ? { kind: s.track.kind, readyState: s.track.readyState } : null 
        }))
      );
    } else {
      console.warn('No stream available during peer connection creation');
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          roomId: roomId || '68de58f1d2db363ffb370776',
          receiverId: receiverId,
          candidate: event.candidate
        }));
        console.log('ICE candidate sent to receiver:', receiverId);
      }
    };

    return peerConnection;
  };

  const startStreaming = async () => {
    try {
      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      console.log('📹 Camera stream obtained:', {
        id: stream.id,
        active: stream.active,
        tracks: stream.getTracks().map(t => ({
          kind: t.kind,
          id: t.id,
          readyState: t.readyState,
          enabled: t.enabled,
          muted: t.muted
        }))
      });
      
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('📺 Local video element updated');
        
        // Verify local video is working
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Local video metadata loaded:', {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            duration: videoRef.current?.duration
          });
        };
      }

      // Connect to WebSocket server
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        // Join room as sender
        ws.send(JSON.stringify({
          type: 'sender-join',
          roomId: roomId || '68de58f1d2db363ffb370776'
        }));
      };

      ws.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);

        switch (message.type) {
          case 'receiver-joined':
            console.log('New receiver joined:', message.receiverId);
            try {
              const peerConnection = createPeerConnectionForReceiver(message.receiverId, stream);
              
              // Add to peerConnections array and ref
              const newPeerConn = {
                receiverId: message.receiverId,
                connection: peerConnection
              };
              setPeerConnections(prev => [...prev, newPeerConn]);
              peerConnectionsRef.current = [...peerConnectionsRef.current, newPeerConn];
              
              // Double-check tracks are added (backup in case mediaStream wasn't ready)
              if (mediaStream && mediaStream.getTracks().length > 0) {
                console.log('� Double-checking tracks are added...');
                mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
                  // Check if track is already added
                  const senders = peerConnection.getSenders();
                  const trackAlreadyAdded = senders.some(sender => sender.track === track);
                  
                  if (!trackAlreadyAdded) {
                    console.log(`Adding missing ${track.kind} track:`, track.id);
                    peerConnection.addTrack(track, mediaStream);
                  } else {
                    console.log(`${track.kind} track already added`);
                  }
                });
              } else if (stream && stream.getTracks().length > 0) {
                console.log('Using closure stream for tracks...');
                stream.getTracks().forEach((track: MediaStreamTrack) => {
                  const senders = peerConnection.getSenders();
                  const trackAlreadyAdded = senders.some(sender => sender.track === track);
                  
                  if (!trackAlreadyAdded) {
                    console.log(`Adding missing ${track.kind} track:`, track.id);
                    peerConnection.addTrack(track, stream);
                  } else {
                    console.log(`${track.kind} track already added`);
                  }
                });
              } else {
                console.error('No tracks available to add!');
              }
              
              console.log('Creating offer...');
              const offer = await peerConnection.createOffer();
              await peerConnection.setLocalDescription(offer);
              
              console.log('Sending offer to receiver:', message.receiverId);
              ws.send(JSON.stringify({
                type: 'offer',
                roomId: roomId || '68de58f1d2db363ffb370776',
                receiverId: message.receiverId,
                sdp: peerConnection.localDescription
              }));
              
              console.log('Offer sent successfully to receiver:', message.receiverId);
            } catch (error) {
              console.error('Error handling receiver-joined:', error);
            }
            break;

          case 'answer':
            try {
              console.log('Received answer from receiver:', message.receiverId);
              const peerConn = peerConnectionsRef.current.find(pc => pc.receiverId === message.receiverId);
              if (peerConn) {
                await peerConn.connection.setRemoteDescription(new RTCSessionDescription(message.sdp));
                console.log('Answer set as remote description for receiver:', message.receiverId);
              } else {
                console.error('Peer connection not found for receiver:', message.receiverId);
                console.log('Available peer connections:', peerConnectionsRef.current.map(pc => pc.receiverId));
              }
            } catch (error) {
              console.error('Error setting remote description:', error);
            }
            break;

          case 'ice-candidate':
            try {
              console.log('Received ICE candidate from receiver:', message.receiverId);
              const targetPeer = peerConnectionsRef.current.find(pc => pc.receiverId === message.receiverId);
              if (targetPeer) {
                await targetPeer.connection.addIceCandidate(new RTCIceCandidate(message.candidate));
                console.log('ICE candidate added for receiver:', message.receiverId);
              } else {
                console.error('Peer connection not found for ICE candidate:', message.receiverId);
              }
            } catch (error) {
              console.error('Error adding ICE candidate:', error);
            }
            break;
            
          case 'chat-message':
            // Received chat message from server
            setChatMessages(prev => [...prev, {
              message: message.message,
              senderName: message.senderName,
              senderId: message.senderId,
              timestamp: message.timestamp
            }]);
            break;
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setIsStreaming(true);
      console.log('Camera started successfully');
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const stopStreaming = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsSharingScreen(false);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    peerConnections.forEach(pc => {
      pc.connection.close();
    });
    setPeerConnections([]);
    peerConnectionsRef.current = [];

    setIsStreaming(false);
    console.log('Streaming stopped');
  };
  
  const toggleScreenShare = async () => {
    try {
      if (!isSharingScreen) {
        // Start screen sharing
        const screen = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true 
        });
        
        setScreenStream(screen);
        setIsSharingScreen(true);
        
        // Update video element to show screen
        if (videoRef.current) {
          videoRef.current.srcObject = screen;
        }
        
        // Replace video track in all peer connections
        const videoTrack = screen.getVideoTracks()[0];
        peerConnectionsRef.current.forEach(({ connection }) => {
          const sender = connection.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
        
        // Handle screen share stop
        videoTrack.onended = () => {
          stopScreenShare();
        };
        
        console.log('Screen sharing started');
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };
  
  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    
    setIsSharingScreen(false);
    
    // Switch back to camera
    if (mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      
      // Replace screen track with camera track in all peer connections
      const videoTrack = mediaStream.getVideoTracks()[0];
      peerConnectionsRef.current.forEach(({ connection }) => {
        const sender = connection.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
    }
    
    console.log('Screen sharing stopped');
  };
  
  const sendChatMessage = () => {
    if (messageInput.trim() && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'chat-message',
        roomId: roomId || '68de58f1d2db363ffb370776',
        message: messageInput.trim(),
        senderName: 'Sender',
        timestamp: Date.now()
      }));
      setMessageInput('');
    }
  };
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  // Show loading state while checking auth
  if (isAuthChecking) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">
            <svg className="inline-block w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Checking Access...</h2>
          <p className="text-gray-300">Verifying your instructor permissions</p>
        </div>
      </div>
    );
  }

  // Show error state if auth failed
  if (authError) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">
            <svg className="inline-block w-24 h-24 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">{authError}</h2>
          {courseId && (
            <a 
              href={`/course/${courseId}`} 
              className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Course
            </a>
          )}
          {!courseId && (
            <a 
              href="/" 
              className="mt-4 inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go to Home
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Left side - Video and Controls */}
      <div className="flex-1 flex flex-col p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex-1 flex flex-col">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Live Stream Sender 📹
          </h1>
          
          {/* Video Display */}
          <div className="flex-1 mb-4 relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full bg-black rounded-lg object-contain"
            />
            {isSharingScreen && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                🖥️ Sharing Screen
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3 justify-center flex-wrap">
            {!isStreaming ? (
              <button
                onClick={startStreaming}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center gap-2"
              >
                <span>🎥</span> Start Streaming
              </button>
            ) : (
              <>
                <button
                  onClick={stopStreaming}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center gap-2"
                >
                  <span>⏹️</span> Stop Streaming
                </button>
                <button
                  onClick={toggleScreenShare}
                  className={`px-6 py-3 rounded-lg transition-colors font-semibold flex items-center gap-2 ${
                    isSharingScreen 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                >
                  <span>{isSharingScreen ? '📹' : '🖥️'}</span>
                  {isSharingScreen ? 'Stop Sharing' : 'Share Screen'}
                </button>
              </>
            )}
          </div>

          {/* Status Info */}
          <div className="mt-4 text-center space-y-1">
            <p className="text-gray-300 text-sm">
              <span className="font-semibold">Room:</span> {roomId || '68de58f1d2db363ffb370776'}
            </p>
            <p className="text-gray-300 text-sm">
              <span className="font-semibold">👥 Viewers:</span> {peerConnections.length}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Chat */}
      <div className="w-96 bg-gray-800 shadow-lg flex flex-col">
        <div className="p-4 bg-gray-700 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">💬 Chat</h2>
        </div>
        
        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {chatMessages.length === 0 ? (
            <p className="text-gray-400 text-center text-sm mt-8">No messages yet...</p>
          ) : (
            chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.senderId === 'sender'
                    ? 'bg-blue-600 ml-auto'
                    : 'bg-gray-700'
                } max-w-[80%]`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-200">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white text-sm break-words">{msg.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-gray-700 border-t border-gray-600">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 border border-gray-500 focus:outline-none focus:border-blue-500"
              disabled={!isStreaming}
            />
            <button
              onClick={sendChatMessage}
              disabled={!isStreaming || !messageInput.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



