// src/api/records.js
import axios from 'axios';
import { API_BASE } from '../utils/config'; // ✅ 引入 API_BASE

export const submitRecord = async (userId, answers) => {
  const payload = {
    userId,
    answers: Object.entries(answers).map(([questionId, userAnswerIndex]) => ({
      questionId,
      userAnswerIndex
    }))
  };

  try {
    const res = await axios.post(`${API_BASE}/api/records`, payload); // ✅ 使用动态地址
    return res.data;
  } catch (err) {
    console.error('❌ 提交失败', err);
    throw err;
  }
};


