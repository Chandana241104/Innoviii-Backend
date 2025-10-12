const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['mcq','multi','tf','short'], required: true },
  text: String,
  options: [String],
  correct: [Number], // indexes of correct options; not sent to client
  marks: Number
}, {_id:false});

const TestSchema = new mongoose.Schema({
  title: String,
  role: { type: String, enum: ['member','mentor'], required: true },
  description: String,
  durationMinutes: Number,
  questions: [QuestionSchema],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Test', TestSchema);
