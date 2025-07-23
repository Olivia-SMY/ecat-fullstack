const fs = require('fs');
const path = require('path');

// 所有 .md 文件所在目录
const dirPath = path.join(__dirname, 'markdown'); // 改成你放 .md 文件的文件夹名

// 结果输出位置
const outputPath = path.join(__dirname, 'data', 'questions.json');

const parseMarkdown = (mdContent) => {
  const getBlock = (label) => {
    const regex = new RegExp(`\\*\\*${label}:\\*\\*[\\s\\S]*?(?=\\*\\*|$)`, 'g');
    const match = mdContent.match(regex);
    if (!match) {
      console.warn(`⚠️ Missing or malformed field: ${label}`);
      return '';
    }
    return match[0].replace(new RegExp(`\\*\\*${label}:\\*\\*`), '').trim();
  };

  const getLine = (label) => {
    const regex = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`);
    const match = mdContent.match(regex);
    return match ? match[1].trim() : '';
  };

  const question = getBlock('Question');
  const explanation = getBlock('Explanation');

  const images = [...mdContent.matchAll(/!\[.*?\]\((.*?)\)/g)].map(m => m[1]);

  const optionsMatch = mdContent.match(/\*\*Options:\*\*([\s\S]*?)\n\n/);
  const options = optionsMatch
    ? optionsMatch[1].trim().split('\n').map(opt => opt.replace(/^-\s*\([A-E]\)\s*/, '').trim())
    : [];

  const answerMatch = mdContent.match(/\*\*Answer:\*\*\s*([A-E])/);
  const answerIndex = answerMatch ? 'ABCDE'.indexOf(answerMatch[1]) : -1;

  const tags = getLine('Tags').split(',').map(t => t.trim());
  const difficulty = getLine('Difficulty');
  const difficultyScore = parseFloat(getLine('Difficulty Score')) || null;
  const index = parseInt(getLine('Index')) || null;

  if (!question || options.length !== 5 || answerIndex === -1) {
    console.warn(`⚠️ Skipping malformed file`);
    return null;
  }

  return {
    index,
    question,
    images,
    options,
    answerIndex,
    explanation,
    tags,
    difficulty,
    difficultyScore
  };
};


// 读取所有 .md 文件
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
const result = [];

files.forEach(file => {
  const fullPath = path.join(dirPath, file);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const parsed = parseMarkdown(content);
  if (parsed) {
    result.push(parsed);
    console.log(`✅ Parsed: ${file}`);
  }
});

// 输出为 JSON
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`✅ Converted ${result.length} valid markdown files to JSON → ${outputPath}`);
console.log(`✅ Converted ${files.length} markdown files to JSON → ${outputPath}`);


