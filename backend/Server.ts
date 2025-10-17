import 'dotenv/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logtailLogger, detailedLogger, logCorsViolation, detailedMongoLogger } from './config/logger';
import express from 'express';
import LOGS from './Routes/logs';
import USER from './Routes/User';
import COURSE from './Routes/Course';
import CLOUD from './Routes/Cloud'
import SECURE from './Routes/Secure';
import ADMIN from './Routes/admin';
import cors from 'cors';
import { setupWebSocketServer } from './WSS';
import { createServer } from 'http';


const app = express();

// Health check endpoint - MUST be before any middleware for Render health checks
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: "VaurLis API is running!", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://vaurlis-frontend.onrender.com' // Production frontend
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {

      console.warn('CORS BLOCKED:', {
        origin: origin,
        timestamp: new Date().toISOString(),
        message: 'Request from unauthorized origin'
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    const violationDetails = {
      timestamp: new Date().toISOString(),
      origin: req.get('origin') || req.get('referer') || 'unknown',
      ip: req.ip || req.socket.remoteAddress,
      method: req.method,
      path: req.path,
      userAgent: req.get('user-agent'),
      headers: {
        origin: req.get('origin'),
        referer: req.get('referer'),
        host: req.get('host')
      }
    };
    
    
    logCorsViolation(violationDetails);
    
    return res.status(403).json({
      success: false,
      error: 'CORS policy: Origin not allowed',
      message: 'This origin is not authorized to access this resource'
    });
  }
  next(err);
});


app.use(express.json());


app.use(helmet());

// MongoDB detailed logging - captures all request details
app.use(detailedMongoLogger);

// File logging disabled - using MongoDB only
// app.use(logtailLogger); 
// app.use(detailedLogger);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: `${options.windowMs / 60000} minutes`
    });
  },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 3, // limit each IP to 3 failed requests
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
     return res.status(options.statusCode).json({
      success: false,
      error: 'Too many login/signup attempts from this IP, please try again later.',
      retryAfter: `${options.windowMs / 60000} minutes`
    });
  },
});




app.use('/api/auth', authLimiter,LOGS);
app.use('/api/admin',ADMIN );
app.use("/api/user",USER);
app.use("/api/course",COURSE);
app.use("/api/cloud",CLOUD)
app.use("/api/secure",SECURE);

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = createServer(app);

// Setup WebSocket on the same server
try {
  setupWebSocketServer(server);
  console.log('WebSocket server initialized on same port as HTTP');
} catch (error) {
  console.error('Failed to start WebSocket server:', error);
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});