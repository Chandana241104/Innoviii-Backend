const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// All admin routes require authentication
router.use(authMiddleware);

// Get submissions with filters
router.get('/submissions', async (req, res, next) => {
  try {
    const { testId, status, name, email } = req.query;
    const query = {};
    
    if (testId) query.testId = testId;
    if (status) query.status = status;
    if (name) query.takerName = new RegExp(name, 'i');
    if (email) query.takerEmail = new RegExp(email, 'i');

    const submissions = await Submission.find(query)
      .populate('testId')
      .sort({ submittedAt: -1 });
    
    res.json({ 
      success: true, 
      submissions 
    });
  } catch (err) { 
    next(err); 
  }
});

// Get single submission by ID
router.get('/submissions/:id', async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('testId');
    
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }
    
    res.json({ 
      success: true, 
      submission 
    });
  } catch (err) { 
    next(err); 
  }
});

// Grade manual answers
router.post('/submissions/:id/grade', [
  body('manualScore').isNumeric().isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found' 
      });
    }

    submission.manualScore = Number(req.body.manualScore);
    submission.totalScore = (submission.autoScore || 0) + submission.manualScore;
    submission.status = 'graded';
    
    await submission.save();

    res.json({ 
      success: true, 
      submission 
    });
  } catch (err) { 
    next(err); 
  }
});

// Create new test
router.post('/tests', [
  body('title').notEmpty().trim(),
  body('role').isIn(['member', 'mentor']),
  body('description').optional().trim(),
  body('durationMinutes').optional().isInt({ min: 1 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const test = new Test(req.body);
    await test.save();

    res.status(201).json({ 
      success: true, 
      test 
    });
  } catch (err) { 
    next(err); 
  }
});

// Update test
router.put('/tests/:id', async (req, res, next) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    res.json({ 
      success: true, 
      test 
    });
  } catch (err) { 
    next(err); 
  }
});

// Delete test
router.delete('/tests/:id', async (req, res, next) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    // Also delete related submissions
    await Submission.deleteMany({ testId: req.params.id });

    res.json({ 
      success: true, 
      message: 'Test and related submissions deleted successfully' 
    });
  } catch (err) { 
    next(err); 
  }
});

// Export submissions as CSV
router.get('/export', async (req, res, next) => {
  try {
    const { testId } = req.query;
    if (!testId) {
      return res.status(400).json({ 
        success: false, 
        message: 'testId is required' 
      });
    }

    const submissions = await Submission.find({ testId })
      .populate('testId')
      .lean();

    if (submissions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No submissions found for this test' 
      });
    }

    // Create CSV content
    const headers = [
      'Name',
      'Email', 
      'Test Title',
      'Auto Score',
      'Manual Score',
      'Total Score',
      'Status',
      'Submitted At'
    ];

    const csvData = submissions.map(sub => [
      sub.takerName,
      sub.takerEmail,
      sub.testId?.title || 'Unknown Test',
      sub.autoScore || 0,
      sub.manualScore || 0,
      sub.totalScore || 0,
      sub.status,
      new Date(sub.submittedAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=submissions_${testId}_${Date.now()}.csv`);
    res.send(csvContent);

  } catch (err) { 
    console.error('Export error:', err);
    next(err); 
  }
});

module.exports = router;