const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: String,
  answer: mongoose.Schema.Types.Mixed // number, [numbers], string
}, {_id:false});

const SubmissionSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
  role: String,
  takerName: String,
  takerEmail: String,
  answers: [AnswerSchema],
  autoScore: { type: Number, default: 0 },
  manualScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','partially_graded','graded'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
