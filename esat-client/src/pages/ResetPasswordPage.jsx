import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://smyesatweb2.netlify.app/update-password'
    });

    if (error) {
      setMessage('发送失败：' + error.message);
    } else {
      setMessage('重置链接已发送到邮箱，请查收。');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>重置密码</h2>
      <input
        type="email"
        placeholder="输入你的邮箱"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: 8, marginBottom: 10, width: '100%', maxWidth: 300 }}
      />
      <br />
      <button onClick={handleReset}>发送重置链接</button>
      <p>{message}</p>
    </div>
  );
};

export default ResetPasswordPage;
