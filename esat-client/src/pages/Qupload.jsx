import React, { useState } from 'react';
import { supabase } from '../utils/supabase';
import Select from 'react-select';

const tagOptions = [
  { value: 'mechanics', label: 'Mechanics' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'optics', label: 'Optics' },
  { value: 'thermodynamics', label: 'Thermodynamics' },
  { value: 'waves', label: 'Waves' },
  { value: 'quantum', label: 'Quantum' },
];

const Qupload = () => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '', '']);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [difficultyScore, setDifficultyScore] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const handleOptionChange = (value, index) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const uploadImages = async () => {
    const uploadedURLs = [];
    for (const file of imageFiles) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('question-images')
        .upload(fileName, file);

      if (error) {
        console.error('❌ 图片上传失败:', error.message);
      } else {
        const url = supabase.storage
          .from('question-images')
          .getPublicUrl(fileName).data.publicUrl;
        uploadedURLs.push(url);
      }
    }
    return uploadedURLs;
  };

  const handleSubmit = async () => {
    const images = await uploadImages();

    const payload = {
      index: null,
      question,
      options,
      answerIndex: Number(answerIndex),
      explanation,
      images,
      tags: tags.map(t => t.value),
      difficulty,
      difficultyScore: Number(difficultyScore),
    };

    console.log('✅ 生成的 JSON：', JSON.stringify(payload, null, 2));
    alert('✅ 题目已生成！请查看控制台输出');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: 'auto' }}>
      <h2>📄 添加新题目</h2>

      <label>题干（支持 LaTeX）：</label>
      <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={4} />

      <label>选项：</label>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <input
            type="text"
            placeholder={`选项 ${String.fromCharCode(65 + i)}`}
            value={opt}
            onChange={e => handleOptionChange(e.target.value, i)}
            style={{ flex: 1 }}
          />
          {options.length > 1 && (
            <button onClick={() => removeOption(i)} style={{ marginLeft: '8px' }}>❌ 删除</button>
          )}
        </div>
      ))}
      <button onClick={addOption}>➕ 添加选项</button>

      <label>正确答案索引（0 ~ {options.length - 1}）：</label>
      <input
        type="number"
        value={answerIndex}
        onChange={e => setAnswerIndex(e.target.value)}
        min={0}
        max={options.length - 1}
      />

      <label>解析：</label>
      <textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={3} />

      <label>标签（可多选）：</label>
      <Select
        isMulti
        options={tagOptions}
        value={tags}
        onChange={setTags}
        placeholder="选择题目标签"
      />

      <label>难度（easy / medium / hard）：</label>
      <input value={difficulty} onChange={e => setDifficulty(e.target.value)} />

      <label>难度分数（1 ~ 10）：</label>
      <input
        type="number"
        step={0.1}
        value={difficultyScore}
        onChange={e => setDifficultyScore(e.target.value)}
      />

      <label>上传图片（可选，可多张）：</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setImageFiles(Array.from(e.target.files))}
      />

      <button
        onClick={handleSubmit}
        style={{ marginTop: '16px', padding: '12px 20px', fontSize: '16px' }}
      >
        ✅ 生成题目 JSON
      </button>
    </div>
  );
};

export default Qupload;
