import express from 'express';
import LOGS from './Midware/logs';
import USER from './Routes/User';
import COURSE from './Routes/Course';
import CLOUD from './Routes/Cloud'
import cors from 'cors';
import router from './Midware/logs';

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', LOGS);
app.use("/api/user",USER);
app.use("/api/course",COURSE);
app.use("/api/cloud",CLOUD)


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});