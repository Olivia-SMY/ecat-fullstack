import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/config';

const getChoiceLabel = (i) => i != null ? String.fromCharCode(65 + i) : '—';

const MyRecords = () => {
  const [mode, setMode] = useState('quiz');
  const [quizRecords, setQuizRecords] = useState([]);
  const [mockRecords, setMockRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUser = userData?.user;
      if (!currentUser) return;
      setUser(currentUser);

      const { data: quizData } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      const { data: mockData } = await supabase
        .from('mock_exam_results')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      try {
        const res = await fetch(`${API_BASE}/api/questions`);
        const questions = await res.json();
        setAllQuestions(Array.isArray(questions) ? questions : []);
      } catch (err) {
        console.error('❌ 获取题目失败:', err);
      }

      setQuizRecords(quizData || []);
      setMockRecords(mockData || []);
    };

    load();
  }, []);

  const findQuestion = (id) => {
    const strId = id?.toString();
    return Array.isArray(allQuestions)
      ? allQuestions.find(q => q._id?.toString() === strId || q.id?.toString() === strId)
      : null;
  };

  const formatTime = (s) => `${Math.floor(s / 60)} 分 ${s % 60} 秒`;

  if (!user) return <p>请先登录</p>;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📜 我的答题记录</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setMode('quiz')} style={{
          marginRight: 10,
          padding: '8px 16px',
          backgroundColor: mode === 'quiz' ? '#2f80ed' : '#eee',
          color: mode === 'quiz' ? 'white' : '#333',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer'
        }}>
          ✍️ 练习记录
        </button>
        <button onClick={() => setMode('mock')} style={{
          padding: '8px 16px',
          backgroundColor: mode === 'mock' ? '#2f80ed' : '#eee',
          color: mode === 'mock' ? 'white' : '#333',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer'
        }}>
          💯 模考记录
        </button>
      </div>

      {mode === 'quiz' && (
        <>
          {quizRecords.length === 0 ? (
            <p>暂无记录</p>
          ) : (
            quizRecords.map((record, idx) => (
              <div key={idx} style={{
                border: '1px solid #ddd',
                padding: '16px',
                marginBottom: '24px',
                borderRadius: '8px'
              }}>
                <h3>练习记录 {idx + 1}</h3>
                <p>✅ 得分：{record.score} / {record.total}</p>
                <p>🕒 时间：{new Date(record.created_at).toLocaleString()}</p>

                <h4>答题详情：</h4>
                {Array.isArray(record.answers) ? record.answers.map((ans, i) => {
                  if (!ans || typeof ans !== 'object') return <p key={i}>Q{i + 1}: 数据异常</p>;
                  const q = findQuestion(ans.questionId);
                  return (
                    <p key={i}>
                      Q{q?.index || i + 1}: 你的答案 {getChoiceLabel(ans.userAnswerIndex)}，{ans.isCorrect ? '✅ 正确' : '❌ 错误'}
                    </p>
                  );
                }) : <p>无答题数据</p>}

                <button
                  style={{ marginTop: '10px' }}
                  onClick={() =>
                    navigate('/quiz-result', {
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
        </>
      )}

      {mode === 'mock' && (
        <>
          {mockRecords.length === 0 ? (
            <p>暂无记录</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>考试</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>得分</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>标准分</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>用时</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>提交时间</th>
                </tr>
              </thead>
              <tbody>
                {mockRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{record.exam_id}</td>
                    <td style={{ padding: '8px' }}>{record.score} / 20</td>
                    <td style={{ padding: '8px' }}>{record.scaled_score ?? '—'}</td>
                    <td style={{ padding: '8px' }}>{formatTime(record.elapsed_time)}</td>
                    <td style={{ padding: '8px' }}>{new Date(record.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default MyRecords;