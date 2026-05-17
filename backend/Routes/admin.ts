import express, { Request, Response } from 'express';
import { Log } from '../DB/LogModel';
import { auth } from '../Midware/Mware';

const router = express.Router();

router.get('/logs', auth, async (req: Request, res: Response) => {
  
  // Allow access for admin emails
  const adminEmails = ['p@gmail.com', 'princesahu17125@gmail.com'];
  if (!req.user?.email || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ 
      error: "Access denied", 
      message: "Only admins can access logs" 
    });
  }
  try {
    const { 
      page = 1, 
      limit = 50, 
      level, 
      type, 
      startDate, 
      endDate 
    } = req.query;

    const query: any = {};
    
    if (level) query.level = level;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await Log.countDocuments(query);

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

router.get('/logs/stats', auth, async (req: Request, res: Response) => {
  const adminEmails = ['p@gmail.com', 'princesahu17125@gmail.com'];
  if (!req.user?.email || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: "Access denied" });
  }
  try {
    const totalLogs = await Log.countDocuments();
    const errorLogs = await Log.countDocuments({ level: 'error' });
    const corsViolations = await Log.countDocuments({ type: 'cors_violation' });
    const requestLogs = await Log.countDocuments({ type: 'request' });

    res.status(200).json({
      totalLogs,
      errorLogs,
      corsViolations,
      requestLogs
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.delete('/clear-logs', auth, async (req: Request, res: Response) => {
  const adminEmails = ['p@gmail.com', 'princesahu17125@gmail.com'];
  if (!req.user?.email || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: "Access denied" });
  }
  const whttodelete =req.query.what as string;
  try {
    if (whttodelete==="all") {
      await Log.deleteMany({});
      return res.status(200).json({ message: "All logs cleared" });
    }

    if (!whttodelete) {
      return res.status(400).json({ error: "No logs specified for deletion" });
    }

    await Log.deleteMany({ _id: { $in: whttodelete.split(',') } });
    res.status(200).json({ message: "Selected logs cleared" });
    
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});
export default router;