// src/pages/TestSupabase.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const TestSupabase = () => {
  const [status, setStatus] = useState('正在测试连接...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setStatus(`❌ 连接失败: ${error.message}`);
        } else if (data.session) {
          setStatus(`✅ 已登录用户：${data.session.user.email}`);
        } else {
          setStatus('✅ Supabase 连接正常，但用户未登录');
        }
      } catch (err) {
        setStatus(`❌ 连接异常: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Supabase 测试</h2>
      <p>{status}</p>
    </div>
  );
};

export default TestSupabase;
