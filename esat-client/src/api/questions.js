const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions?difficulty=medium&tags=mechanics,electricity
router.get('/', async (req, res) => {
  try {
    const { difficulty, tags } = req.query;

    const filter = {};

    if (difficulty) {
      filter.difficulty = difficulty; // "easy", "medium", "hard"
    }

    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagsArray };
    }

    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    console.error('❌ 题目查询失败', err);
    res.status(500).json({ error: '❌ Server error when fetching questions' });
  }
});

module.exports = router;
