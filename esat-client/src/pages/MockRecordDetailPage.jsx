import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import { API_BASE } from '../utils/config';
import 'katex/dist/katex.min.css';



const MockRecordDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { record, examId, examTitle } = location.state || {};

  // 获取正确的examId
  const getCorrectExamId = () => {
    // 如果examId是MongoDB ObjectId格式，直接使用
    if (examId && /^[0-9a-fA-F]{24}$/.test(examId)) {
      return examId;
    }
    
    // 如果record.exam_id是MongoDB ObjectId格式，使用它
    if (record?.exam_id && /^[0-9a-fA-F]{24}$/.test(record.exam_id)) {
      return record.exam_id;
    }
    
    return null;
  };

  const correctExamId = getCorrectExamId();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [examNotFound, setExamNotFound] = useState(false);

  // 获取题目数据
  useEffect(() => {
    const loadQuestions = async () => {
      if (!correctExamId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE}/api/mock-exams/${correctExamId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          
          // 检查是否是考试不存在错误
          if (response.status === 404) {
            setExamNotFound(true);
            setLoading(false);
            return;
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const examData = await response.json();
        setQuestions(examData.questions || []);
      } catch (error) {
        console.error('获取题目失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [correctExamId]);

  if (!record) {
    return <div style={{ padding: '20px' }}>记录不存在</div>;
  }

  const answers = record.answers || [];
  const score = record.score || 0;
  const totalQuestions = questions.length;

  const getChoiceLabel = (index) => {
    if (index === null || index === undefined) return '—';
    return String.fromCharCode(65 + index);
  };

  const handleQuestionClick = (questionIndex) => {
    if (questions[questionIndex]) {
      setSelectedQuestion(questions[questionIndex]);
      setShowQuestionModal(true);
    } else {
      alert('题目数据加载中，请稍后再试');
    }
  };

  const closeModal = () => {
    setShowQuestionModal(false);
    setSelectedQuestion(null);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>加载中...</div>;
  }

  if (examNotFound) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <button 
          onClick={() => navigate('/records')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← 返回记录
        </button>

        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2>⚠️ 考试不存在</h2>
          <p>抱歉，这个考试已经被删除了，无法查看详细的答题情况。</p>
          <p>但是我们可以显示基本的考试信息：</p>
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>📈 考试概况</h3>
          <p>✅ 得分：{record.score} / 未知</p>
          <p>📊 标准分：{record.scaled_score ?? '—'}</p>
          <p>⏱️ 用时：{Math.floor(record.elapsed_time / 60)} 分 {record.elapsed_time % 60} 秒</p>
          <p>📅 提交时间：{new Date(record.created_at).toLocaleString()}</p>
          <p>🔗 考试ID：{record.exam_id}</p>
        </div>

        <div style={{ 
          padding: '16px', 
          backgroundColor: '#e3f2fd', 
          border: '1px solid #2196f3',
          borderRadius: '8px'
        }}>
          <h3>💡 建议</h3>
          <p>• 如果你需要查看详细的答题情况，请联系管理员恢复这个考试</p>
          <p>• 或者你可以重新参加其他可用的考试</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <button 
        onClick={() => navigate('/records')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← 返回记录
      </button>

      <h1>📊 {examTitle} - 答题详情</h1>
      
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>📈 考试概况</h3>
        <p>✅ 得分：{score} / {totalQuestions}</p>
        <p>📊 标准分：{record.scaled_score ?? '—'}</p>
        <p>⏱️ 用时：{Math.floor(record.elapsed_time / 60)} 分 {record.elapsed_time % 60} 秒</p>
        <p>📅 提交时间：{new Date(record.created_at).toLocaleString()}</p>
      </div>

      <h3>📝 答题详情</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', marginBottom: '20px' }}>
        {answers.map((answer, index) => {
          const isCorrect = answer === questions[index]?.answerIndex;
          const hasAnswer = answer !== null && answer !== undefined;
          
          return (
            <button
              key={index}
              onClick={() => handleQuestionClick(index)}
              style={{
                padding: '12px 8px',
                border: '2px solid',
                borderColor: hasAnswer ? (isCorrect ? '#4caf50' : '#f44336') : '#ccc',
                backgroundColor: hasAnswer ? (isCorrect ? '#e8f5e9' : '#ffebee') : '#f9f9f9',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                color: hasAnswer ? (isCorrect ? '#2e7d32' : '#c62828') : '#666',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Q{index + 1}</span>
              <span style={{ fontSize: '12px' }}>
                {hasAnswer ? getChoiceLabel(answer) : '—'}
              </span>
              <span style={{ fontSize: '10px' }}>
                {hasAnswer ? (isCorrect ? '✅' : '❌') : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 题目详情模态框 */}
      {showQuestionModal && selectedQuestion && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            <h3 style={{ marginBottom: '16px' }}>
              题目 {questions.findIndex(q => q === selectedQuestion) + 1}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              {selectedQuestion.question ? (
                <ReactMarkdown
                  children={selectedQuestion.question}
                  remarkPlugins={[remarkMath, remarkBreaks]}
                  rehypePlugins={[rehypeKatex]}
                />
              ) : (
                <span style={{ color: 'gray' }}>[题干为空]</span>
              )}
            </div>

            {selectedQuestion.images && selectedQuestion.images.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                {selectedQuestion.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`题目图片 ${i + 1}`}
                    style={{ maxWidth: '100%', marginBottom: '8px' }}
                  />
                ))}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <h4>选项：</h4>
              {selectedQuestion.options.map((option, index) => {
                const isUserAnswer = answers[questions.findIndex(q => q === selectedQuestion)] === index;
                const isCorrectAnswer = selectedQuestion.answerIndex === index;
                
                return (
                  <div
                    key={index}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: isCorrectAnswer ? '#e8f5e9' : 
                                    isUserAnswer && !isCorrectAnswer ? '#ffebee' : '#f9f9f9',
                      borderColor: isCorrectAnswer ? '#4caf50' : 
                                  isUserAnswer && !isCorrectAnswer ? '#f44336' : '#ddd'
                    }}
                  >
                    <strong>{getChoiceLabel(index)}.</strong>{' '}
                    <ReactMarkdown
                      children={option}
                      remarkPlugins={[remarkMath, remarkBreaks]}
                      rehypePlugins={[rehypeKatex]}
                      components={{ p: 'span' }}
                    />
                    {isCorrectAnswer && <span style={{ color: '#4caf50', marginLeft: '8px' }}>✅ 正确答案</span>}
                    {isUserAnswer && !isCorrectAnswer && <span style={{ color: '#f44336', marginLeft: '8px' }}>❌ 你的答案</span>}
                  </div>
                );
              })}
            </div>

            {selectedQuestion.explanation && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f0f8ff', 
                borderRadius: '4px',
                borderLeft: '4px solid #2196f3'
              }}>
                <h4 style={{ marginTop: 0 }}>解析：</h4>
                <ReactMarkdown
                  children={selectedQuestion.explanation}
                  remarkPlugins={[remarkMath, remarkBreaks]}
                  rehypePlugins={[rehypeKatex]}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockRecordDetailPage; 