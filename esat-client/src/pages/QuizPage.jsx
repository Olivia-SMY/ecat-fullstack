import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Select from 'react-select';
import { supabase } from '../utils/supabase';
import { API_BASE } from '../utils/config';
import axios from 'axios';
import LoadingLottie from '../components/LoadingLottie';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
const tagOptions = [
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'optics', label: 'Optics' },
  { value: 'thermodynamics', label: 'Thermodynamics' },
  { value: 'waves', label: 'Waves' },
  { value: 'quantum', label: 'Quantum' }
];

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [user, setUser] = useState(null);
  const [scoreRange, setScoreRange] = useState([1, 10]);
  const [difficultyMode, setDifficultyMode] = useState('label'); // 'label' or 'range'
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'filter';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    fetchUser();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let data;

      if (mode === 'random') {
        const res = await axios.get(`${API_BASE}/api/questions/random`);
        data = res.data;
      } else {
        const params = new URLSearchParams();
        if (difficultyMode === 'label' && selectedDifficulty) {
          params.append('difficulty', selectedDifficulty);
        } else if (difficultyMode === 'range') {
          params.append('minScore', scoreRange[0].toString());
          params.append('maxScore', scoreRange[1].toString());

        }
        selectedTags.forEach(tag => params.append('tags', tag.value));
        // ✅ 添加这行查看请求参数
      console.log('请求参数：', params.toString());

        const res = await axios.get(`${API_BASE}/api/questions?${params.toString()}`);
        data = res.data;
      }

      setQuestions(data);
    } catch (err) {
      console.error('❌ 题目加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [mode]);

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

  if (loading) return <LoadingLottie />;

  return (
    <div className="quiz-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>ESAT 题目练习</h1>

      {mode === 'filter' && (
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setDifficultyMode('label')}
              style={{
                backgroundColor: difficultyMode === 'label' ? '#2f80ed' : '#ccc',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              📊 难度等级
            </button>
            <button
              onClick={() => setDifficultyMode('range')}
              style={{
                backgroundColor: difficultyMode === 'range' ? '#2f80ed' : '#ccc',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🎚️ 分数范围
            </button>
          </div>

          {difficultyMode === 'label' && (
            <label>
              难度：
              <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                <option value="">全部</option>
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </label>
          )}

          {difficultyMode === 'range' && (
            <div style={{ width: '300px' }}>
              <label>难度分数范围（{scoreRange[0]} ~ {scoreRange[1]}）：</label>
              <Slider
  range
  min={1}
  max={10}
  step={0.1}
  value={scoreRange}
  onChange={(val) => setScoreRange(val)}
/>

            </div>
          )}

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
      )}

      {questions.map((q, idx) => (
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
          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
            Q{q.index || idx + 1}.
          </p>

          <ReactMarkdown children={q.question} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />

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
                  <ReactMarkdown children={opt} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />
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
