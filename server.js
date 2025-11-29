require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const submissionRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middleware - ADD THIS BEFORE DB CONNECTION
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Connect to database with error handling
try {
  connectDB();
} catch (error) {
  console.error('Database connection failed:', error.message);
  // Don't crash the server, just log the error
}

// Database connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Innoviii Backend API is running successfully! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    documentation: 'Use /api/ endpoints to access the API',
    endpoints: {
      health: '/api/health',
      tests: '/api/tests',
      auth: '/api/auth',
      admin: '/api/admin',
      submissions: '/api/submissions'
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

if (process.env.NODE_ENV === 'production') {
  // Export for Vercel serverless
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  });
}
