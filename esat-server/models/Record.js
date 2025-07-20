const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  questionId: mongoose.Schema.Types.Mixed,  // 可以是 String 或 Number
  userAnswerIndex: Number,      // 用户提交的选项索引
  correctAnswerIndex: Number,   // 正确选项索引（用于后期分析）
  isCorrect: Boolean            // 是否答对
});

const RecordSchema = new mongoose.Schema({
  userId: String,               // 用户 ID（Supabase UID 或自定义）
  timestamp: { type: Date, default: Date.now },
  score: Number,                // 总得分（答对题目数量）
  answers: [AnswerSchema]       // 每道题的答题信息
});

module.exports = mongoose.model('Record', RecordSchema);
