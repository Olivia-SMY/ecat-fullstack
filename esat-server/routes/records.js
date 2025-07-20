// routes/records.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Question = require('../models/Question');
const Record = require('../models/Record');

const { Types } = mongoose; // 推荐方式

router.post('/', async (req, res) => {
  const { userId, answers: submittedAnswers } = req.body;

  try {
    // 转换 questionId 为 ObjectId
    const questionIds = submittedAnswers.map(a => new Types.ObjectId(a.questionId));

    // 查询所有对应的题目
    const questions = await Question.find({ _id: { $in: questionIds } });

    // 映射题目，方便查找
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

  const correct = q.answerIndex;

  return {
    questionId: q._id,
    userAnswerIndex: ans.userAnswerIndex,
    correctAnswerIndex: correct,
    isCorrect: ans.userAnswerIndex === correct
  };
});


    const score = results.filter(r => r.isCorrect).length;

    // 保存记录
    const record = new Record({
      userId,
      answers: results,
      score
    });

    await record.save();

    // 添加 questions 到结果中，前端显示用
    const fullQuestions = questions.map(q => ({
      _id: q._id,
      index: q.index,
      question: q.question,
      options: q.options,
      explanation: q.explanation,
      images: q.images,
      tags: q.tags,
      difficulty: q.difficulty
    }));

    res.status(201).json({
      message: '✅ Record saved',
      score,
      answers: results,
      questions: fullQuestions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Server error' });
  }
});

module.exports = router;
