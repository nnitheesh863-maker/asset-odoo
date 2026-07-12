const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || !user.isActive) {
        return next(new Error('User not found or deactivated'));
      }

      socket.userId = user.id;
      socket.userRole = user.role;
      socket.userDepartmentId = user.departmentId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.join(`user:${socket.userId}`);

    if (socket.userDepartmentId) {
      socket.join(`department:${socket.userDepartmentId}`);
    }

    if (socket.userRole === 'ADMIN') {
      socket.join('admins');
    }

    socket.on('join-room', (room) => {
      socket.join(room);
    });

    socket.on('leave-room', (room) => {
      socket.leave(room);
    });

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userId} (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

const emitToDepartment = (departmentId, event, data) => {
  if (!io) return;
  io.to(`department:${departmentId}`).emit(event, data);
};

const emitToAll = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

module.exports = { initSocket, getIO, emitToUser, emitToDepartment, emitToAll };
