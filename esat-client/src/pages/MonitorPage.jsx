import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

// 管理员邮箱白名单
const adminEmails = ['3075087825@qq.com', 'yifeng.chenox@gmail.com'];

function formatTime(s) {
  if (!s && s !== 0) return '—';
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function MonitorPage() {
  const [user, setUser] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 权限校验
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (!data.user || !adminEmails.includes(data.user.email)) {
        alert('无权限访问');
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  // 定时拉取所有用户状态
  useEffect(() => {
    if (!user || !adminEmails.includes(user.email)) return;
    const fetchStatuses = async () => {
      setLoading(true);
      try {
        // 这里用 query 参数传 email，后端会校验
        const res = await fetch(`/api/mock-exam-status/all?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        setStatuses(Array.isArray(data) ? data : []);
      } catch (err) {
        setStatuses([]);
      }
      setLoading(false);
    };
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 10000); // 每10秒刷新
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div style={{ padding: 40 }}>
      <h2>🛡️ 实时监考 - 用户模考进度</h2>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th>用户名</th>
              <th>邮箱</th>
              <th>考试ID</th>
              <th>当前题号</th>
              <th>已答题数</th>
              <th>剩余时间</th>
              <th>最后活跃</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((s, idx) => (
              <tr key={s.user_id + s.exam_id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{s.username || '—'}</td>
                <td>{s.email || '—'}</td>
                <td>{s.exam_id}</td>
                <td>{s.current != null ? `Q${s.current + 1}` : '—'}</td>
                <td>
                  {Array.isArray(s.answers)
                    ? s.answers.filter(a => a !== null && a !== undefined).length
                    : '—'}
                </td>
                <td>{formatTime(s.time_left)}</td>
                <td>
                  {s.last_active
                    ? new Date(s.last_active).toLocaleString()
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
