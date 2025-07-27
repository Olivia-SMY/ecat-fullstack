import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../utils/config';

const adminEmails = ['3075087825@qq.com', 'yifeng.chenox@gmail.com'];

function formatTime(s) {
  if (typeof s !== 'number') return '—';
  const min = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

export default function MonitorPage() {
  const [user, setUser] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 权限校验 + 拉取 user
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || !adminEmails.includes(data.user.email)) {
        alert('无权限访问');
        navigate('/');
      } else {
        setUser(data.user);
      }
    })();
  }, [navigate]);

  // 拉取状态
  const fetchStatuses = useCallback(async () => {
    console.log('=== DEBUG START ===');
    console.log('user:', user);
    console.log('API_BASE:', API_BASE);
    console.log('typeof API_BASE:', typeof API_BASE);
    
    if (!user) return;
    try {
      // 在 MonitorPage 里加这行调试
      console.log('API_BASE:', API_BASE);
      console.log('Full URL:', `${API_BASE}/api/mock-exam-status/all?email=${encodeURIComponent(user.email)}&t=${Date.now()}`);
      const res = await fetch(`${API_BASE}/api/mock-exam-status/all?email=${encodeURIComponent(user.email)}&t=${Date.now()}`);
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // 获取用户信息
        const userIds = [...new Set(data.map(item => item.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, email')
          .in('id', userIds);
        
        // 合并用户信息
        const profilesMap = {};
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile;
          });
        }
        
        const enrichedData = data.map(item => ({
          ...item,
          username: profilesMap[item.user_id]?.username || '—',
          email: profilesMap[item.user_id]?.email || '—'
        }));
        
        setStatuses(enrichedData);
      } else {
        setStatuses([]);
      }
    } catch (err) {
      setStatuses([]);
      console.error('Failed to fetch statuses:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 定时刷新
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 10000);
    return () => clearInterval(interval);
  }, [user, fetchStatuses]);

  return (
    <div style={{ padding: 40 }}>
      <h2>🖥️ 实时监考 - 用户模考进度</h2>
      {loading ? (
        <p>加载中...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th>用户名</th>
              <th>邮箱</th>
              <th>考试名称</th>
              <th>当前题号</th>
              <th>已答题数</th>
              <th>剩余时间</th>
              <th>最后活跃</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((s) => (
              <tr key={s.user_id + s.exam_id} style={{ borderBottom: '1px solid #eee' }}>
                <td>{s.username || '—'}</td>
                <td>{s.email || '—'}</td>
                <td>{s.exam_title || '—'}</td>
                <td>{s.current != null ? `Q${s.current + 1}` : '—'}</td>
                <td>
                  {Array.isArray(s.answers)
                    ? s.answers.filter(a => a != null).length
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
