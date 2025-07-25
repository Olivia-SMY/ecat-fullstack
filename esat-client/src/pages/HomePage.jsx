import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { Typewriter } from 'react-simple-typewriter';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        // 查询 profiles 表
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();
        if (profile && profile.username) {
          setUsername(profile.username);
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const adminEmails = ['3075087825@qq.com', 'yifeng.chenox@gmail.com'];

  return (
    <div style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem' }}>😸 欢迎来到 <span style={{ color: '#2f80ed' }}>ECat 刷题网站</span> 🚀💯</h1>

<p style={{ fontSize: '1.2rem', marginTop: '10px', minHeight: '50px' }}>
  <span style={{ color: '#333' }}>
    <Typewriter
      words={[
        '📈 正在向 ESAT 满分冲刺中...',
        '🧠 解一道题，练一块脑肌肉！',
        '🎯 每一道题，都是通往高分的阶梯！',
        '🔥 成绩不会撒谎，努力不会辜负你！',
        '🚀 你今天刷题了吗？来挑战一下吧！',
        '🤖 AI 正在偷偷观察你的解题速度...'
      ]}
      loop={true}
      cursor
      cursorStyle='|'
      typeSpeed={50}
      deleteSpeed={30}
      delaySpeed={2000}
    />
  </span>
</p>


      {user ? (
        <>
          <p style={{ marginTop: 20 }}>
            👋 当前登录用户：
            <strong>{username ? username : user.email}</strong>
          </p>

          <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: 240 }}>
  <button onClick={() => navigate('/quiz?mode=random')}>
    🎲 随机模式（挑战一题）
  </button>

  <button onClick={() => navigate('/quiz?mode=filter')}>
    🎯 筛选模式（按标签出题）
  </button>

  <button onClick={() => navigate('/mock-exams')}>
  ⌛ 模拟考试（计时真题）
</button>


  <button onClick={() => navigate('/records')}>
    📜 查看我的记录
  </button>

  <button onClick={() => navigate('/json-preview')}>
    👀 题库预览工具
  </button>

  {user && adminEmails.includes(user.email) && (
    <button onClick={() => navigate('/monitor')}>
      🙈 进入监考页面
    </button>
  )}

  <button onClick={handleLogout}>
    🚪 退出登录
  </button>
</div>


        </>
      ) : (
        <>
          <p style={{ marginTop: 20 }}>😢 您尚未登录，快来解锁更多功能吧！</p>
          <button onClick={() => navigate('/login')} style={{ marginTop: 10 }}>
            🔐 前往登录
          </button>
        </>
      )}
    </div>
  );
};

export default HomePage;
