const express = require('express');
const { body, validationResult } = require('express-validator');
const Test = require('../models/Test');
const Submission = require('../models/Submission');

const router = express.Router();

// Submit answers for a test
router.post('/:testId/submit', [
  body('takerName').notEmpty().trim(),
  body('takerEmail').isEmail().normalizeEmail(),
  body('answers').isArray()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { takerName, takerEmail, answers } = req.body;
    const test = await Test.findById(req.params.testId);
    
    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    // Auto-grade answers
    let autoScore = 0;
    for (const answer of answers) {
      const question = test.questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      if (['mcq', 'tf'].includes(question.type)) {
        // For single choice questions
        if (Array.isArray(question.correct) && 
            question.correct.length > 0 && 
            question.correct[0] === answer.answer) {
          autoScore += question.marks || 0;
        }
      } else if (question.type === 'multi') {
        // For multiple choice questions (order insensitive)
        const correctAnswers = (question.correct || []).slice().sort().join(',');
        const givenAnswers = (Array.isArray(answer.answer) ? answer.answer : [])
          .slice().sort().join(',');
        if (correctAnswers === givenAnswers) {
          autoScore += question.marks || 0;
        }
      }
      // Short answer questions are not auto-graded
    }

    const submission = new Submission({
      testId: test._id,
      role: test.role,
      takerName,
      takerEmail,
      answers,
      autoScore,
      totalScore: autoScore, // Manual score will be added later
      status: autoScore > 0 ? 'partially_graded' : 'pending'
    });

    await submission.save();

    res.status(201).json({
      success: true,
      submissionId: submission._id,
      autoScore,
      message: 'Test submitted successfully'
    });
  } catch (err) { 
    next(err); 
  }
});

module.exports = router;