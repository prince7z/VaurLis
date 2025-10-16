import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { email } from 'zod';


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



export const logtailLogger = fileLogger;


// CORS violation logger
const corsLogStream = fs.createWriteStream(
  path.join(logsDir, 'cors-violations.log'),
  { flags: 'a' }
);

export const logCorsViolation = (details: any) => {
  const logEntry = [
    '\n' + '='.repeat(80),
    `🚫 CORS VIOLATION - ${new Date().toISOString()}`,
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
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(logEntry);
  }
};
