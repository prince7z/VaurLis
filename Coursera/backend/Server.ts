import express from 'express';
import LOGS from './Routes/logs';
import USER from './Routes/User';
import COURSE from './Routes/Course';
import CLOUD from './Routes/Cloud'
import SECURE from './Routes/Secure';
import cors from 'cors';
import { setupWebSocketServer } from './WSS';


const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: "Server is running!", timestamp: new Date().toISOString() });
});

app.use('/api/auth', LOGS);
app.use("/api/user",USER);
app.use("/api/course",COURSE);
app.use("/api/cloud",CLOUD)
app.use("/api/secure",SECURE);


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

try {
  setupWebSocketServer();
  console.log('WebSocket server is running on port 8080');
} catch (error) {
  console.error('Failed to start WebSocket server:', error);
}