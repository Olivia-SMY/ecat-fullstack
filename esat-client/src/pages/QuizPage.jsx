import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { supabase } from '../utils/supabase';
import { API_BASE } from '../utils/config';
import axios from 'axios';
import LoadingLottie from '../components/LoadingLottie';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { TreeSelect } from 'antd';

const treeData = [
  {
    title: 'Physics',
    value: 'physics',
    children: [
      {
        title: 'Mechanics',
        value: 'mechanics',
        children: [
          { title: 'Kinematics', value: 'kinematics' },
          { title: 'Statics', value: 'statics' },
          { title: 'Dynamics', value: 'dynamics' },
        ]
      },
      {
        title: 'Materials',
        value: 'materials',
        children: [
          { title: "Young's Modulus", value: "young's modulus" },
          { title: 'Stress and Strain', value: 'stress and strain' },
        ]
      },
      {
        title: 'Dimensional Analysis',
        value: 'dimensional analysis',
        children: []
      },
      {
        title: 'Waves & Optics',
        value: 'waves_optics',
        children: [
          { title: 'Wave', value: 'wave' },
          { title: 'Stationary Waves', value: 'stationary waves' },
          { title: 'Optics', value: 'optics' },
          { title: 'Reflection', value: 'reflection' },
          { title: 'Refraction', value: 'refraction' }
        ]
      },
      {
        title: 'Electricity & Magnetism',
        value: 'electricity_magnetism',
        children: [
          {
            title: 'Electricity',
            value: 'electricity',
            children: [
              { title: 'Electric Fields', value: 'electric fields' },
              {
                title: 'Circuits',
                value: 'circuits',
                children: [
                  { title: 'Capacitors', value: 'capacitors' },
                  { title: 'Resistance', value: 'resistance' },
                ]
              }
            ]
          },
          {
            title: 'Magnetism',
            value: 'magnetism',
            children: [
              { title: 'Magnetic Fields', value: 'magnetic fields' },
            ]
          }
        ]
      },
      {
        title: 'Thermofluids',
        value: 'thermal_fluids',
        children: [
          {
            title: 'Thermal Physics',
            value: 'thermal physics',
            children: [
              { title: 'Heat Capacity', value: 'heat capacity' },
              { title: 'Ideal Gases', value: 'ideal gases' },
            ]
          },
          {
            title: 'Fluids',
            value: 'fluids',
            children: [
              { title: 'Pressure', value: 'pressure' },
              { title: 'Bounyancy', value: 'bounyancy' },
            ]
          }
        ]
      },
      {
        title: 'Modern Physics',
        value: 'modern_physics',
        children: [
          { title: 'Quantum', value: 'quantum' },
          { title: 'Nuclear', value: 'nuclear' },
          { title: 'Radioactive Decay', value: 'radioactive decay' },
          { title: 'Energy Levels', value: 'energy levels' }
        ]
      },
      // 'Other Topics' now only includes items not moved elsewhere
      {
        title: 'Other Topics',
        value: 'other',
        children: []
      }
    ]
  },
  {
    title: 'Math',
    value: 'math',
    children: [
      {
        title: 'Algebra',
        value: 'algebra',
        children: [
          { title: 'Equations', value: 'equations' },
          { title: 'Polynomials', value: 'polynomials' },
          { title: 'Inequalities', value: 'inequalities' },
          { title: 'Functions', value: 'functions' },
          { title: 'Sequences and Series', value: 'sequences and series' },
        ]
      },
      {
        title: 'Geometry',
        value: 'geometry',
        children: [
          { title: 'Triangles', value: 'triangles' },
          { title: 'Circles', value: 'circles' },
          { title: 'Coordinate Geometry', value: 'coordinate geometry' },
          { title: 'Vectors', value: 'vectors' },
        ]
      },
      {
        title: 'Trigonometry',
        value: 'trigonometry',
        children: [
          { title: 'Trigonometric Functions', value: 'trig functions' },
          { title: 'Identities & Equations', value: 'trig identities' },
        ]
      },
      {
        title: 'Calculus',
        value: 'calculus',
        children: [
          { title: 'Differentiation', value: 'differentiation' },
          { title: 'Integration', value: 'integration' },
          { title: 'Limits', value: 'limits' },
          { title: 'Differential Equations', value: 'differential equations' },
        ]
      },
      {
        title: 'Probability',
        value: 'probability',
        children: [
          { title: 'Permutation & Combination', value: 'PC' },
          { title: 'Random Variables', value: 'random variables' },
          { title: 'Distributions', value: 'distributions' },
        ]
      }
    ]
  }
];

// 递归获取所有子标签 value
function getAllDescendantTags(tree, selected) {
  const result = new Set();
  function traverse(nodes) {
    for (const node of nodes) {
      if (selected.includes(node.value)) {
        // 选中当前节点，收集所有后代
        collectAll(node);
      } else if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }
  function collectAll(node) {
    result.add(node.value);
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        collectAll(child);
      }
    }
  }
  traverse(tree);
  return Array.from(result);
}

const QuizPage = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  // Change selectedTags to be an array of values
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
        // selectedTags is now an array of values
        selectedTags.forEach(tag => params.append('tags', tag));
        console.log('请求参数：', params.toString());
        const res = await axios.get(`${API_BASE}/api/questions?${params.toString()}`);
        data = res.data;
      }

      // 只保留非 mock 题
      data = data.filter(q => !q.isMock);

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
            <TreeSelect
              treeData={treeData}
              value={selectedTags}
              onChange={vals => {
                // 自动递归选中所有子标签
                const allTags = getAllDescendantTags(treeData, vals);
                setSelectedTags(allTags);
              }}
              treeCheckable={true}
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              placeholder="选择标签"
              style={{ width: 300 }}
              multiple
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
