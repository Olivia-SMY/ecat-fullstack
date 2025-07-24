import { useParams, useNavigate } from 'react-router-dom';

const sections = [
  { id: '1a', label: 'Section 1A' },
  { id: '1b', label: 'Section 1B' },
  { id: '2', label: 'Section 2' },
];

const MockYearPage = () => {
  const { year } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h2>ENGAA {year} - 选择 Section</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sections.map((sec) => (
          <li key={sec.id} style={{ marginBottom: 15 }}>
            <div
              style={{
                padding: 15,
                border: '1px solid #ccc',
                borderRadius: 8,
                cursor: 'pointer',
                backgroundColor: '#f9f9f9'
              }}
              onClick={() => navigate(`/mock/${year}/${sec.id}`)}
            >
              <strong>{sec.label}</strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MockYearPage; 