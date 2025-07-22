import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const JsonPreview = () => {
  const [jsonText, setJsonText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const dropRef = useRef(null);

  const validateQuestion = (q) => {
    const issues = [];
    if (!q.question || typeof q.question !== 'string') issues.push('缺少题干');
    if (!Array.isArray(q.options) || q.options.length < 2) issues.push('选项不足');
    if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex >= (q.options?.length || 0)) {
      issues.push('答案索引非法');
    }
    return issues;
  };

  const handleLoadJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON 应该是题目数组');
      }

      const withValidation = parsed.map((q, idx) => {
        const issues = validateQuestion(q);
        return { ...q, __validationIssues: issues };
      });

      setQuestions(withValidation);
      setError('');
    } catch (err) {
      setError(`❌ JSON 解析错误: ${err.message}`);
      setQuestions([]);
    }
  };

  const handleClear = () => {
    setJsonText('');
    setQuestions([]);
    setError('');
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setJsonText(e.target.result);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/json') {
      handleFile(file);
    } else {
      setError('请上传 .json 文件');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>👀题目 JSON 预览工具</h2>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder='粘贴或上传题库 JSON...'
        style={{ width: '100%', height: '200px', padding: '10px', fontFamily: 'monospace', marginBottom: '10px' }}
      />

      <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
        <button onClick={handleLoadJson} style={{ padding: '10px 20px' }}>预览题目</button>
        <button
          onClick={handleClear}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          清除内容
        </button>
        <input
          type="file"
          accept=".json"
          onChange={(e) => handleFile(e.target.files[0])}
          style={{ marginLeft: '12px' }}
        />
      </div>
<div
  ref={dropRef}
  onDrop={handleDrop}
  onDragOver={handleDragOver}
  onDragEnter={() => dropRef.current.style.borderColor = '#2f80ed'}
  onDragLeave={() => dropRef.current.style.borderColor = '#ccc'}
  style={{
    border: '3px dashed #ccc',
    borderRadius: '10px',
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    color: '#333',
    fontSize: '16px',
    transition: 'border-color 0.3s, background-color 0.3s',
    marginBottom: '20px',
    cursor: 'pointer'
  }}
>
  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📂</div>
  <div><strong>拖拽 .json 文件到这里上传</strong></div>
  <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>也可以点击上方按钮手动上传</div>
</div>


      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {questions.map((q, idx) => (
        <div
          key={idx}
          style={{
            border: q.__validationIssues?.length ? '2px solid red' : '1px solid #ccc',
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            backgroundColor: q.__validationIssues?.length ? '#ffe6e6' : '#fff'
          }}
        >
          <p><strong>Q{q.index || idx + 1}.</strong></p>

          <ReactMarkdown children={q.question} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} />

          {q.images?.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`img-${i}`}
              style={{ maxWidth: '300px', display: 'block', marginBottom: '10px' }}
            />
          ))}

          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {q.options?.map((opt, i) => (
              <li key={i}>
                <ReactMarkdown
                  children={`(${String.fromCharCode(65 + i)}) ${opt}`}
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                />
              </li>
            ))}
          </ul>

          {typeof q.answerIndex === 'number' && q.options?.length > q.answerIndex && (
            <p style={{ color: 'green' }}>
              正确答案：({String.fromCharCode(65 + q.answerIndex)})
            </p>
          )}

          {q.__validationIssues?.length > 0 && (
            <div style={{ color: 'red' }}>
              ⚠️ 问题：{q.__validationIssues.join('；')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default JsonPreview;
