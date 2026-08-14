import dotenv from 'dotenv';
import app from './app.js';
import connectDB, { disconnectDB } from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Clean shutdown function
const cleanShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Starting clean shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await disconnectDB();
    console.log('Database connection closed.');
    process.exit(0);
  });
};

// Handle process termination signals
process.on('SIGINT', () => cleanShutdown('SIGINT'));
process.on('SIGTERM', () => cleanShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});
