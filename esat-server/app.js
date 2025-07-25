const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ 配置允许的前端来源（Netlify + 本地开发）
const allowedOrigins = [
  'http://localhost:5173', // 本地调试用
  'https://smyesatweb2.netlify.app' // 你部署到 Netlify 的前端地址
];

// ✅ 配置 CORS 中间件
app.use(cors({
  origin: allowedOrigins,
}));

app.use(express.json());

// ✅ 连接 MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');

  // ✅ 启动服务器
  app.listen(3000, () => {
    console.log('🚀 Server running at http://localhost:3000');
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ 注册路由
const questionRoutes = require('./routes/questions');
const recordRoutes = require('./routes/records');
const mockExamsRoutes = require('./routes/mockExams');
const mockExamStatusRoutes = require('./routes/mockExamStatus');

app.use('/api/questions', questionRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/mock-exams', mockExamsRoutes);
app.use('/api/mock-exam-status', mockExamStatusRoutes);


