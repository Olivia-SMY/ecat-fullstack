import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/config';

const MockYearPage = () => {
  const { year } = useParams();
  const [sections, setSections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/api/mock-exams/`)
      .then(res => {
        // 只筛选该年份的
        const filtered = res.data.filter(exam => exam.title.includes(year));
        // 提取 Section
        const mapped = filtered.map(exam => {
          // 支持 1a, 1b, 2 等
          const match = exam.title.match(/S(\\d+[ab]?)/i);
          return {
            _id: exam._id,
            section: match ? match[0] : '未知',
            title: exam.title
          };
        });
        setSections(mapped);
      })
      .catch(err => console.error('❌ 获取考试列表失败:', err));
  }, [year]);

  return (
    <div style={{ padding: 40 }}>
      <h2>ENGAA {year} - 选择 Section</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sections.map(sec => (
          <li key={sec._id} style={{ marginBottom: 15 }}>
            <div
              style={{
                padding: 15,
                border: '1px solid #ccc',
                borderRadius: 8,
                cursor: 'pointer',
                backgroundColor: '#f9f9f9'
              }}
              onClick={() => navigate(`/mock-exams/${sec._id}`)}
            >
              <strong>{sec.section}</strong> {sec.title}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MockYearPage; 