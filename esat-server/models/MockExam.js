const mongoose = require('mongoose');

const mockExamSchema = new mongoose.Schema({
  _id: String,
  title: String,
  timeLimit: Number,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});

module.exports = mongoose.model('MockExam', mockExamSchema);
