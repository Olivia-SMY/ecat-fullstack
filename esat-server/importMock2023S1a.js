// scripts/importMock2023S1a.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('../models/Question'); // ✅ 确保路径正确（你当前写的是 './models/Question'，根据结构可能需要 '../models/Question'）

console.log('[DEBUG] MONGO_URI =', process.env.MONGO_URI);

// 读取 JSON 文件
const filePath = path.join(__dirname, 'data', 'Q2023S1a.json');
const rawQuestions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// 连接 MongoDB 并导入题目
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    const formatted = rawQuestions.map(q => ({
      text: q.question || q.text || '', // ✅ 统一字段为 text
      options: q.options || [],
      answerIndex: q.answerIndex,
      explanation: q.explanation || '',
      images: q.images || [],
      tags: [],
      difficulty: 'medium',
      difficultyScore: 3.0,
      isMock: true,
      source: 'mock_2023_s1a',
    }));

    const inserted = await Question.insertMany(formatted);
    console.log(`✅ 成功导入 ${inserted.length} 道题`);
    console.log('🧾 题目ID列表:\n', inserted.map(q => q._id.toString()).join('\n'));

    process.exit();
  })
  .catch(err => {
    console.error('❌ 导入失败:', err);
    process.exit(1);
  });

