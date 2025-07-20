// src/pages/QuizPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Select from 'react-select';
import { supabase } from '../utils/supabase';
import { API_BASE } from '../utils/config';

const tagOptions = [
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'optics', label: 'Optics' },
  { value: 'thermodynamics', label: 'Thermodynamics' },
  { value: 'waves', label: 'Waves' },
  { value: 'quantum', label: 'Quantum' },
];

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 获取当前登录用户
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  const fetchQuestions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
    selectedTags.forEach(tag => params.append('tags', tag.value));

    fetch(`${API_BASE}/api/questions?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ 题目加载失败', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSelect = (questionId, index) => {
    setAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('请先登录！');
      return;
    }

    const results = questions.map(q => {
      const selected = answers[q._id];
      return {
        questionId: q._id,
        userAnswerIndex: selected,
        correctAnswerIndex: q.answerIndex,
        isCorrect: selected === q.answerIndex,
      };
    });

    const correctCount = results.filter(r => r.isCorrect).length;

    // 保存记录到 Supabase
    const { error } = await supabase.from('records').insert({
      user_id: user.id,
      score: correctCount,
      total: results.length,
      answers: results,
    });

    if (error) {
      console.error('❌ 保存记录失败:', error);
      alert('提交失败：保存记录错误');
      return;
    }

    navigate('/result', {
      state: {
        score: correctCount,
        answers: results,
        questions,
      },
    });
  };

  if (loading) return <p>加载中...</p>;

  return (
    <div className="quiz-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ESAT 题目练习</h1>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <label>
          难度：
          <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
            <option value="">全部</option>
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">困难</option>
          </select>
        </label>

        <div style={{ width: '300px' }}>
          <label>标签（可多选）：</label>
          <Select
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            placeholder="选择标签"
          />
        </div>

        <button onClick={fetchQuestions}>筛选题目</button>
      </div>

      {questions.map(q => (
        <div
          key={q._id}
          className="question-block"
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Q{q.index}.</p>

          <ReactMarkdown
            children={q.question}
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          />

          {q.images && q.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`img-${i}`}
              style={{ maxWidth: '300px', marginBottom: '10px', display: 'block' }}
            />
          ))}

          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {q.options.map((opt, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    checked={answers[q._id] === i}
                    onChange={() => handleSelect(q._id, i)}
                  />
                  <ReactMarkdown
                    children={opt}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={handleSubmit}
          style={{
            backgroundColor: '#2f80ed',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          提交答卷
        </button>
      </div>
    </div>
  );
};

export default QuizPage;
