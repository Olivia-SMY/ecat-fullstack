import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const MockResult = ({ score, questions, userAnswers, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-10 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl overflow-y-auto max-h-[80vh]">
        <h2 className="text-2xl font-bold mb-4">🎉 模考完成</h2>
        <p className="mb-4">你的得分：{score} / {questions.length}</p>

        {questions.map((q, idx) => {
          const correct = userAnswers[idx] === q.answer;
          return (
            <div key={idx} className="mb-4 border-b pb-2">
              <strong>Q{idx + 1}</strong> ({correct ? "✅ 正确" : `❌ 错误，正确是 ${q.answer}`})
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {q.explanation}
              </ReactMarkdown>
            </div>
          );
        })}

        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">
          关闭
        </button>
      </div>
    </div>
  );
};

export default MockResult;
