const mongoose = require('mongoose');

const mockExamSchema = new mongoose.Schema({
  title: String,
  timeLimit: Number,
  source: String, // 添加 source 字段
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});

module.exports = mongoose.model('MockExam', mockExamSchema);
