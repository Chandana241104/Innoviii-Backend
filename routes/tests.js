const express = require('express');
const Test = require('../models/Test');

const router = express.Router();

// Get all published tests for a role
router.get('/', async (req, res, next) => {
  try {
    const role = req.query.role || 'member';
    const tests = await Test.find({ 
      role, 
      published: true 
    }).select('-questions.correct');
    
    res.json({ 
      success: true, 
      tests 
    });
  } catch (err) { 
    next(err); 
  }
});

// Get test details by ID (without correct answers)
router.get('/:id', async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    // Remove correct answers before sending to client
    const safeTest = test.toObject();
    if (Array.isArray(safeTest.questions)) {
      safeTest.questions.forEach(q => { 
        delete q.correct; 
      });
    }
    
    res.json({ 
      success: true, 
      test: safeTest 
    });
  } catch (err) { 
    next(err); 
  }
});

module.exports = router;