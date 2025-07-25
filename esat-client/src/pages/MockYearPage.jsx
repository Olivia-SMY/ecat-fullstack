import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../utils/config';

const MockYearPage = () => {
  const { year } = useParams();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/api/mock-exams/`)
      .then(res => {
        // 只筛选该年份的
        const filtered = res.data.filter(exam => exam.title.includes(year));
        // 提取 Section
        const mapped = filtered.map(exam => {
          const match = exam.title.match(/S(\d+[ab]?)/i);
          return {
            _id: exam._id,
            section: match ? match[0].toUpperCase() : '未知', // 统一大写
            title: exam.title
          };
        });

        // 自定义 Section 顺序
        const sectionOrder = ['S1A', 'S1B', 'S2'];

        const sortedSections = mapped.sort((a, b) => {
          const idxA = sectionOrder.indexOf(a.section);
          const idxB = sectionOrder.indexOf(b.section);
          // 未知的排最后
          return (idxA === -1 ? 999 : idxB === -1 ? 999 : idxA - idxB);
        });

        setSections(sortedSections);
        setLoading(false); // 加载完毕
      })
      .catch(err => {
        console.error('❌ 获取考试列表失败:', err);
        setLoading(false); // 加载失败也结束 loading
      });
  }, [year]);

  return (
    <div style={{ padding: 40 }}>
      <h2>ENGAA {year} - 选择 Section</h2>
      {loading ? (
        <div style={{ fontSize: 18, color: '#888', marginTop: 30 }}>加载中...</div>
      ) : (
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
      )}
    </div>
  );
};

export default MockYearPage; 