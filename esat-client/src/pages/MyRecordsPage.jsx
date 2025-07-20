// src/pages/MyRecords.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const getChoiceLabel = (i) => String.fromCharCode(65 + i); // 0 -> A, 1 -> B...

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setUser(data.user);

      // 获取记录
      const { data: recordData, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ 加载记录失败:', error);
        return;
      }

      setRecords(recordData);

      // 获取所有题目（用于显示题号）
      const res = await fetch('http://localhost:3000/api/questions');
      const questions = await res.json();
      setAllQuestions(questions);
    };

    load();
  }, []);

  const findQuestion = (id) => {
    const strId = id.toString();
    return allQuestions.find(q => q._id?.toString() === strId || q.id?.toString() === strId);
  };

  if (!user) return <p>请先登录</p>;

  return (
    <div style={{ padding: '40px' }}>
      <h1>我的答题记录</h1>

      {records.length === 0 ? (
        <p>暂无记录</p>
      ) : (
        records.map((record, idx) => (
          <div key={idx} style={{ border: '1px solid #ddd', padding: '16px', marginBottom: '24px', borderRadius: '8px' }}>
            <h3>记录 {idx + 1}</h3>
            <p>✅ 得分：{record.score} / {record.total}</p>
            <p>🕒 时间：{new Date(record.created_at).toLocaleString()}</p>

            <h4>答题详情：</h4>
            {record.answers.map((ans, i) => {
              const q = findQuestion(ans.questionId);
              return (
                <p key={i}>
                  Q{q?.index || i + 1}: 你的答案 {getChoiceLabel(ans.userAnswerIndex)}，{ans.isCorrect ? '✅ 正确' : '❌ 错误'}
                </p>
              );
            })}

            <button
              style={{ marginTop: '10px' }}
              onClick={() =>
                navigate('/result', {
                  state: {
                    score: record.score,
                    answers: record.answers,
                    questions: allQuestions,
                  },
                })
              }
            >
              查看答题详情
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyRecords;
