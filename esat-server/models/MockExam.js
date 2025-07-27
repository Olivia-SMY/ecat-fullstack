const mongoose = require('mongoose');

const mockExamSchema = new mongoose.Schema({
  title: String,
  timeLimit: Number,
  source: String, 
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});

module.exports = mongoose.model('MockExam', mockExamSchema);
