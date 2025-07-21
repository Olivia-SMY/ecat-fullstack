import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const UpdatePasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase 自动从 URL 中恢复 session，无需额外处理
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage('无法识别用户，请重新登录或重试。');
      }
    });
  }, []);

  const handleUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage('更新失败：' + error.message);
    } else {
      setMessage('密码更新成功，即将跳转到登录页...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>设置新密码</h2>
      <input
        type="password"
        placeholder="输入新密码"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        style={{ padding: 8, marginBottom: 10, width: '100%', maxWidth: 300 }}
      />
      <br />
      <button onClick={handleUpdate}>更新密码</button>
      <p>{message}</p>
    </div>
  );
};

export default UpdatePasswordPage;
