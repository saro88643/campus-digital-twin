import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import campusRoutes from './routes/campusRoutes.js';
import blockRoutes from './routes/blockRoutes.js';
import floorRoutes from './routes/floorRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import facilityRoutes from './routes/facilityRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import digitalTwinRoutes from './routes/digitalTwinRoutes.js';
import navigationRoutes from './routes/navigationRoutes.js';
import importExportRoutes from './routes/importExportRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import assetRoutes from './routes/assetRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet()); // Set security headers
app.use(cors()); // Enable CORS
app.use(mongoSanitize()); // Prevent NoSQL injection

// Body parser
app.use(express.json({ limit: '10mb' })); // Support base64 floor plan images

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/campus', campusRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/assets', assetRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// 404 Catch-all handler
app.use((req, res, next) => {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  next(error);
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
