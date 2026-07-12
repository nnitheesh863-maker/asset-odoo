const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('@prisma/client');
const http = require('http');
const app = require('./app');
const { initSocket } = require('./sockets');
const { startAllJobs } = require('./jobs');

const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    startAllJobs();

    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => process.exit(0));
});

startServer();
