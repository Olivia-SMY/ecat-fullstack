// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('正在登录...');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setStatus(`❌ 登录失败：${error.message}`);
    } else {
      setStatus('✅ 登录成功！跳转中...');
      setTimeout(() => navigate('/'), 1000);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>用户登录</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>密码:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" style={{ marginTop: 10 }}>登录</button>
      </form>
      <p>{status}</p>
      <button onClick={() => navigate('/register')} style={{ marginTop: 10 }}>还没有账号？去注册</button>
    </div>
  );
};

export default LoginPage;
