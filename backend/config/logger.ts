import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { Log } from '../DB/LogModel';
import { Request, Response, NextFunction } from 'express';

console.log('MongoDB logging enabled');

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}


const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const detailedLogStream = fs.createWriteStream(
  path.join(logsDir, 'detailed.log'),
  { flags: 'a' }
);




morgan.token('real-ip', (req) => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
         (req.headers['x-real-ip'] as string) ||
         req.socket.remoteAddress || 
         'unknown';
});


morgan.token('user-agent', (req) => {
  return req.headers['user-agent'] || 'unknown';
});


morgan.token('referer', (req:any) => {
  return req.headers['referer'] || req.headers['referrer'] || 'direct';
});


morgan.token('body', (req: any) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
  
    const body = { ...req.body };
    if (body.password) body.password = '[HIDDEN]';
    if (body.confirmPassword) body.confirmPassword = '[HIDDEN]';
    return JSON.stringify(body);
  }
  return '-';
});

morgan.token('query', (req: any) => {
  return Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '-';
});


morgan.token('user', (req: any) => {
  if (req.user) {
    return JSON.stringify({ 
      id: req.user.id || req.userId || 'guest', 
      username: req.user.username || 'guest',
      email: req.user.email || 'guest',
      img: req.user.img || 'N/A'
    });
  }
  return JSON.stringify({ id: 'guest', username: 'guest', email: 'guest', img: 'N/A' });
});


morgan.token('all',(req:any) =>{
  return JSON.stringify({req});
});

morgan.token('language', (req) => {
  return req.headers['accept-language']?.split(',')[0] || 'unknown';
});


morgan.token('device', (req) => {
  const ua = req.headers['user-agent'] || '';
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
});


morgan.token('browser', (req) => {
  const ua = req.headers['user-agent'] || '';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera')) return 'Opera';
  return 'Unknown';
});


morgan.token('os', (req) => {
  const ua = req.headers['user-agent'] || '';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'MacOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS')) return 'iOS';
  return 'Unknown';
});


let requestCounter = 0;
morgan.token('request-id', () => {
  return `REQ-${Date.now()}-${++requestCounter}`;
});

const standardFormat = ':real-ip | :method | :url | :status | :response-time ms | :date[iso]';


const detailedFormat = [
  '=== REQUEST ===',
  
  'ID: :request-id',
  'Timestamp: :date[iso]',
  'IP: :real-ip',
  'User: :user',
  'Method: :method',
  'URL: :url',
  'Query: :query',
  'Body: :body',
  'Status: :status',
  'Response Time: :response-time ms',
  'Response Size: :res[content-length] bytes',
  'Referer: :referer',
  'User Agent: :user-agent',
  'Browser: :browser',
  'OS: :os',
  'Device: :device',
  'Language: :language',
  '================\n'
].join('\n');


export const fileLogger = morgan(standardFormat, {
  stream: accessLogStream
});


export const detailedLogger = morgan(detailedFormat, {
  stream: detailedLogStream
});

// Logtail logger - now saves to MongoDB
export const logtailLogger = morgan(standardFormat, {
  stream: {
    write: async (message: string) => {
      // Write to file
      accessLogStream.write(message);
      
      // Parse the morgan log message
      // Format: :real-ip | :method | :url | :status | :response-time ms | :date[iso]
      try {
        const parts = message.trim().split(' | ');
        if (parts.length >= 5) {
          await Log.create({
            level: 'info',
            type: 'request',
            ip: parts[0] || 'unknown',
            method: parts[1] || 'GET',
            url: parts[2] || '/',
            status: parseInt(parts[3]) || 200,
            responseTime: parseFloat(parts[4]?.replace(' ms', '')) || 0,
            timestamp: new Date(parts[5]) || new Date(),
            message: message.trim()
          });
        }
      } catch (error) {
        // Silently fail - don't break the app if MongoDB logging fails
        console.error('Failed to save log to MongoDB:', error);
      }
    }
  }
});

// CORS violation logger
const corsLogStream = fs.createWriteStream(
  path.join(logsDir, 'cors-violations.log'),
  { flags: 'a' }
);

export const logCorsViolation = (details: any) => {
  const logEntry = [
    '\n' + '='.repeat(80),
    `CORS VIOLATION - ${new Date().toISOString()}`,
    '='.repeat(80),
    `Origin: ${details.origin}`,
    `IP Address: ${details.ip}`,
    `Method: ${details.method}`,
    `Path: ${details.path}`,
    `User-Agent: ${details.userAgent}`,
    `Referer: ${details.headers.referer || 'none'}`,
    `Host: ${details.headers.host}`,
    '='.repeat(80) + '\n'
  ].join('\n');

  corsLogStream.write(logEntry);
  
  // Save to MongoDB
  try {
    Log.create({
      level: 'error',
      type: 'cors_violation',
      timestamp: new Date(),
      ip: details.ip,
      method: details.method,
      url: details.path,
      userAgent: details.userAgent,
      referer: details.headers.referer,
      corsDetails: details,
      message: `CORS Violation from ${details.origin}`
    }).catch(err => console.error('Failed to save CORS log:', err));
  } catch (error) {
    // Silently fail
  }
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(logEntry);
  }
};

// Detailed MongoDB logger middleware - captures ALL request details
export const detailedMongoLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Helper to get IP
  const getIP = () => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
           (req.headers['x-real-ip'] as string) ||
           req.socket.remoteAddress || 
           'unknown';
  };

  // Helper to get browser info
  const getBrowser = () => {
    const ua = req.headers['user-agent'] || '';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  };

  // Helper to get OS info
  const getOS = () => {
    const ua = req.headers['user-agent'] || '';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  };

  // Helper to get device type
  const getDevice = () => {
    const ua = req.headers['user-agent'] || '';
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  // Listen to response finish event
  res.on('finish', async () => {
    const responseTime = Date.now() - startTime;
    
    // Sanitize request body
    const sanitizeBody = (body: any) => {
      if (!body) return undefined;
      const sanitized = { ...body };
      if (sanitized.password) sanitized.password = '[HIDDEN]';
      if (sanitized.confirmPassword) sanitized.confirmPassword = '[HIDDEN]';
      if (sanitized.token) sanitized.token = '[HIDDEN]';
      return sanitized;
    };

    // Determine log level based on status code
    let level: 'info' | 'warn' | 'error' = 'info';
    if (res.statusCode >= 500) level = 'error';
    else if (res.statusCode >= 400) level = 'warn';

    try {
      await Log.create({
        level,
        type: 'request',
        timestamp: new Date(),
        
        // Request details
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime,
        ip: getIP(),
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'] || req.headers['referrer'],
        
        // User details (if authenticated)
        userId: (req as any).user?._id,
        username: (req as any).user?.username,
        userEmail: (req as any).user?.email,
        userImg: (req as any).user?.img,
        
        // Request data
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? sanitizeBody(req.body) : undefined,
        
        // Browser/Device info
        browser: getBrowser(),
        os: getOS(),
        device: getDevice(),
        language: req.headers['accept-language']?.split(',')[0],
        
        // Message summary
        message: `${req.method} ${req.url} - ${res.statusCode} (${responseTime}ms)`
      });
    } catch (error) {
      // Silently fail - don't break the app
      console.error('Failed to save detailed log to MongoDB:', error);
    }
  });

  next();
};
