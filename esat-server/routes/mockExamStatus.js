const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// 使用 Supabase 客户端
const supabaseUrl = 'https://pmaciokjcuwkunikmwgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpb2tqY3V3a3VuaWttd2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Nzk4ODUsImV4cCI6MjA2ODU1NTg4NX0.SNwrjWU4O2t2oxexU1hzKSh-LCbBHQMGAhs4RVWxWNE';

const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY);

// 1. 用户端定时上报当前状态
router.post('/', async (req, res) => {
  const { user_id, exam_id, current, answers, timeLeft, lastActive } = req.body;
  if (!user_id || !exam_id) return res.status(400).json({ error: '缺少参数' });

  try {
    const { error } = await supabase
      .from('mock_exam_live_status')
      .upsert({
        user_id,
        exam_id,
        current,
        answers,
        time_left: timeLeft,
        last_active: new Date(lastActive).toISOString()
      }, {
        onConflict: 'user_id,exam_id'
      });

    if (error) {
      console.error('上报状态失败:', error);
      return res.status(500).json({ error: '数据库错误' });
    }
    
    res.json({ ok: true });
  } catch (err) {
    console.error('上报状态失败:', err);
    res.status(500).json({ error: '数据库错误' });
  }
});

// 2. 管理员端拉取所有用户状态（需权限校验）
const adminEmails = ['3075087825@qq.com', 'yifeng.chenox@gmail.com']; // 你的管理员邮箱

router.get('/all', async (req, res) => {
  // 简单示例：用 query 参数传 email，实际应用建议用 JWT/session 校验
  const email = req.query.email;
  if (!adminEmails.includes(email)) {
    return res.status(403).json({ error: '无权限' });
  }

  try {
    const { data, error } = await supabase
      .from('mock_exam_live_status')
      .select('*')
      .order('last_active', { ascending: false });

    if (error) {
      console.error('获取状态失败:', error);
      return res.status(500).json({ error: '数据库错误' });
    }

    res.json(data || []);
  } catch (err) {
    console.error('获取状态失败:', err);
    res.status(500).json({ error: '数据库错误' });
  }
});

module.exports = router;
