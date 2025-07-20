import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, questions = [], answers = [] } = location.state || {};

  const [showExplanations, setShowExplanations] = useState(true);

  const getChoiceLabel = (index) => String.fromCharCode(65 + index);

  const findQuestion = (id) => {
    const strId = id.toString();
    return questions.find(q => q._id?.toString() === strId || q.id?.toString() === strId);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '10px' }}>测验结果</h2>
      <p style={{ marginBottom: '10px' }}>得分：<strong>{score}</strong> / {answers.length}</p>

      {/* ✅ 开关：是否显示解析 */}
      <div style={{ margin: '10px 0' }}>
        <label style={{ fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={showExplanations}
            onChange={() => setShowExplanations(prev => !prev)}
            style={{ marginRight: '6px' }}
          />
          显示解析
        </label>
      </div>

      {answers.map((ans, idx) => {
        const q = findQuestion(ans.questionId);
        if (!q) {
          return (
            <div key={idx} style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>
              ❌ 无法找到题目（ID: {ans.questionId}）
            </div>
          );
        }

        return (
          <div
            key={idx}
            style={{
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '12px 16px',
              marginBottom: '16px',
              backgroundColor: '#f9f9f9',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>Q{q.index}.</div>

            <ReactMarkdown
              children={q.question}
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            />

            {q.images?.length > 0 && (
              <div style={{ margin: '6px 0' }}>
                {q.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`img-${i}`}
                    style={{ maxWidth: '200px', marginRight: '8px', marginBottom: '4px' }}
                  />
                ))}
              </div>
            )}

            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: '6px 0' }}>
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: '4px',
                    color:
                      i === ans.correctAnswerIndex ? 'green' :
                        i === ans.userAnswerIndex ? 'red' : '#333',
                  }}
                >
                  <strong>{getChoiceLabel(i)}.</strong>{' '}
                  <ReactMarkdown
                    children={opt}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{ p: 'span' }}
                  />
                </li>
              ))}
            </ul>

            <div style={{ fontSize: '13px', marginTop: '6px' }}>
              ✅ 正确答案：<strong>{getChoiceLabel(ans.correctAnswerIndex)}</strong>{' '}
              | 🧠 你的答案：<strong>{getChoiceLabel(ans.userAnswerIndex)}</strong>{' '}
              | {ans.isCorrect ? '✅ 正确' : '❌ 错误'}
            </div>

            {/* ✅ 解析显示开关 */}
            {showExplanations && q.explanation && (
              <div style={{ marginTop: '6px' }}>
                <strong style={{ fontSize: '13px' }}>解析：</strong>{' '}
                <ReactMarkdown
                  children={q.explanation}
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{ p: 'span' }}
                />
              </div>
            )}
          </div>
        );
      })}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2f80ed',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          返回首页
        </button>
      </div>
    </div>
  );
};

export default ResultPage;

