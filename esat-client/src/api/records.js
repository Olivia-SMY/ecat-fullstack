// src/api/records.js
import axios from 'axios';

export const submitRecord = async (userId, answers) => {
  const payload = {
    userId,
    answers: Object.entries(answers).map(([questionId, userAnswerIndex]) => ({
      questionId,
      userAnswerIndex
    }))
  };

  try {
    const res = await axios.post('http://localhost:3000/api/records', payload);
    return res.data;
  } catch (err) {
    console.error('❌ 提交失败', err);
    throw err;
  }
};

