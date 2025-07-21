// src/pages/UpdatePasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const UpdatePasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 检查 Supabase 是否有 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage('⚠️ 无法识别用户，请重新登录或重试。');
        setCanSubmit(false);
      } else {
        setCanSubmit(true);
      }
    });
  }, []);

  const handleUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage('密码至少 6 位');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage('❌ 更新失败：' + error.message);
    } else {
      setMessage('✅ 密码更新成功，2秒后跳转到登录页...');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: '0 auto' }}>
      <h2>🔐 设置新密码</h2>

      <input
        type="password"
        placeholder="输入新密码"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        style={{
          padding: 10,
          marginBottom: 12,
          width: '100%',
          borderRadius: 6,
          border: '1px solid #ccc',
        }}
      />
      <br />

      <button
        onClick={handleUpdate}
        disabled={!canSubmit}
        style={{
          backgroundColor: canSubmit ? '#0070f3' : '#999',
          color: 'white',
          padding: '10px 20px',
          borderRadius: 6,
          border: 'none',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
      >
        更新密码
      </button>

      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
};

export default UpdatePasswordPage;
