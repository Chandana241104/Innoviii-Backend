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

// Import models and seed function
const Test = require('./models/Test');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration - UPDATE THIS with your frontend URL
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://innoviii-frontend.vercel.app'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

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

// Auto-create sample tests if none exist
const createSampleTests = async () => {
  try {
    const testCount = await Test.countDocuments();
    if (testCount === 0) {
      console.log('No tests found. Creating sample tests...');
      
      const memberTest = new Test({
        title: 'Member Entrance Test',
        role: 'member',
        description: 'Basic assessment for member candidates',
        durationMinutes: 60,
        published: true,
        questions: [
          {
            id: 'q1',
            type: 'short',
            text: 'Tell us about your programming experience.',
            marks: 10
          },
          {
            id: 'q2', 
            type: 'short',
            text: 'Why do you want to join our community?',
            marks: 10
          }
        ]
      });

      const mentorTest = new Test({
        title: 'Mentor Technical Test', 
        role: 'mentor',
        description: 'Technical assessment for mentor candidates',
        durationMinutes: 60,
        published: true,
        questions: [
          {
            id: 'q1',
            type: 'short',
            text: 'Explain your experience with mentoring.',
            marks: 10
          },
          {
            id: 'q2',
            type: 'short', 
            text: 'What technical domains are you strongest in?',
            marks: 10
          }
        ]
      });

      await memberTest.save();
      await mentorTest.save();
      console.log('Sample tests created successfully!');
    }
  } catch (error) {
    console.error('Error creating sample tests:', error);
  }
};

// Initialize sample tests after DB connection
mongoose.connection.once('open', () => {
  console.log('MongoDB connected - initializing sample data...');
  createSampleTests();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);

// Health check route with DB status
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
