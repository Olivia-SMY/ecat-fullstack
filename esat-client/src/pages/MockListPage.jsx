// src/pages/MockListPage.jsx
import { useNavigate } from 'react-router-dom';

const mockExams = [
  { id: 'mock_2023_s1a', title: 'ENGAA 2023 Section 1A', time: 30 }
  
];

const MockListPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h2>📝 模拟考试选择</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {mockExams.map((exam) => (
          <li key={exam.id} style={{ marginBottom: 15 }}>
            <div
              style={{
                padding: 15,
                border: '1px solid #ccc',
                borderRadius: 8,
                cursor: 'pointer',
                backgroundColor: '#f9f9f9'
              }}
              onClick={() => navigate(`/mock/${exam.id}`)}
            >
              <strong>{exam.title}</strong>（{exam.time} 分钟）
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MockListPage;
