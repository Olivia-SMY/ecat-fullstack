// src/pages/RegisterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatus('正在注册...');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://smyesatweb2.netlify.app/login'
      }
    });

    if (!error) {
      localStorage.setItem('pendingUsername', username);
      setStatus('✅ 注册成功！请前往邮箱确认并登录');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>注册新用户</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <label>用户名:</label>
        <input value={username} onChange={e => setUsername(e.target.value)} required />

        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>密码:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <button type="submit" style={{ marginTop: 10 }}>注册</button>
      </form>
      <p>{status}</p>
      <button onClick={() => navigate('/login')} style={{ marginTop: 10 }}>已有账号？去登录</button>
    </div>
  );
};

export default RegisterPage;

