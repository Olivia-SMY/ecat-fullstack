// routes/questions.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions?difficulty=medium&tags=mechanics,electricity
router.get('/', async (req, res) => {
  try {
    const { difficulty, tags } = req.query;
    const filter = {};

    // 按难度筛选
    if (difficulty) {
      filter.difficulty = difficulty;
    }

    // 按标签筛选（多个标签用 , 分隔）
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray }; // 至少命中一个标签即可
    }

    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    console.error('❌ 获取题目失败', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;



