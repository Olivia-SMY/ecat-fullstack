// routes/records.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Question = require('../models/Question');
const Record = require('../models/Record');

const { Types } = mongoose;

// ✅ POST: 提交练习记录（判分并保存）
router.post('/', async (req, res) => {
  const { userId, answers: submittedAnswers } = req.body;

  try {
    const questionIds = submittedAnswers.map(a => new Types.ObjectId(a.questionId));

    // 获取题目
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    // 自动判分
    const results = submittedAnswers.map(ans => {
      const qid = ans.questionId.toString();
      const q = questionMap[qid];
      if (!q) {
        throw new Error(`题目未找到: ${qid}`);
      }

      return {
        questionId: q._id,
        userAnswerIndex: ans.userAnswerIndex,
        correctAnswerIndex: q.answerIndex,
        isCorrect: ans.userAnswerIndex === q.answerIndex,
      };
    });

    const score = results.filter(r => r.isCorrect).length;

    // 保存记录
    const record = new Record({
      userId,
      answers: results,
      score,
    });

    await record.save();

    // 返回信息
    const fullQuestions = questions.map(q => ({
      _id: q._id,
      index: q.index,
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      images: q.images,
      tags: q.tags,
      difficulty: q.difficulty,
    }));

    res.status(201).json({
      message: '✅ Record saved',
      score,
      answers: results,
      questions: fullQuestions,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Server error' });
  }
});

// ✅ GET: 获取用户答题记录（用于“我的记录”页面）
router.get('/', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: '缺少 userId 参数' });
  }

  try {
    const records = await Record.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20); // 可根据需要调整数量

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '获取记录失败' });
  }
});

module.exports = router;
