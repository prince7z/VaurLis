import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

interface ChatMessage {
    message: string;
    senderName: string;
    senderId: string;
    timestamp: number;
}

export default function Reciver() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState<string>('disconnected');
    const [hasReceivedOffer, setHasReceivedOffer] = useState(false);
    const [receiverId, setReceiverId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const {roomId} = useParams();
    const LID = roomId;
    useEffect(() => {
        let mounted = true;

        const initializeConnection = async () => {
            try {
                const s = new WebSocket('ws://localhost:8080');
                
                s.onopen = () => {
                    if (mounted) {
                        console.log('ws connected');
                        setIsConnected(true);
                        s.send(JSON.stringify({ type: 'receiver-join', roomId: `${LID}` }));
                        setSocket(s);
                    }
                };

                s.onclose = () => {
                    if (mounted) {
                        console.log('ws disconnected');
                        setIsConnected(false);
                    }
                };

                s.onerror = (error) => {
                    console.log('ws error:', error);
                    if (mounted) {
                        setIsConnected(false);
                    }
                };

                s.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        console.log('ws message received:', data.type, data);

                        if (data.type === 'receiver-joined' && mounted) {
                            console.log('Receiver joined confirmation, ID:', data.receiverId);
                            setReceiverId(data.receiverId);
                        }
                        else if (data.type === 'offer' && mounted) {
                            console.log('Offer received, creating peer connection...');
                            await handleOffer(data.sdp, data.receiverId, s);
                        } 
                        else if (data.type === 'ice-candidate' && mounted) {
                            console.log('ICE candidate received');
                            // Use the pcRef to get the current peer connection
                            if (pcRef.current) {
                                try {
                                    await pcRef.current.addIceCandidate(data.candidate);
                                    console.log('ICE candidate added successfully');
                                } catch (error) {
                                    console.error('Error adding ICE candidate:', error);
                                }
                            }
                        }
                        else if (data.type === 'chat-message' && mounted) {
                            // Received chat message from server
                            setChatMessages(prev => [...prev, {
                                message: data.message,
                                senderName: data.senderName,
                                senderId: data.senderId,
                                timestamp: data.timestamp
                            }]);
                        }
                    } catch (error) {
                        console.error('Error handling WebSocket message:', error);
                    }
                };

            } catch (error) {
                console.log("WebSocket connection error:", error);
            }
        };

        initializeConnection();

        return () => {
            mounted = false;
            if (socket) {
                socket.close();
            }
            if (pcRef.current) {
                pcRef.current.close();
                pcRef.current = null;
            }
        };
    }, [LID]); // Only depend on roomId, not pc

    const handleOffer = async (offerSdp: RTCSessionDescriptionInit, receiverIdFromOffer: string, websocket: WebSocket) => {
        try {
            console.log('🎯 Handling offer...', 'ReceiverID:', receiverIdFromOffer);
            console.log('📋 Offer SDP received:', offerSdp);
            
            // Check if we already have a peer connection
            if (pcRef.current) {
                console.log('⚠️ Peer connection already exists, closing old one...');
                pcRef.current.close();
                pcRef.current = null;
                setPc(null);
            }
            
            // Check if offer contains media tracks
            if (offerSdp.sdp) {
                const hasVideo = offerSdp.sdp.includes('m=video');
                const hasAudio = offerSdp.sdp.includes('m=audio');
                console.log('📺 Offer analysis:', { hasVideo, hasAudio });
                
                if (!hasVideo && !hasAudio) {
                    console.error('❌ Offer contains no media tracks! This will prevent ontrack from firing.');
                } else {
                    console.log('✅ Offer contains media tracks - ontrack should fire!');
                }
            }
            
            console.log('🔧 Creating new peer connection...');
            const peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            });

            // Store in ref for ICE candidate handling
            pcRef.current = peerConnection;
            setPc(peerConnection);

            // Add extensive logging for debugging
            console.log('🔧 Setting up peer connection event handlers...');

            // Set up event handlers
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    const finalReceiverId = receiverId || receiverIdFromOffer;
                    console.log('📤 Sending ICE candidate for receiver:', finalReceiverId);
                    websocket.send(JSON.stringify({ 
                        type: 'ice-candidate', 
                        roomId: LID,
                        receiverId: finalReceiverId,
                        candidate: event.candidate 
                    }));
                }
            };

            peerConnection.onconnectionstatechange = () => {
                console.log('Connection state:', peerConnection.connectionState);
                setConnectionState(peerConnection.connectionState);
                
                if (peerConnection.connectionState === 'connected') {
                    console.log('🎉 Peer connection established successfully!');
                }
            };

            peerConnection.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', peerConnection.iceConnectionState);
            };

            // This is the critical event we need to fire
            peerConnection.ontrack = (event) => {
                console.log('🎥 *** ONTRACK EVENT TRIGGERED! ***');
                console.log('Track kind:', event.track.kind);
                console.log('Event.streams:', event.streams);
                console.log('Event.track:', event.track);
                
                if (event.streams && event.streams.length > 0) {
                    const stream = event.streams[0];
                    console.log('✅ Stream received in ontrack:', stream);
                    console.log('Stream ID:', stream.id);
                    console.log('Stream tracks:', stream.getTracks().map(t => `${t.kind}: ${t.readyState} (${t.enabled ? 'enabled' : 'disabled'})`));
                    
                    // Get video element
                    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
                    console.log('Video element found:', !!remoteVideo);
                    
                    if (remoteVideo && !remoteVideo.srcObject) {
                        console.log('🎬 Setting srcObject on video element...');
                        remoteVideo.srcObject = stream;
                        
                        // Force video properties
                        remoteVideo.autoplay = true;
                        remoteVideo.playsInline = true;
                        remoteVideo.muted = true;
                        
                        console.log('Video element after setting stream:', {
                            srcObject: !!remoteVideo.srcObject,
                            readyState: remoteVideo.readyState,
                            paused: remoteVideo.paused,
                            muted: remoteVideo.muted,
                            autoplay: remoteVideo.autoplay
                        });
                        
                        // Add comprehensive event listeners for debugging
                        remoteVideo.onloadstart = () => console.log('📹 loadstart - browser started loading');
                        remoteVideo.onloadeddata = () => console.log('📹 loadeddata - first frame loaded');
                        remoteVideo.oncanplay = () => {
                            console.log('📹 canplay - enough data to start playing');
                            console.log('Video state when canplay:', {
                                readyState: remoteVideo.readyState,
                                videoWidth: remoteVideo.videoWidth,
                                videoHeight: remoteVideo.videoHeight
                            });
                        };
                        remoteVideo.oncanplaythrough = () => console.log('📹 canplaythrough - can play through without stopping');
                        remoteVideo.onplay = () => console.log('📹 play event fired');
                        remoteVideo.onplaying = () => console.log('📹 playing - playback started');
                        remoteVideo.onpause = () => console.log('📹 pause event');
                        remoteVideo.onstalled = () => console.log('📹 stalled - download stopped');
                        remoteVideo.onwaiting = () => console.log('📹 waiting - waiting for data');
                        remoteVideo.onerror = (e) => console.error('📹 video error:', e);
                        
                        // Try to play after a small delay and when metadata loads
                        const attemptPlay = async () => {
                            try {
                                console.log('🎮 Attempting to play video... Current state:', {
                                    readyState: remoteVideo.readyState,
                                    paused: remoteVideo.paused,
                                    srcObject: !!remoteVideo.srcObject
                                });
                                await remoteVideo.play();
                                console.log('✅ Video playing successfully!');
                            } catch (error) {
                                console.error('❌ Video play failed:', error);
                                // Add manual play option
                                remoteVideo.onclick = async () => {
                                    try {
                                        console.log('👆 User clicked video, attempting manual play...');
                                        await remoteVideo.play();
                                        console.log('✅ Manual play successful!');
                                        remoteVideo.onclick = null;
                                    } catch (e) {
                                        console.error('❌ Manual play failed:', e);
                                    }
                                };
                                console.log('👆 Click the video to play manually');
                            }
                        };
                        
                        // Wait for metadata and try to play
                        remoteVideo.onloadedmetadata = () => {
                            console.log('📹 Video metadata loaded, attempting play...');
                            console.log('Video dimensions:', remoteVideo.videoWidth, 'x', remoteVideo.videoHeight);
                            attemptPlay();
                        };
                        
                        // Also try immediate play
                        setTimeout(attemptPlay, 100);
                        
                        // Force a load if needed
                        setTimeout(() => {
                            if (remoteVideo.readyState === 0) {
                                console.log('⚠️ Video readyState still 0, forcing load...');
                                remoteVideo.load();
                            }
                        }, 1000);
                        
                    } else if (remoteVideo && remoteVideo.srcObject) {
                        console.log('📺 Video element already has srcObject, skipping...');
                        console.log('Current video state:', {
                            readyState: remoteVideo.readyState,
                            paused: remoteVideo.paused,
                            videoWidth: remoteVideo.videoWidth,
                            videoHeight: remoteVideo.videoHeight
                        });
                    } else {
                        console.error('❌ Video element with ID "remoteVideo" not found!');
                    }
                } else {
                    console.error('❌ No streams in ontrack event!');
                }
            };

            // Set remote description (offer)
            await peerConnection.setRemoteDescription(offerSdp);
            console.log('Offer set as remote description');

            // Create and send answer
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log('Answer created and set as local description');

            // Use the receiverId from state (assigned during receiver-join) or fall back to the one from offer
            const finalReceiverId = receiverId || receiverIdFromOffer;
            console.log('📤 Sending answer with receiverId:', finalReceiverId);
            
            websocket.send(JSON.stringify({ 
                type: 'answer', 
                roomId: LID,
                receiverId: finalReceiverId,
                sdp: peerConnection.localDescription 
            }));
            console.log('✅ Answer sent to sender');

            setHasReceivedOffer(true);
            
            // Backup method: Check for tracks after connection is established
            setTimeout(() => {
                console.log('🔍 Checking peer connection state...');
                console.log('Connection state:', peerConnection.connectionState);
                console.log('ICE connection state:', peerConnection.iceConnectionState);
                
                // Check all receivers and their tracks
                const receivers = peerConnection.getReceivers();
                console.log('📡 Active receivers:', receivers.length);
                receivers.forEach((receiver, index) => {
                    console.log(`Receiver ${index}:`, {
                        track: receiver.track,
                        kind: receiver.track?.kind,
                        readyState: receiver.track?.readyState,
                        enabled: receiver.track?.enabled
                    });
                });
                
                // Try to recreate stream from receiver tracks if needed
                const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
                if (remoteVideo) {
                    console.log('Video element current state:', {
                        srcObject: !!remoteVideo.srcObject,
                        readyState: remoteVideo.readyState,
                        paused: remoteVideo.paused,
                        videoWidth: remoteVideo.videoWidth,
                        videoHeight: remoteVideo.videoHeight
                    });
                    
                    // If no srcObject or readyState is 0, try alternative approach
                    if (!remoteVideo.srcObject || remoteVideo.readyState === 0) {
                        console.log('⚠️ Creating new stream from receiver tracks...');
                        const tracks = receivers.map(r => r.track).filter(t => t);
                        if (tracks.length > 0) {
                            const newStream = new MediaStream(tracks);
                            console.log('🔄 Created new stream with tracks:', newStream.getTracks().map(t => t.kind));
                            remoteVideo.srcObject = newStream;
                            
                            setTimeout(async () => {
                                try {
                                    await remoteVideo.play();
                                    console.log('✅ Backup stream playing!');
                                } catch (e) {
                                    console.error('❌ Backup stream play failed:', e);
                                }
                            }, 500);
                        } else {
                            console.log('❌ No tracks available for backup stream');
                        }
                    }
                }
            }, 3000);

        } catch (error) {
            console.error('Error handling offer:', error);
        }
    };

    const startReceiving = () => {
        if (!isConnected) {
            console.log('WebSocket not connected');
            return;
        }
        console.log('Ready to receive. Waiting for sender...');
    };
    
    const sendChatMessage = () => {
        if (messageInput.trim() && socket) {
            socket.send(JSON.stringify({
                type: 'chat-message',
                roomId: LID,
                message: messageInput.trim(),
                senderName: 'Viewer',
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

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Main video area - fullscreen */}
            <div className="flex-1 flex flex-col relative">
                {/* Video */}
                <video 
                    id="remoteVideo" 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full bg-black object-contain"
                    onLoadedMetadata={() => console.log('📹 Video metadata loaded')}
                    onCanPlay={() => console.log('📹 Video can play')}
                    onPlay={() => console.log('▶️ Video started playing')}
                    onError={(e) => console.error('❌ Video error:', e)}
                />
                
                {/* Status overlay */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg">
                    <div className="text-sm space-y-1">
                        <p className="flex items-center gap-2">
                            <span>{isConnected ? '🟢' : '🔴'}</span>
                            <span className="font-semibold">{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </p>
                        <p className="text-xs text-gray-300">Room: {LID || 'None'}</p>
                        <p className="text-xs text-gray-300">
                            Status: {connectionState === 'connected' ? '🟢 Live' : connectionState}
                        </p>
                    </div>
                </div>
                
                {/* No stream message */}
                {!hasReceivedOffer && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                            <div className="text-6xl mb-4">📺</div>
                            <h2 className="text-2xl font-bold mb-2">Waiting for Stream...</h2>
                            <p className="text-gray-300">The stream will start automatically when the sender begins broadcasting</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right sidebar - Chat */}
            <div className="w-80 bg-gray-800 shadow-lg flex flex-col border-l border-gray-700">
                <div className="p-4 bg-gray-700 border-b border-gray-600">
                    <h2 className="text-lg font-bold text-white">💬 Live Chat</h2>
                    <p className="text-xs text-gray-400 mt-1">
                        {chatMessages.length} message{chatMessages.length !== 1 ? 's' : ''}
                    </p>
                </div>
                
                {/* Chat Messages */}
                <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                    {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm mt-8">
                            <p>No messages yet</p>
                            <p className="text-xs mt-2">Send a message to start chatting!</p>
                        </div>
                    ) : (
                        chatMessages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                    msg.senderId === receiverId
                                        ? 'bg-blue-600 ml-auto'
                                        : 'bg-gray-700'
                                } max-w-[85%]`}
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
                            placeholder="Send a message..."
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-600 text-white placeholder-gray-400 border border-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                            disabled={!isConnected}
                        />
                        <button
                            onClick={sendChatMessage}
                            disabled={!isConnected || !messageInput.trim()}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}