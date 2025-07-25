const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// 用你的 Supabase/Postgres 连接信息
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// 1. 用户端定时上报当前状态
router.post('/', async (req, res) => {
  const { user_id, exam_id, current, answers, timeLeft, lastActive } = req.body;
  if (!user_id || !exam_id) return res.status(400).json({ error: '缺少参数' });

  try {
    await pool.query(
      `insert into mock_exam_live_status (user_id, exam_id, current, answers, time_left, last_active)
       values ($1, $2, $3, $4, $5, to_timestamp($6 / 1000.0))
       on conflict (user_id, exam_id)
       do update set current = $3, answers = $4, time_left = $5, last_active = to_timestamp($6 / 1000.0)`,
      [user_id, exam_id, current, JSON.stringify(answers), timeLeft, lastActive]
    );
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
    const { rows } = await pool.query(
      `select s.*, p.username, p.email
       from mock_exam_live_status s
       left join profiles p on s.user_id = p.id
       order by s.last_active desc`
    );
    res.json(rows);
  } catch (err) {
    console.error('获取状态失败:', err);
    res.status(500).json({ error: '数据库错误' });
  }
});

module.exports = router;
