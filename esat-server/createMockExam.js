// scripts/createMockExam.js
require('dotenv').config();
const mongoose = require('mongoose');
const MockExam = require('./models/MockExam'); // ✅ 正确路径

const questionIds = [
  "687f52766b9b969a54cae223",
  "687f52766b9b969a54cae224",
  "687f52766b9b969a54cae225",
  "687f52766b9b969a54cae226",
  "687f52766b9b969a54cae227",
  "687f52766b9b969a54cae228",
  "687f52766b9b969a54cae229",
  "687f52766b9b969a54cae22a",
  "687f52766b9b969a54cae22b",
  "687f52766b9b969a54cae22c",
  "687f52766b9b969a54cae22d",
  "687f52766b9b969a54cae22e",
  "687f52766b9b969a54cae22f",
  "687f52766b9b969a54cae230",
  "687f52766b9b969a54cae231",
  "687f52766b9b969a54cae232",
  "687f52766b9b969a54cae233",
  "687f52766b9b969a54cae234",
  "687f52766b9b969a54cae235",
  "687f52766b9b969a54cae236"
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // 先删除已有的同 ID 模考，避免重复创建失败
    await MockExam.deleteOne({ _id: 'mock_2023_s1a' });

    await MockExam.create({
      _id: 'mock_2023_s1a',
      title: 'ENGAA 2023 Section 1A',
      timeLimit: 1800, // 单位：秒
      questions: questionIds.map(id => new mongoose.Types.ObjectId(id))
    });

    console.log('✅ Mock exam created successfully');
    process.exit();
  })
  .catch(err => {
    console.error('❌ Failed to create mock exam:', err);
    process.exit(1);
  });
