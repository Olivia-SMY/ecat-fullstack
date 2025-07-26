// 检查用户数据
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pmaciokjcuwkunikmwgv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtYWNpb2tqY3V3a3VuaWttd2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Nzk4ODUsImV4cCI6MjA2ODU1NTg4NX0.SNwrjWU4O2t2oxexU1hzKSh-LCbBHQMGAhs4RVWxWNE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  try {
    console.log('🔍 检查用户数据...');
    
    // 1. 检查 profiles 表
    console.log('\n📋 检查 profiles 表...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, created_at')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ profiles 表查询失败:', profilesError);
      console.log('💡 可能是 RLS 策略限制访问');
    } else {
      console.log(`✅ profiles 表有 ${profiles.length} 条记录`);
      if (profiles.length > 0) {
        console.log('📋 profiles 数据:', profiles[0]);
      } else {
        console.log('⚠️ 查询返回空数组，可能是 RLS 策略问题');
      }
    }
    
    // 2. 检查 auth.users 表（通过 admin 查询）
    console.log('\n📋 检查 auth.users 表...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ 无法查询 auth.users（需要 admin 权限）');
      console.log('💡 这是正常的，anon key 无法访问 auth.users');
    } else {
      console.log(`✅ auth.users 表有 ${authUsers.users.length} 条记录`);
      if (authUsers.users.length > 0) {
        console.log('📋 auth.users 数据:', authUsers.users[0]);
      }
    }
    
    // 3. 检查 mock_exam_results 表（看是否有用户在做模考）
    console.log('\n📋 检查 mock_exam_results 表...');
    const { data: results, error: resultsError } = await supabase
      .from('mock_exam_results')
      .select('user_id, exam_id, score, created_at')
      .limit(5);
    
    if (resultsError) {
      console.error('❌ mock_exam_results 表查询失败:', resultsError);
    } else {
      console.log(`✅ mock_exam_results 表有 ${results.length} 条记录`);
      if (results.length > 0) {
        console.log('📋 mock_exam_results 数据:', results[0]);
        
        // 4. 尝试用这个 user_id 创建状态
        const testUserId = results[0].user_id;
        console.log(`\n🧪 尝试用真实用户ID创建状态: ${testUserId}`);
        
        const { error: statusError } = await supabase
          .from('mock_exam_live_status')
          .upsert({
            user_id: testUserId,
            exam_id: 'test-exam-456',
            current: 3,
            answers: [0, 1, 2, null, null],
            time_left: 1500,
            last_active: new Date().toISOString()
          }, {
            onConflict: 'user_id,exam_id'
          });
        
        if (statusError) {
          console.error('❌ 状态创建失败:', statusError);
        } else {
          console.log('✅ 状态创建成功！');
        }
      }
    }
    
  } catch (err) {
    console.error('❌ 检查失败:', err);
  }
}

checkUsers(); 