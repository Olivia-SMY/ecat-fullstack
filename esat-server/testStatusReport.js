// 测试状态上报功能
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pmaciokjcuwkunikmwgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpb2tqY3V3a3VuaWttd2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Nzk4ODUsImV4cCI6MjA2ODU1NTg4NX0.SNwrjWU4O2t2oxexU1hzKSh-LCbBHQMGAhs4RVWxWNE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStatusReport() {
  try {
    console.log('🔍 测试状态上报功能...');
    
    // 1. 先检查是否有用户
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, username, email')
      .limit(5);
    
    if (userError) {
      console.error('❌ 获取用户失败:', userError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ 没有找到用户，无法测试状态上报');
      return;
    }
    
    console.log(`✅ 找到 ${users.length} 个用户`);
    const testUser = users[0];
    console.log(`🧪 使用用户: ${testUser.username} (${testUser.email})`);
    
    // 2. 模拟状态上报
    const testStatus = {
      user_id: testUser.id,
      exam_id: 'test-exam-123',
      current: 5,
      answers: [0, 1, 2, 3, 4, null, null, null, null, null],
      time_left: 1200,
      last_active: new Date().toISOString()
    };
    
    console.log('📤 上报状态...');
    const { error: reportError } = await supabase
      .from('mock_exam_live_status')
      .upsert(testStatus, {
        onConflict: 'user_id,exam_id'
      });
    
    if (reportError) {
      console.error('❌ 状态上报失败:', reportError);
    } else {
      console.log('✅ 状态上报成功');
      
      // 3. 验证数据是否插入
      const { data: statusData, error: statusError } = await supabase
        .from('mock_exam_live_status')
        .select('*')
        .eq('user_id', testUser.id);
      
      if (statusError) {
        console.error('❌ 验证失败:', statusError);
      } else {
        console.log(`✅ 验证成功，找到 ${statusData.length} 条状态记录`);
        if (statusData.length > 0) {
          console.log('📋 状态数据:', statusData[0]);
        }
      }
    }
    
  } catch (err) {
    console.error('❌ 测试失败:', err);
  }
}

testStatusReport(); 