const express = require('express');
const LOGS = require('./Midware/logs');
const USER = require('./Midware/User');
const COURSE = require('./Midware/Course');
const app = express();
app.use(express.json());


app.use('api/auth', LOGS);
app.use("api/user",USER);
app.use("api/course",COURSE);






app.listen(5000, () => {
  console.log('Server is running on port 5000');
});