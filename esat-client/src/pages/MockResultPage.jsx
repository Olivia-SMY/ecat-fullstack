import { useLocation, Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
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

function formatDuration(ms) {
  const sec = Math.floor(ms / 1000);
  return `${Math.floor(sec / 60)} 分 ${sec % 60} 秒`;
}

function MockResultPage() {
  const { state } = useLocation();
  const { questions = [], answers = [], elapsedTime = null, title = '模拟考试结果', examSource = '' } = state || {};

  const score = answers.reduce((acc, ans, idx) =>
    ans === questions[idx]?.answerIndex ? acc + 1 : acc, 0);
  const scaled = getScaledScore(score, examSource) ?? 'N/A';

  // 调试信息
  console.log('MockResultPage - examSource:', examSource);
  console.log('MockResultPage - score:', score);
  console.log('MockResultPage - scaled:', scaled);

  return (
    <div style={{ padding: 30, fontFamily: 'Arial, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-block', marginBottom: 20 }}>⬅ 返回首页</Link>
      <h2>{title}</h2>

      <h3>答题结果</h3>
      <div style={{ marginBottom: 15 }}>✅ 得分: {score} / {questions.length}</div>
      {examSource !== 'eng_2016_s2' && (
        <div style={{ marginBottom: 15 }}>📊 标准分: {scaled}</div>
      )}
      <div style={{ marginBottom: 15 }}>⏱ 答题用时: {elapsedTime ? formatDuration(elapsedTime) : '—'}</div>

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
              <div><strong>题目 {idx + 1}:</strong> <LatexText text={q.question || '[题干为空]'} /></div>
              <div>你的答案: <LatexText text={userOpt || '未作答'} /></div>
              <div>正确答案: <LatexText text={correctOpt} /></div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default MockResultPage;
