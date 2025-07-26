// scripts/importMock2023S1a.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('./models/Question');
const MockExam = require('./models/MockExam');

console.log('[DEBUG] MONGO_URI =', process.env.MONGO_URI);

// 读取 JSON 文件
const filePath = path.join(__dirname, 'data', 'ENGAA2016_Section1_A_updated.json');
const rawQuestions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// 连接 MongoDB 并导入题目和创建 MockExam
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // 1. 清空旧的 mock 题目和 mockExam
    await Question.deleteMany({ source: 'eng_2016_s1a' });
    await MockExam.deleteMany({ source: 'eng_2016_s1a' });
    console.log('🧹 已清空旧的 mock 题目和 mockExam');

    // 2. 导入新题目
    const formatted = rawQuestions.map(q => ({
      question: q.question || q.text || '',
      options: q.options || [],
      answerIndex: q.answerIndex,
      explanation: q.explanation || '',
      images: q.images || [],
      tags: [],
      difficulty: 'medium',
      difficultyScore: 3.0,
      isMock: true,
      source: 'eng_2016_s1a', // 这里标记为 section 1A
    }));

    const inserted = await Question.insertMany(formatted);
    console.log(`✅ 成功导入 ${inserted.length} 道题`);
    console.log('🧾 题目ID列表:\n', inserted.map(q => q._id.toString()).join('\n'));

    // 3. 创建新的 MockExam 文档
    const mockExam = new MockExam({
      title: '2016 S1A Mock Exam',
      source: 'eng_2016_s1a',
      questions: inserted.map(q => q._id),
      timeLimit: 2400 // 按需调整
    });
    await mockExam.save();
    console.log('✅ 新的 MockExam 已创建，ID:', mockExam._id.toString());

    process.exit();
  })
  .catch(err => {
    console.error('❌ 导入失败:', err);
    process.exit(1);
  });

