// importQuestions.js
require('dotenv').config();
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

    // 不清空旧题，直接追加
    await Question.insertMany(questions);
    console.log(`✅ ${questions.length} questions imported`);

    process.exit();
  })
  .catch(err => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });
