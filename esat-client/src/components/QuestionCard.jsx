import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const QuestionCard = ({ question, index, onSelect, selected }) => {
  return (
    <div className="border p-4 rounded mb-4 shadow">
      <p className="font-semibold mb-2">
        {index + 1}. <BlockMath math={question.question} />
      </p>

      {question.images && question.images.map((src, i) => (
        <img key={i} src={src} alt={`question-${index}-img-${i}`} className="mb-2 max-w-md" />
      ))}

      {question.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`block w-full text-left px-4 py-2 rounded mb-2 border ${
            selected === i ? 'bg-blue-200 border-blue-500' : 'hover:bg-gray-100'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export default QuestionCard;
