import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { sequelize } from './config/database';
import { initializeSocket } from './config/socket';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import flagRoutes from './routes/flags';
import moderationRoutes from './routes/moderation';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Stricter rate limiting for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Initialize Socket.IO
initializeSocket(io);

// Routes
app.use('/api/auth', strictLimiter, authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/flags', authenticateToken, strictLimiter, flagRoutes);
app.use('/api/moderation', authenticateToken, moderationRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Database connection and server start
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // after successful authenticate
    // Sync DB in development OR when FORCE_DB_SYNC=true (useful for demo/docker)
    if (process.env.NODE_ENV === 'development' || process.env.FORCE_DB_SYNC === 'true') {
    console.log('Synchronizing database (alter=true) — this may change schema on startup.');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };