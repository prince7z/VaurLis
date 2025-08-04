import express from 'express';
import LOGS from './Midware/logs';
import USER from './Routes/User';
import COURSE from './Routes/Course';

const app = express();
app.use(express.json());

app.use('/api/auth', LOGS);
app.use("/api/user",USER);
app.use("/api/course",COURSE);

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});