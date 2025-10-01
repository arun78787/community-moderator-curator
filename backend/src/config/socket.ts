import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';


interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function initializeSocket(io: Server) {
  // Authentication middleware for socket connections
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join role-based rooms
    if (socket.userRole === 'moderator' || socket.userRole === 'admin') {
      socket.join('moderators');
    }
    if (socket.userRole === 'admin') {
      socket.join('admins');
    }

    // Join user-specific room for notifications
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
}

// Helper functions to emit events
export function emitToModerators(io: Server, event: string, data: any) {
  io.to('moderators').emit(event, data);
}

export function emitToUser(io: Server, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToAdmins(io: Server, event: string, data: any) {
  io.to('admins').emit(event, data);
}