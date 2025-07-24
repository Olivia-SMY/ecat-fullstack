// src/pages/MockListPage.jsx
import { useNavigate } from 'react-router-dom';

const years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];

const MockListPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h2>📝 模拟考试选择</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {years.map((year) => (
          <li key={year} style={{ marginBottom: 15 }}>
            <div
              style={{
                padding: 15,
                border: '1px solid #ccc',
                borderRadius: 8,
                cursor: 'pointer',
                backgroundColor: '#f9f9f9',
                fontSize: 18
              }}
              onClick={() => navigate(`/mock-year/${year}`)}
            >
              <strong>ENGAA {year}</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MockListPage;
