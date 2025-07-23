const express = require('express');
const router = express.Router();
const MockExam = require('../models/MockExam');

// 获取某个模拟考试的题目内容
router.get('/:id', async (req, res) => {
  try {
    const exam = await MockExam.findById(req.params.id).populate('questions');
    if (!exam) return res.status(404).json({ error: '模拟考试不存在' });

    const questions = exam.questions.map(q => ({
      text: q.text || q.question || '', // 尽量使用统一字段 text，如果不存在就 fallback
      options: q.options || [],
      answerIndex: q.answerIndex,       // 提供 index 而不是答案内容，前端自己展示
      images: q.images || [],
      explanation: q.explanation || ''
    }));

    res.json({
      title: exam.title,
      timeLimit: exam.timeLimit || 1800,
      questions
    });
  } catch (err) {
    res.status(500).json({ error: '服务器错误：' + err.message });
  }
});

module.exports = router;
