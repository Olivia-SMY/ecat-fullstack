// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>欢迎来到 ESAT 刷题网站</h1>

      {user ? (
        <>
          <p>👋 当前登录用户：{user.email}</p>

          <div style={{ marginTop: 20, display: 'flex', gap: '12px' }}>
            <button onClick={() => navigate('/quiz?mode=random')}>
              🎲 随机练习
            </button>

            <button onClick={() => navigate('/quiz?mode=filter')}>
              🎯 条件筛选
            </button>

            <button onClick={() => navigate('/records')}>
              📝 查看我的记录
            </button>

            <button onClick={handleLogout}>
              🚪 退出登录
            </button>
          </div>
        </>
      ) : (
        <>
          <p>您尚未登录</p>
          <button onClick={() => navigate('/login')}>前往登录</button>
        </>
      )}
    </div>
  );
};

export default HomePage;

