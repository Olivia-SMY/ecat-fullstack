// src/App.jsx
import React from 'react';
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
import TestTree from './pages/testree';
import 'react-dropdown-tree-select/dist/styles.css';
import 'antd/dist/reset.css'; // For Ant Design v5+
import { TreeSelect } from 'antd';
import AntdTreeSelectDemo from './pages/AntdTreeSelectDemo';

function App() {
  const treeData = [
    {
      title: 'Mechanics',
      value: 'mechanics',
      children: [
        { title: 'Kinematics', value: 'kinematics' },
        { title: 'Statics', value: 'statics' },
        {
          title: 'Dynamics',
          value: 'dynamics',
          children: [
            { title: "Newton's Law", value: "newton's law" },
            // ...etc
          ]
        }
      ]
    },
    // ...other groups
  ];

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
      <Route path="/mock/:examId" element={<MockExamPage />} />
      <Route path="/json-preview" element={<JsonPreview />} />
      <Route path="/mock-result" element={<MockResultPage />} />
      <Route path="/mock" element={<MockListPage />} />
      <Route path="/mock/:examId" element={<MockExamPage />} />
      <Route path="/test-tree" element={<TestTree />} />
      <Route path="/antd-tree" element={<AntdTreeSelectDemo />} />
    </Routes>
  );
}

export default App;
