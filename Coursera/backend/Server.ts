import express from 'express';
import LOGS from './Midware/logs';
import USER from './Routes/User';
import COURSE from './Routes/Course';
import CLOUD from './Routes/Cloud'
import cors from 'cors';

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


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});