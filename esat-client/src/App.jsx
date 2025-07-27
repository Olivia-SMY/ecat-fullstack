// src/App.jsx
import React, { useEffect } from 'react';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import QuizResultPage from './pages/QuizResultPage';
import TestSupabase from './pages/TestSupabase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyRecordsPage from './pages/MyRecordsPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import Qupload from './pages/Qupload';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MockExamPage from './pages/MockExamPage';
import JsonPreview from './pages/JsonPreview';
import MockResultPage from './pages/MockResultPage';
import MockListPage from './pages/MockListPage';
import MockYearPage from './pages/MockYearPage';
import MockRecordDetailPage from './pages/MockRecordDetailPage';
import 'antd/dist/reset.css'; 
import { supabase } from './utils/supabase';
import MonitorPage from './pages/MonitorPage';

function App() {
  useEffect(() => {
    const insertProfileIfNeeded = async () => {
      const pendingUsername = localStorage.getItem('pendingUsername');
      if (!pendingUsername) return;

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      // 检查 profiles 表是否已有记录
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profileData) {
        // 用当前登录用户的 id 作为 profiles.id 插入
        console.log('尝试写入 profiles', user?.id, pendingUsername);
        const { error } = await supabase.from('profiles').insert([
          { id: user.id, username: pendingUsername, email: user.email }
        ]);
        if (error) {
          console.error('写入 profiles 失败:', error);
        }
      }
      localStorage.removeItem('pendingUsername');
    };

    insertProfileIfNeeded();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/result"
        element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        }
      />

      <Route path="/test-supabase" element={<TestSupabase />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/records" element={<MyRecordsPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/qupload" element={<Qupload />} />
      <Route path="/json-preview" element={<JsonPreview />} />
      <Route path="/mock-result" element={<MockResultPage />} />
      <Route path="/mock-record-detail" element={<MockRecordDetailPage />} />
      <Route path="/mock-exams/:examId" element={<MockExamPage />} />
      <Route path="/mock-exams" element={<MockListPage />} />
      <Route path="/mock-year/:year" element={<MockYearPage />} />
      <Route path="/monitor" element={<MonitorPage />} />
    </Routes>
  );
}

export default App;
