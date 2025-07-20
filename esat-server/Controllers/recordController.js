const Record = require('../models/Record');
const Question = require('../models/Question');

const submitRecord = async (req, res) => {
  const { userId, answers: submittedAnswers } = req.body;

  try {
    const questionIds = submittedAnswers.map(a => a.questionId);
    const questions = await Question.find({ id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => questionMap[q.id] = q);

    const results = submittedAnswers.map(ans => {
      const q = questionMap[ans.questionId];
      const correct = q?.answerIndex;
      return {
        questionId: ans.questionId,
        userAnswerIndex: ans.userAnswerIndex,
        correctAnswerIndex: correct,
        isCorrect: ans.userAnswerIndex === correct
      };
    });

    const score = results.filter(r => r.isCorrect).length;

    const record = new Record({ userId, answers: results, score });
    await record.save();

    res.status(201).json({ message: "✅ Record saved", score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { submitRecord };
