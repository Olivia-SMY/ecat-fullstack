// src/components/LoadingLottie.jsx
import React from 'react';
import Lottie from 'lottie-react';
import catAnimation from '../assets/lottie/Cat.json';

const tips = [
  '🐱 喵~ 正在为你召唤题目...',
  '⏳ 稍等片刻，马上开始刷题！',
];
const randomTip = tips[Math.floor(Math.random() * tips.length)];

const LoadingLottie = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <Lottie animationData={catAnimation} loop={true} style={{ width: 200, height: 200 }} />
      <p style={{ marginTop: 20, fontSize: '16px', color: '#444' }}>{randomTip}</p>
    </div>
  );
};

export default LoadingLottie;
