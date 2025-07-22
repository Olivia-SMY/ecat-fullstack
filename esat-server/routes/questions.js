const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// ✅ 获取一题随机题目
router.get('/random', async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 1 } }]);
    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found' });
    }
    res.json(questions);
  } catch (err) {
    console.error('❌ 获取随机题失败', err);
    res.status(500).json({ error: 'Server error when fetching random question' });
  }
});

// ✅ 支持多种筛选条件：标签、难度等级、定量难度评分
router.get('/', async (req, res) => {
  try {
    const { difficulty, tags, minScore, maxScore } = req.query;
    const filter = {};

    // 按标签筛选
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // 按离散等级筛选
    if (difficulty) {
      filter.difficulty = difficulty; // e.g., "easy", "medium", "hard"
    }

    // 按定量评分筛选（difficultyScore）
    if (minScore && maxScore) {
      const min = parseFloat(minScore);
      const max = parseFloat(maxScore);
      if (!isNaN(min) && !isNaN(max)) {
        filter.difficultyScore = { $gte: min, $lte: max };
      }
    }
    // ✅ 打印 filter
    console.log('筛选条件:', filter);

    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    console.error('❌ 获取题目失败', err);
    res.status(500).json({ error: 'Server error when fetching questions' });
  }
});

module.exports = router;





