// Import questions script placeholder
// importQuestions.js
require('dotenv').config();
console.log('[DEBUG] MONGO_URI =', process.env.MONGO_URI);  // 添加这一行调试
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('./models/Question');

// 读取 data/questions.json 的绝对路径
const filePath = path.join(__dirname, 'data', 'questions.json');
const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // 清空旧题（可选）
    await Question.deleteMany({});
    console.log('🗑️ Existing questions cleared');

    // 插入新题
    await Question.insertMany(questions);
    console.log(`✅ ${questions.length} questions imported`);

    process.exit();
  })
  .catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });
