import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import axios from 'axios';
import { API_BASE } from '../utils/config';

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

const rawToScaled = {
  0: 1.0, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.2,
  5: 1.9, 6: 2.4, 7: 2.9, 8: 3.4, 9: 3.9,
  10: 4.3, 11: 4.8, 12: 5.3, 13: 5.7, 14: 6.3,
  15: 6.8, 16: 7.4, 17: 8.2, 18: 9.0, 19: 9.0, 20: 9.0,
};

function MockExamPage() {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/mock-exams/${examId}`);
        setQuestions(res.data.questions);
        setAnswers(Array(res.data.questions.length).fill(null));
      } catch (err) {
        console.error('❌ 模考加载失败:', err);
      }
    };

    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (questions.length === 0 || showResults) return;
    setStartTime(Date.now());

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [questions, showResults]);

  const handleAnswer = (index) => {
    if (showResults) return;
    const newAnswers = [...answers];
    newAnswers[current] = index;
    setAnswers(newAnswers);
  };

  const score = answers.reduce((acc, ans, idx) =>
    ans === questions[idx]?.answerIndex ? acc + 1 : acc, 0);
  const scaled = rawToScaled[score] ?? 'N/A';

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const formatDuration = (ms) => {
    const sec = Math.floor(ms / 1000);
    return `${Math.floor(sec / 60)} 分 ${sec % 60} 秒`;
  };

  const confirmAndSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0 && !window.confirm(`还有 ${unanswered} 题未作答，是否仍要提交？`)) return;
    setElapsedTime(Date.now() - startTime);
    setShowResults(true);
  };

  const question = questions[current];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ width: 100, borderRight: '1px solid #ccc', padding: 10, background: '#f9f9f9' }}>
        {questions.map((q, idx) => {
          const answered = answers[idx] !== null;
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
                backgroundColor: isCurrent ? '#d0eaff' : answered ? '#e0f5e9' : 'transparent',
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
        <h2>模拟考试</h2>

        {!showResults && question && (
          <>
            <div style={{ marginBottom: 20, fontSize: 18 }}>⏱ 剩余时间: {formatTime(timeLeft)}</div>
            <div style={{ marginBottom: 20 }}>
              <strong>Q {current + 1}:</strong>
              <div style={{ marginTop: 8, fontSize: 18 }}>
                <LatexText text={question.question} />
              </div>
              {(question.images || []).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`图 ${idx + 1}`}
                  style={{ maxWidth: '100%', margin: '10px 0', border: '1px solid #ddd', borderRadius: 4 }}
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
                      fontSize: '16px',
                      cursor: 'pointer',
                      backgroundColor: answers[current] === i ? '#d0eaff' : '#f0f0f0',
                      border: '2px solid',
                      borderColor: answers[current] === i ? '#3399ff' : '#ccc',
                      borderRadius: 6,
                      textAlign: 'left',
                    }}
                  >
                    <LatexText text={opt} />
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

        {showResults && (
          <>
            <h3>答题结果</h3>
            <div style={{ marginBottom: 15 }}>总得分: {score} / {questions.length}</div>
            <div style={{ marginBottom: 15 }}>标准分: {scaled}</div>
            <div style={{ marginBottom: 15 }}>答题用时: {elapsedTime ? formatDuration(elapsedTime) : '—'}</div>
            <ul style={{ padding: 0, listStyle: 'none' }}>
              {questions.map((q, idx) => {
                const isCorrect = answers[idx] === q.answerIndex;
                const userOpt = q.options[answers[idx]];
                const correctOpt = q.options[q.answerIndex];
                return (
                  <li
                    key={q._id || idx}
                    style={{
                      marginBottom: 12,
                      padding: 10,
                      border: '1px solid',
                      borderColor: isCorrect ? '#4caf50' : '#f44336',
                      borderRadius: 6,
                      backgroundColor: isCorrect ? '#e8f5e9' : '#ffebee',
                    }}
                  >
                    <div><strong>题目 {idx + 1}:</strong> <LatexText text={q.question} /></div>
                    <div>你的答案: <LatexText text={userOpt || '未作答'} /></div>
                    <div>正确答案: <LatexText text={correctOpt} /></div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default MockExamPage;
