import { Link, useParams, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import axios from 'axios';
import { API_BASE } from '../utils/config';
import { supabase } from '../utils/supabase';
import { getScaledScore } from '../utils/scaledScore'; 




function LatexText({ text }) {
  if (!text) return null;
  const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return <BlockMath key={i} math={part.slice(2, -2)} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1)} />;
        } else {
          return <span key={i}>{part}</span>;
        }
      })}
    </>
  );
}

function MockExamPage() {
  
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 初始值无所谓，后面会覆盖
  const [examTimeLimit, setExamTimeLimit] = useState(1800);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [examTitle, setExamTitle] = useState('');
  const [userId, setUserId] = useState(null);

  // 用于防止多次初始化
  const initializedRef = useRef(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/mock-exams/${examId}`);
        setQuestions(res.data.questions);
        setExamTitle(res.data.title || '');
        setExamTimeLimit(res.data.timeLimit || 1800);

        // 恢复 localStorage
        const saved = localStorage.getItem(`mockExamState_${examId}`);
        if (saved) {
          try {
            const state = JSON.parse(saved);
            if (state.examId === examId) {
              setAnswers(state.answers || []);
              setCurrent(state.current || 0);
              setTimeLeft(state.timeLeft || res.data.timeLimit || 1800);
              setStartTime(state.startTime || Date.now());
              initializedRef.current = true;
              return;
            }
          } catch (e) {}
        }
        // 没有保存的进度，初始化
        setAnswers(Array(res.data.questions.length).fill(null));
        setTimeLeft(res.data.timeLimit || 1800);
        setStartTime(Date.now());
        initializedRef.current = true;
      } catch (err) {
        console.error('❌ 模考加载失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
    // eslint-disable-next-line
  }, [examId]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    fetchUser();
  }, []);

  // 保存进度
  useEffect(() => {
    if (!initializedRef.current) return;
    const saveState = {
      examId,
      answers,
      current,
      timeLeft,
      startTime,
    };
    localStorage.setItem(`mockExamState_${examId}`, JSON.stringify(saveState));
  }, [answers, current, timeLeft, startTime, examId]);

  // 计时器
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const handleAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const confirmAndSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0 && !window.confirm(`还有 ${unanswered} 题未作答，是否仍要提交？`)) return;
    submitResult();
  };

  const handleAutoSubmit = () => {
    submitResult();
  };

  const submitResult = async () => {
  const elapsedTime = Date.now() - startTime;

  if (!userId) {
    console.error('❌ 获取用户信息失败: userId is null');
    return;
  }

  const score = answers.filter((a, i) => a === questions[i]?.answerIndex).length;
  const scaled = getScaledScore(score); // ✅ 计算标准分

  // ✅ 插入 Supabase 并附带 scaled_score 字段
  const { error } = await supabase.from('mock_exam_results').insert({
    user_id: userId,
    exam_id: examId,
    score,
    scaled_score: scaled, // ✅ 这里加上
    elapsed_time: Math.floor(elapsedTime / 1000), // 建议以秒为单位
    answers,
    created_at: new Date().toISOString(), // 可选，明确创建时间
  });

  if (error) {
    console.error('❌ 保存考试结果失败:', error);
  } else {
    console.log('✅ 模考结果已保存');
  }

  navigate('/mock-result', {
    state: {
      questions,
      answers,
      elapsedTime,
      title: examTitle,
    }
  });
  localStorage.removeItem(`mockExamState_${examId}`);
};

useEffect(() => {
  const interval = setInterval(() => {
    if (userId && examId) {
      console.log('上报状态', { userId, examId, current, answers, timeLeft });
      fetch(`${API_BASE}/api/mock-exam-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          exam_id: examId,
          current,
          answers,
          timeLeft,
          lastActive: Date.now(),
        }),
      }).then(res => res.json()).then(data => {
        console.log('上报响应', data);
      });
    }
  }, 30000);
  return () => clearInterval(interval);
}, [userId, examId, current, answers, timeLeft]);


  const question = questions[current];

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>正在加载试卷...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: 100, borderRight: '1px solid #ccc', padding: 10, background: '#f9f9f9' }}>
        {questions.map((q, idx) => {
          // 只有 answers 有内容时才判断
          const answered = Array.isArray(answers) && answers[idx] !== null && answers[idx] !== undefined;
          const isCurrent = idx === current;
          return (
            <div
              key={q._id || idx}
              onClick={() => setCurrent(idx)}
              style={{
                cursor: 'pointer',
                marginBottom: 8,
                padding: '6px 10px',
                borderRadius: 4,
                fontWeight: isCurrent ? 'bold' : 'normal',
                backgroundColor: isCurrent
                  ? '#d0eaff'
                  : answered
                  ? '#e0f5e9'
                  : 'transparent',
                color: answered ? '#4caf50' : '#888',
                border: isCurrent ? '1px solid #3399ff' : '1px solid transparent',
                textAlign: 'center',
                fontSize: 14,
              }}
            >
              Q{idx + 1}
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1, padding: 30, maxWidth: 1000, margin: '0 auto' }}>
        <Link to="/" style={{ marginBottom: 20, display: 'inline-block' }}>⬅ 返回首页</Link>
        <h2>{examTitle || '模拟考试'}</h2>

        {question && (
          <>
            <div style={{ marginBottom: 20, fontSize: 18 }}>⏱ 剩余时间: {formatTime(timeLeft)}</div>
            <div style={{ marginBottom: 20 }}>
              <strong>Q {current + 1}:</strong>
              <div style={{ marginTop: 8, fontSize: 18 }}>
                {question.question ? (
                  <ReactMarkdown
                    children={question.question}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  />
                ) : (
                  <span style={{ color: 'gray' }}>[题干为空]</span>
                )}
              </div>
              {(question.images || []).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`图 ${idx + 1}`}
                  style={{ maxWidth: '500px', height: 'auto', margin: '10px 0', border: '1px solid #ddd', borderRadius: 4 }}
                />
              ))}
            </div>

            <ul style={{ padding: 0, listStyle: 'none' }}>
              {question.options.map((opt, i) => (
                <li key={i} style={{ marginBottom: 10 }}>
                  <button
                    onClick={() => handleAnswer(i)}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      fontSize: '20px',
                      cursor: 'pointer',
                      backgroundColor: answers[current] === i ? '#d0eaff' : '#f0f0f0',
                      border: '2px solid',
                      borderColor: answers[current] === i ? '#3399ff' : '#ccc',
                      borderRadius: 6,
                      textAlign: 'left',
                    }}
                  >
                    <ReactMarkdown
                      children={opt}
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    />
                  </button>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 20 }}>
              <button onClick={() => setCurrent(prev => Math.max(prev - 1, 0))} style={{ marginRight: 10 }}>
                上一题
              </button>
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent(prev => Math.min(prev + 1, questions.length - 1))}>
                  下一题
                </button>
              ) : (
                <button
                  onClick={confirmAndSubmit}
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    padding: '10px 20px',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  提交
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MockExamPage;
