// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import TestSupabase from './pages/TestSupabase';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyRecordsPage from './pages/MyRecordsPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import ResetPasswordPage from './pages/ResetPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
function App() {
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
            <ResultPage />
          </ProtectedRoute>
        }
      />

      <Route path="/test-supabase" element={<TestSupabase />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/records" element={<MyRecordsPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
    </Routes>
  );
}

export default App;
