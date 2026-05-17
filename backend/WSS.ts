import { WebSocketServer ,WebSocket} from 'ws'
import { Server as HTTPServer } from 'http';

export function setupWebSocketServer(server: HTTPServer) {
const wss = new WebSocketServer({ server });

interface Receiver {
  ws: WebSocket;
  id: string;
}

interface Room {
  sender: WebSocket|null;
  receivers: Map<string, Receiver>;
  
}
const rooms: Record<string, Room> = {};

// Generate unique receiver ID
function generateReceiverId(): string {
  return 'receiver_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

wss.on('connection', (ws: WebSocket) => {

ws.on('message', (message: string) => {
  try {
    const data = JSON.parse(message);
    console.log('Received message:', data);
    const { type, roomId } = data;
  
    if (roomId && !rooms[roomId]) {
      rooms[roomId] = { sender: null, receivers: new Map() };
    }

    switch (type) {
      case 'sender-join':{
        
          rooms[roomId].sender = ws;
          (ws as any ).role = 'sender';
          (ws as any ).roomId = roomId;
          ws.send(JSON.stringify({ type: 'sender-joined', roomId }));
          console.log(`Sender joined room: ${roomId}`);  
          break;      
      }
      case 'receiver-join':{
          const receiverId = generateReceiverId();
          rooms[roomId].receivers.set(receiverId, { ws, id: receiverId });
          (ws as any ).role = 'receiver';
          (ws as any ).roomId = roomId;
          (ws as any ).receiverId = receiverId;
          
          ws.send(JSON.stringify({ type: 'receiver-joined', roomId, receiverId }));
          
          // Notify sender about new receiver
          if (rooms[roomId].sender && rooms[roomId].sender!.readyState === WebSocket.OPEN) {
            rooms[roomId].sender!.send(JSON.stringify({ 
              type: 'receiver-joined', 
              roomId, 
              receiverId 
            }));
          }
          
          console.log(`Receiver ${receiverId} joined room: ${roomId}`);
          
          break;
      }
      case 'offer': {
        const room = rooms[roomId];
        const { receiverId } = data;
        
        if (receiverId) {
          // Send to specific receiver
          const receiver = room.receivers.get(receiverId);
          if (receiver && receiver.ws.readyState === WebSocket.OPEN) {
            // Ensure receiverId is included in the offer
            receiver.ws.send(JSON.stringify({ ...data, receiverId }));
            console.log(`Offer sent to receiver ${receiverId} in room: ${roomId}`);
          } else {
            console.error(`Receiver ${receiverId} not found or not ready`);
          }
        } else {
          // Send to all receivers (fallback)
          room.receivers.forEach(receiver => {
            if (receiver.ws.readyState === WebSocket.OPEN) {
              // Include receiver ID when broadcasting
              receiver.ws.send(JSON.stringify({ ...data, receiverId: receiver.id }));
            }
          });
          
          console.log(`Offer sent to all receivers in room: ${roomId}`);
        }
        break;
      }
      
      case 'answer': {
        const room = rooms[roomId];
        if (room.sender && room.sender.readyState === WebSocket.OPEN) {
          room.sender.send(JSON.stringify(data));
          console.log(`Answer sent to sender in room: ${roomId}`);
        }
        break;

      }
      case 'ice-candidate': {
        const room = rooms[roomId];
        const { receiverId } = data;
        
        if ((ws as any).role === 'sender') {
          if (receiverId) {
            // Send to specific receiver
            const receiver = room.receivers.get(receiverId);
            if (receiver && receiver.ws.readyState === WebSocket.OPEN) {
              receiver.ws.send(JSON.stringify(data));
            }
          } else {
            // Send to all receivers (fallback)
            room.receivers.forEach(receiver => {
              if (receiver.ws.readyState === WebSocket.OPEN) {
                receiver.ws.send(JSON.stringify(data));
              }
            });
          }
        } else {
          // Receiver sending to sender
          if (room.sender && room.sender.readyState === WebSocket.OPEN) {
            room.sender.send(JSON.stringify(data));
          }
        }
        console.log(`ICE candidate sent in room: ${roomId}`);
        break;
      }
      
      case 'chat-message': {
        const room = rooms[roomId];
        const { message, senderName, senderId, senderImg, timestamp } = data;
        
        // Broadcast message to all users in room (including sender for confirmation)
        const chatData = {
          type: 'chat-message',
          roomId,
          message,
          senderName: senderName || ((ws as any).role === 'sender' ? 'Sender' : 'Viewer'),
          senderId: senderId || (ws as any).receiverId || 'sender',
          senderImg: senderImg || undefined,
          timestamp: timestamp || Date.now()
        };
        
        // Send to sender
        if (room.sender && room.sender.readyState === WebSocket.OPEN) {
          room.sender.send(JSON.stringify(chatData));
        }
        
        // Send to all receivers
        room.receivers.forEach(receiver => {
          if (receiver.ws.readyState === WebSocket.OPEN) {
            receiver.ws.send(JSON.stringify(chatData));
          }
        });
        
        console.log(`Chat message broadcasted in room: ${roomId} from ${senderName}`);
        break;
      }
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
});

// Handle connection close
ws.on('close', () => {
  const wsAny = ws as any;
  if (wsAny.roomId && rooms[wsAny.roomId]) {
    const room = rooms[wsAny.roomId];
    
    if (wsAny.role === 'sender') {
      room.sender = null;
      console.log(`Sender disconnected from room: ${wsAny.roomId}`);
    } else if (wsAny.role === 'receiver' && wsAny.receiverId) {
      room.receivers.delete(wsAny.receiverId);
      console.log(`Receiver ${wsAny.receiverId} disconnected from room: ${wsAny.roomId}`);
      
      // Notify sender about receiver disconnect
      if (room.sender && room.sender.readyState === WebSocket.OPEN) {
        room.sender.send(JSON.stringify({ 
          type: 'receiver-disconnected', 
          roomId: wsAny.roomId, 
          receiverId: wsAny.receiverId 
        }));
      }
    }
    
    // Clean up empty rooms
    if (!room.sender && room.receivers.size === 0) {
      delete rooms[wsAny.roomId];
      console.log(`Room ${wsAny.roomId} deleted (empty)`);
    }
  }
});
  
}
);
}