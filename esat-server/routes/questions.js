const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// ✅ 新增的随机路由
router.get('/random', async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 1 } }]);
    res.json(questions);
  } catch (err) {
    console.error('❌ 获取随机题失败', err);
    res.status(500).json({ error: 'Server error when fetching random question' });
  }
});

// ✅ 原有的筛选题路由
router.get('/', async (req, res) => {
  try {
    const { difficulty, tags } = req.query;
    const filter = {};

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    console.error('❌ 获取题目失败', err);
    res.status(500).json({ error: 'Server error when fetching questions' });
  }
});

module.exports = router;





